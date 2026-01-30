import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = 'https://fcdfephraaiusolzfdvf.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    // Handle incoming call from Twilio
    if (action === 'incoming') {
      const formData = await req.formData();
      const callerPhone = formData.get('From') as string;
      const calledNumber = formData.get('To') as string;
      const callSid = formData.get('CallSid') as string;

      // Find the business associated with this phone number
      const { data: callCenterNumber } = await supabase
        .from('call_center_numbers')
        .select('id, business_id')
        .eq('phone_number', calledNumber)
        .eq('is_active', true)
        .single();

      if (!callCenterNumber) {
        // Return TwiML to reject the call if no business found
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?>
           <Response>
             <Say>Sorry, this number is not configured.</Say>
             <Hangup/>
           </Response>`,
          { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
        );
      }

      // Add call to queue
      const { data: queuedCall, error: queueError } = await supabase
        .from('call_queue')
        .insert({
          business_id: callCenterNumber.business_id,
          call_center_number_id: callCenterNumber.id,
          caller_phone: callerPhone,
          twilio_call_sid: callSid,
          status: 'ringing',
          priority: 'medium',
          call_type: 'general',
        })
        .select()
        .single();

      if (queueError) {
        console.error('Error adding to queue:', queueError);
      }

      // Return TwiML to put caller on hold with music
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
         <Response>
           <Say>Thank you for calling. Please hold while we connect you to an agent.</Say>
           <Enqueue waitUrl="/functions/v1/twilio-webhook/wait">support</Enqueue>
         </Response>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      );
    }

    // Handle wait queue music/messages
    if (action === 'wait') {
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
         <Response>
           <Say>Your call is important to us. Please continue to hold.</Say>
           <Play>http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-B8.mp3</Play>
         </Response>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      );
    }

    // Handle call status updates
    if (action === 'status') {
      const formData = await req.formData();
      const callSid = formData.get('CallSid') as string;
      const callStatus = formData.get('CallStatus') as string;
      const callDuration = formData.get('CallDuration') as string;

      let dbStatus = callStatus;
      if (callStatus === 'completed') dbStatus = 'completed';
      if (callStatus === 'busy' || callStatus === 'no-answer') dbStatus = 'missed';
      if (callStatus === 'canceled') dbStatus = 'abandoned';

      // Update call queue
      const { data: call } = await supabase
        .from('call_queue')
        .update({ 
          status: dbStatus,
          completed_at: callStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('twilio_call_sid', callSid)
        .select()
        .single();

      // Add to call history if call ended
      if (['completed', 'missed', 'abandoned'].includes(dbStatus) && call) {
        await supabase.from('call_history').insert({
          business_id: call.business_id,
          call_queue_id: call.id,
          caller_phone: call.caller_phone,
          caller_name: call.caller_name,
          call_type: call.call_type,
          direction: 'inbound',
          status: dbStatus,
          duration_seconds: parseInt(callDuration) || 0,
          handled_by: call.answered_by,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle recording callback
    if (action === 'recording') {
      const formData = await req.formData();
      const callSid = formData.get('CallSid') as string;
      const recordingUrl = formData.get('RecordingUrl') as string;
      const recordingDuration = formData.get('RecordingDuration') as string;

      await supabase
        .from('call_history')
        .update({
          recording_url: recordingUrl,
          recording_duration_seconds: parseInt(recordingDuration) || 0,
        })
        .eq('twilio_call_sid', callSid);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // API endpoints for frontend
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Answer a call
    if (action === 'answer' && req.method === 'POST') {
      const { callId } = await req.json();
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        return new Response(JSON.stringify({ error: 'Profile not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: call, error } = await supabase
        .from('call_queue')
        .update({
          status: 'answered',
          answered_by: profile.id,
          answered_at: new Date().toISOString(),
        })
        .eq('id', callId)
        .in('status', ['ringing', 'queued'])
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Call already answered or not found' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // TODO: Use Twilio API to connect the call to the agent

      return new Response(JSON.stringify({ success: true, call }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Put call on hold
    if (action === 'hold' && req.method === 'POST') {
      const { callId } = await req.json();

      const { data: call, error } = await supabase
        .from('call_queue')
        .update({ status: 'on_hold' })
        .eq('id', callId)
        .eq('status', 'answered')
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Cannot put call on hold' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, call }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Transfer call
    if (action === 'transfer' && req.method === 'POST') {
      const { callId, transferToProfileId } = await req.json();

      const { data: call, error } = await supabase
        .from('call_queue')
        .update({
          status: 'transferred',
          transferred_to: transferToProfileId,
          transferred_at: new Date().toISOString(),
        })
        .eq('id', callId)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Cannot transfer call' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create new queue entry for transferred call
      await supabase.from('call_queue').insert({
        business_id: call.business_id,
        call_center_number_id: call.call_center_number_id,
        caller_phone: call.caller_phone,
        caller_name: call.caller_name,
        caller_address: call.caller_address,
        twilio_call_sid: call.twilio_call_sid + '_transfer',
        status: 'ringing',
        priority: call.priority,
        call_type: call.call_type,
        answered_by: transferToProfileId,
      });

      return new Response(JSON.stringify({ success: true, call }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // End call
    if (action === 'end' && req.method === 'POST') {
      const { callId, notes, outcome } = await req.json();

      const { data: call, error } = await supabase
        .from('call_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', callId)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: 'Cannot end call' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Calculate duration
      const startTime = new Date(call.created_at);
      const endTime = new Date();
      const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Add to history
      await supabase.from('call_history').insert({
        business_id: call.business_id,
        call_queue_id: call.id,
        caller_phone: call.caller_phone,
        caller_name: call.caller_name,
        call_type: call.call_type,
        direction: 'inbound',
        status: 'completed',
        duration_seconds: durationSeconds,
        handled_by: call.answered_by,
        notes,
        outcome,
      });

      return new Response(JSON.stringify({ success: true, call }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
