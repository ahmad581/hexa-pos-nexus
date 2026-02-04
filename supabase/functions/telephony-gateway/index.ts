import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const supabaseUrl = 'https://fcdfephraaiusolzfdvf.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// =====================================================
// TYPES
// =====================================================

type TelephonyProviderType = 'twilio' | 'sip' | 'pbx' | 'mock';

interface CallResult {
  success: boolean;
  externalCallId?: string;
  error?: string;
  errorCode?: string;
  retryable?: boolean;
}

interface NormalizedCallEvent {
  eventType: 'incoming' | 'ringing' | 'answered' | 'hold' | 'transfer' | 'ended' | 'recording' | 'failed';
  externalCallId: string;
  callerPhone: string;
  calledNumber: string;
  status: string;
  duration?: number;
  recordingUrl?: string;
  originalData: unknown;
}

interface ProviderConfig {
  providerType: TelephonyProviderType;
  config: Record<string, unknown>;
}

// =====================================================
// PROVIDER INTERFACE
// =====================================================

interface ITelephonyProvider {
  readonly type: TelephonyProviderType;
  
  // Call lifecycle
  initiateCall(params: InitiateCallParams): Promise<CallResult>;
  answerCall(callId: string, agentId: string): Promise<CallResult>;
  holdCall(callId: string): Promise<CallResult>;
  resumeCall(callId: string): Promise<CallResult>;
  transferCall(callId: string, targetExtension: string): Promise<CallResult>;
  endCall(callId: string, reason?: string): Promise<CallResult>;
  
  // Webhook handling
  parseWebhookEvent(request: Request): Promise<NormalizedCallEvent>;
  generateCallResponse(event: NormalizedCallEvent): Response;
}

interface InitiateCallParams {
  fromNumber: string;
  toNumber: string;
  businessId: string;
  agentId: string;
  metadata?: Record<string, string>;
}

// =====================================================
// TWILIO PROVIDER
// =====================================================

class TwilioProvider implements ITelephonyProvider {
  readonly type: TelephonyProviderType = 'twilio';
  private config: Record<string, unknown>;
  
  constructor(config: Record<string, unknown>) {
    this.config = config;
  }
  
  async initiateCall(params: InitiateCallParams): Promise<CallResult> {
    try {
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      
      if (!accountSid || !authToken) {
        return { success: false, error: 'Twilio credentials not configured', errorCode: 'MISSING_CREDENTIALS', retryable: false };
      }
      
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
      const auth = btoa(`${accountSid}:${authToken}`);
      
      const body = new URLSearchParams({
        From: params.fromNumber,
        To: params.toNumber,
        Url: `${supabaseUrl}/functions/v1/telephony-gateway/twilio/outbound-connect`,
      });
      
      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return { 
          success: false, 
          error: error.message || 'Failed to initiate call',
          errorCode: error.code,
          retryable: response.status >= 500 
        };
      }
      
      const data = await response.json();
      return { success: true, externalCallId: data.sid };
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        errorCode: 'NETWORK_ERROR',
        retryable: true 
      };
    }
  }
  
  async answerCall(callId: string, agentId: string): Promise<CallResult> {
    // For Twilio, answering is handled by updating the call queue status
    // The actual Twilio call connection happens via TwiML
    return { success: true, externalCallId: callId };
  }
  
  async holdCall(callId: string): Promise<CallResult> {
    // Twilio hold is handled via call queue status update
    return { success: true, externalCallId: callId };
  }
  
  async resumeCall(callId: string): Promise<CallResult> {
    return { success: true, externalCallId: callId };
  }
  
  async transferCall(callId: string, targetExtension: string): Promise<CallResult> {
    return { success: true, externalCallId: callId };
  }
  
  async endCall(callId: string, reason?: string): Promise<CallResult> {
    try {
      const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      
      if (!accountSid || !authToken) {
        return { success: true }; // Still mark as success since we'll update DB
      }
      
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${callId}.json`;
      const auth = btoa(`${accountSid}:${authToken}`);
      
      await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'Status=completed',
      });
      
      return { success: true, externalCallId: callId };
    } catch (error) {
      // Even if Twilio fails, we still want to clean up locally
      return { success: true, externalCallId: callId };
    }
  }
  
  async parseWebhookEvent(request: Request): Promise<NormalizedCallEvent> {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const duration = formData.get('CallDuration') as string;
    
    let eventType: NormalizedCallEvent['eventType'] = 'incoming';
    let status = callStatus;
    
    switch (callStatus) {
      case 'ringing':
        eventType = 'ringing';
        break;
      case 'in-progress':
        eventType = 'answered';
        status = 'answered';
        break;
      case 'completed':
        eventType = 'ended';
        status = 'completed';
        break;
      case 'busy':
      case 'no-answer':
        eventType = 'ended';
        status = 'missed';
        break;
      case 'canceled':
        eventType = 'ended';
        status = 'abandoned';
        break;
      case 'failed':
        eventType = 'failed';
        status = 'failed';
        break;
    }
    
    return {
      eventType,
      externalCallId: callSid,
      callerPhone: from,
      calledNumber: to,
      status,
      duration: duration ? parseInt(duration) : undefined,
      originalData: Object.fromEntries(formData.entries()),
    };
  }
  
  generateCallResponse(event: NormalizedCallEvent): Response {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Thank you for calling. Please hold while we connect you to an agent.</Say>
        <Enqueue waitUrl="${supabaseUrl}/functions/v1/telephony-gateway/twilio/wait">support</Enqueue>
      </Response>`;
    
    return new Response(twiml, {
      headers: { ...corsHeaders, 'Content-Type': 'text/xml' },
    });
  }
}

// =====================================================
// SIP/PBX PROVIDER
// =====================================================

class SipPbxProvider implements ITelephonyProvider {
  readonly type: TelephonyProviderType = 'sip';
  private config: Record<string, unknown>;
  
  constructor(config: Record<string, unknown>) {
    this.config = config;
  }
  
  async initiateCall(params: InitiateCallParams): Promise<CallResult> {
    // SIP/PBX outbound calls would be handled via AMI or HTTP API
    // This is a placeholder for the generic implementation
    const amiHost = this.config.amiHost as string;
    const amiPort = this.config.amiPort as number || 5038;
    
    if (!amiHost) {
      return { 
        success: false, 
        error: 'SIP/PBX not configured',
        errorCode: 'NOT_CONFIGURED',
        retryable: false 
      };
    }
    
    // Placeholder: In a real implementation, this would:
    // 1. Connect to AMI via WebSocket or HTTP
    // 2. Send an Originate action
    // 3. Return the channel ID as externalCallId
    
    const externalCallId = `SIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { success: true, externalCallId };
  }
  
  async answerCall(callId: string, agentId: string): Promise<CallResult> {
    return { success: true, externalCallId: callId };
  }
  
  async holdCall(callId: string): Promise<CallResult> {
    return { success: true, externalCallId: callId };
  }
  
  async resumeCall(callId: string): Promise<CallResult> {
    return { success: true, externalCallId: callId };
  }
  
  async transferCall(callId: string, targetExtension: string): Promise<CallResult> {
    return { success: true, externalCallId: callId };
  }
  
  async endCall(callId: string, reason?: string): Promise<CallResult> {
    return { success: true, externalCallId: callId };
  }
  
  async parseWebhookEvent(request: Request): Promise<NormalizedCallEvent> {
    const body = await request.json();
    
    // Handle Asterisk AMI-style events or FreePBX webhooks
    const eventType = body.event?.toLowerCase() || body.Event?.toLowerCase() || 'incoming';
    const channel = body.channel || body.Channel || '';
    const callerId = body.caller_id || body.CallerIDNum || body.from || '';
    const destination = body.destination || body.Exten || body.to || '';
    
    let normalizedEventType: NormalizedCallEvent['eventType'] = 'incoming';
    let status = 'ringing';
    
    if (eventType.includes('newchannel') || eventType === 'incoming_call') {
      normalizedEventType = 'incoming';
      status = 'ringing';
    } else if (eventType.includes('answer')) {
      normalizedEventType = 'answered';
      status = 'answered';
    } else if (eventType.includes('hangup') || eventType === 'call_ended') {
      normalizedEventType = 'ended';
      status = body.cause === '16' ? 'completed' : 'missed';
    } else if (eventType.includes('hold')) {
      normalizedEventType = 'hold';
      status = 'on_hold';
    }
    
    return {
      eventType: normalizedEventType,
      externalCallId: channel || `SIP-${Date.now()}`,
      callerPhone: callerId,
      calledNumber: destination,
      status,
      originalData: body,
    };
  }
  
  generateCallResponse(event: NormalizedCallEvent): Response {
    // SIP/PBX doesn't need TwiML-style responses
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// =====================================================
// MOCK PROVIDER (for development/testing)
// =====================================================

class MockProvider implements ITelephonyProvider {
  readonly type: TelephonyProviderType = 'mock';
  
  async initiateCall(params: InitiateCallParams): Promise<CallResult> {
    const externalCallId = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('[MockProvider] Initiating call:', params, externalCallId);
    return { success: true, externalCallId };
  }
  
  async answerCall(callId: string, agentId: string): Promise<CallResult> {
    console.log('[MockProvider] Answering call:', callId, 'by agent:', agentId);
    return { success: true, externalCallId: callId };
  }
  
  async holdCall(callId: string): Promise<CallResult> {
    console.log('[MockProvider] Holding call:', callId);
    return { success: true, externalCallId: callId };
  }
  
  async resumeCall(callId: string): Promise<CallResult> {
    console.log('[MockProvider] Resuming call:', callId);
    return { success: true, externalCallId: callId };
  }
  
  async transferCall(callId: string, targetExtension: string): Promise<CallResult> {
    console.log('[MockProvider] Transferring call:', callId, 'to:', targetExtension);
    return { success: true, externalCallId: callId };
  }
  
  async endCall(callId: string, reason?: string): Promise<CallResult> {
    console.log('[MockProvider] Ending call:', callId, 'reason:', reason);
    return { success: true, externalCallId: callId };
  }
  
  async parseWebhookEvent(request: Request): Promise<NormalizedCallEvent> {
    const body = await request.json();
    return {
      eventType: body.eventType || 'incoming',
      externalCallId: body.callId || `MOCK-${Date.now()}`,
      callerPhone: body.from || '+15551234567',
      calledNumber: body.to || '+15559876543',
      status: body.status || 'ringing',
      originalData: body,
    };
  }
  
  generateCallResponse(event: NormalizedCallEvent): Response {
    return new Response(JSON.stringify({ success: true, mock: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// =====================================================
// PROVIDER FACTORY
// =====================================================

function getProvider(providerType: TelephonyProviderType, config: Record<string, unknown> = {}): ITelephonyProvider {
  switch (providerType) {
    case 'twilio':
      return new TwilioProvider(config);
    case 'sip':
    case 'pbx':
      return new SipPbxProvider(config);
    case 'mock':
    default:
      return new MockProvider();
  }
}

async function getProviderForBusiness(supabase: any, businessId: string): Promise<{ provider: ITelephonyProvider; providerRecord: any }> {
  // Get the default provider for this business
  const { data: providerRecord, error } = await supabase
    .from('telephony_providers')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .eq('is_default', true)
    .single();
  
  if (error || !providerRecord) {
    // Fall back to mock provider if no provider configured
    return { 
      provider: new MockProvider(), 
      providerRecord: { provider_type: 'mock', config: {} } 
    };
  }
  
  return {
    provider: getProvider(providerRecord.provider_type, providerRecord.config || {}),
    providerRecord,
  };
}

// =====================================================
// EVENT LOGGING
// =====================================================

async function logCallEvent(
  supabase: any,
  businessId: string,
  providerType: string,
  eventType: string,
  eventData: unknown,
  externalCallId?: string,
  callQueueId?: string,
  errorCode?: string,
  errorMessage?: string
) {
  try {
    await supabase.from('call_events').insert({
      business_id: businessId,
      provider_type: providerType,
      event_type: eventType,
      event_data: eventData,
      external_call_id: externalCallId,
      call_queue_id: callQueueId,
      error_code: errorCode,
      error_message: errorMessage,
    });
  } catch (error) {
    console.error('Failed to log call event:', error);
  }
}

// =====================================================
// MAIN HANDLER
// =====================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Path structure: /telephony-gateway/{provider}/{action}
    // or: /telephony-gateway/{action} (for authenticated agent actions)
    const lastPart = pathParts[pathParts.length - 1];
    const secondLastPart = pathParts[pathParts.length - 2];
    
    // Check if this is a provider-specific webhook
    const isProviderWebhook = ['twilio', 'sip', 'pbx', 'mock'].includes(secondLastPart);
    const providerType = isProviderWebhook ? secondLastPart as TelephonyProviderType : null;
    const action = lastPart;

    // =====================================================
    // PROVIDER WEBHOOKS (unauthenticated, from providers)
    // =====================================================
    
    // Twilio incoming call
    if (providerType === 'twilio' && action === 'incoming') {
      const provider = getProvider('twilio');
      const event = await provider.parseWebhookEvent(req.clone());
      
      // Find the business associated with this phone number
      const { data: phoneNumber } = await supabase
        .from('business_phone_numbers')
        .select('id, business_id, provider_id')
        .eq('phone_number', event.calledNumber)
        .eq('is_active', true)
        .single();
      
      if (!phoneNumber) {
        // Try legacy call_center_numbers table
        const { data: legacyNumber } = await supabase
          .from('call_center_numbers')
          .select('id, business_id')
          .eq('phone_number', event.calledNumber)
          .eq('is_active', true)
          .single();
        
        if (!legacyNumber) {
          return new Response(
            `<?xml version="1.0" encoding="UTF-8"?>
             <Response>
               <Say>Sorry, this number is not configured.</Say>
               <Hangup/>
             </Response>`,
            { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
          );
        }
        
        // Use legacy flow
        const { error: queueError } = await supabase
          .from('call_queue')
          .insert({
            business_id: legacyNumber.business_id,
            call_center_number_id: legacyNumber.id,
            caller_phone: event.callerPhone,
            twilio_call_sid: event.externalCallId,
            external_call_id: event.externalCallId,
            provider_type: 'twilio',
            original_caller_id: event.callerPhone,
            status: 'ringing',
            priority: 'medium',
            call_type: 'general',
          });
        
        if (queueError) console.error('Error adding to queue:', queueError);
        
        await logCallEvent(supabase, legacyNumber.business_id, 'twilio', 'incoming', event.originalData, event.externalCallId);
        
        return provider.generateCallResponse(event);
      }
      
      // New flow with business_phone_numbers
      const { error: queueError } = await supabase
        .from('call_queue')
        .insert({
          business_id: phoneNumber.business_id,
          phone_number_id: phoneNumber.id,
          caller_phone: event.callerPhone,
          external_call_id: event.externalCallId,
          provider_type: 'twilio',
          original_caller_id: event.callerPhone,
          status: 'ringing',
          priority: 'medium',
          call_type: 'general',
        });
      
      if (queueError) console.error('Error adding to queue:', queueError);
      
      await logCallEvent(supabase, phoneNumber.business_id, 'twilio', 'incoming', event.originalData, event.externalCallId);
      
      return provider.generateCallResponse(event);
    }
    
    // Twilio wait music
    if (providerType === 'twilio' && action === 'wait') {
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
         <Response>
           <Say>Your call is important to us. Please continue to hold.</Say>
           <Play>http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-B8.mp3</Play>
         </Response>`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      );
    }
    
    // Twilio status callback
    if (providerType === 'twilio' && action === 'status') {
      const provider = getProvider('twilio');
      const event = await provider.parseWebhookEvent(req.clone());
      
      // Update call queue
      const { data: call } = await supabase
        .from('call_queue')
        .update({ 
          status: event.status,
          completed_at: event.eventType === 'ended' ? new Date().toISOString() : null,
        })
        .eq('external_call_id', event.externalCallId)
        .select()
        .single();
      
      if (call) {
        await logCallEvent(supabase, call.business_id, 'twilio', event.eventType, event.originalData, event.externalCallId, call.id);
        
        // Add to call history if call ended
        if (event.eventType === 'ended') {
          await supabase.from('call_history').insert({
            business_id: call.business_id,
            call_queue_id: call.id,
            caller_phone: call.caller_phone,
            caller_name: call.caller_name,
            call_type: call.call_type,
            direction: 'inbound',
            status: event.status,
            duration_seconds: event.duration || 0,
            handled_by: call.answered_by,
            provider_type: 'twilio',
            external_call_id: event.externalCallId,
            phone_number_id: call.phone_number_id,
            original_caller_id: call.original_caller_id,
          });
        }
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Twilio recording callback
    if (providerType === 'twilio' && action === 'recording') {
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
        .eq('external_call_id', callSid);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // SIP/PBX webhook (HTTP mode)
    if ((providerType === 'sip' || providerType === 'pbx') && action === 'event') {
      const provider = getProvider(providerType);
      const event = await provider.parseWebhookEvent(req.clone());
      
      // Find call by external ID
      const { data: call } = await supabase
        .from('call_queue')
        .select('*')
        .eq('external_call_id', event.externalCallId)
        .single();
      
      if (call) {
        await supabase.from('call_queue').update({ status: event.status }).eq('id', call.id);
        await logCallEvent(supabase, call.business_id, providerType, event.eventType, event.originalData, event.externalCallId, call.id);
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // =====================================================
    // AUTHENTICATED AGENT ACTIONS
    // =====================================================
    
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
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, business_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get provider for this business
    const { provider, providerRecord } = await getProviderForBusiness(supabase, profile.business_id);

    // Initiate outbound call
    if (action === 'initiate' && req.method === 'POST') {
      const { toNumber, phoneNumberId } = await req.json();
      
      // Get the phone number to use
      let fromNumber: string;
      if (phoneNumberId) {
        const { data: selectedNumber } = await supabase
          .from('business_phone_numbers')
          .select('phone_number')
          .eq('id', phoneNumberId)
          .eq('business_id', profile.business_id)
          .single();
        
        if (!selectedNumber) {
          return new Response(JSON.stringify({ error: 'Phone number not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        fromNumber = selectedNumber.phone_number;
      } else {
        // Use default number
        const { data: defaultNumber } = await supabase
          .from('business_phone_numbers')
          .select('phone_number')
          .eq('business_id', profile.business_id)
          .eq('is_default', true)
          .single();
        
        if (!defaultNumber) {
          return new Response(JSON.stringify({ error: 'No phone number configured' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        fromNumber = defaultNumber.phone_number;
      }
      
      const result = await provider.initiateCall({
        fromNumber,
        toNumber,
        businessId: profile.business_id,
        agentId: profile.id,
      });
      
      if (!result.success) {
        await logCallEvent(supabase, profile.business_id, providerRecord.provider_type, 'initiate_failed', 
          { toNumber, fromNumber }, result.externalCallId, undefined, result.errorCode, result.error);
        
        return new Response(JSON.stringify({ error: result.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Create outbound call in queue
      const { data: call } = await supabase
        .from('call_queue')
        .insert({
          business_id: profile.business_id,
          caller_phone: fromNumber,
          external_call_id: result.externalCallId,
          provider_type: providerRecord.provider_type,
          status: 'ringing',
          priority: 'medium',
          call_type: 'general',
          answered_by: profile.id,
        })
        .select()
        .single();
      
      await logCallEvent(supabase, profile.business_id, providerRecord.provider_type, 'outbound_initiated', 
        { toNumber, fromNumber }, result.externalCallId, call?.id);
      
      return new Response(JSON.stringify({ success: true, call, externalCallId: result.externalCallId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Answer a call
    if (action === 'answer' && req.method === 'POST') {
      const { callId } = await req.json();
      
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
      
      const callProvider = getProvider(call.provider_type || 'twilio', providerRecord.config || {});
      await callProvider.answerCall(call.external_call_id || call.twilio_call_sid, profile.id);
      
      await logCallEvent(supabase, call.business_id, call.provider_type || 'twilio', 'answered', 
        { agentId: profile.id }, call.external_call_id, call.id);

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
      
      const callProvider = getProvider(call.provider_type || 'twilio', providerRecord.config || {});
      await callProvider.holdCall(call.external_call_id || call.twilio_call_sid);
      
      await logCallEvent(supabase, call.business_id, call.provider_type || 'twilio', 'hold', 
        {}, call.external_call_id, call.id);

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
      
      // Get target extension
      const { data: targetExt } = await supabase
        .from('employee_extensions')
        .select('extension_number')
        .eq('profile_id', transferToProfileId)
        .single();
      
      const callProvider = getProvider(call.provider_type || 'twilio', providerRecord.config || {});
      await callProvider.transferCall(call.external_call_id || call.twilio_call_sid, targetExt?.extension_number || '');

      // Create new queue entry for transferred call
      await supabase.from('call_queue').insert({
        business_id: call.business_id,
        phone_number_id: call.phone_number_id,
        caller_phone: call.caller_phone,
        caller_name: call.caller_name,
        caller_address: call.caller_address,
        external_call_id: (call.external_call_id || call.twilio_call_sid) + '_transfer',
        provider_type: call.provider_type || 'twilio',
        original_caller_id: call.original_caller_id,
        status: 'ringing',
        priority: call.priority,
        call_type: call.call_type,
        answered_by: transferToProfileId,
      });
      
      await logCallEvent(supabase, call.business_id, call.provider_type || 'twilio', 'transfer', 
        { transferToProfileId }, call.external_call_id, call.id);

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
      
      const callProvider = getProvider(call.provider_type || 'twilio', providerRecord.config || {});
      await callProvider.endCall(call.external_call_id || call.twilio_call_sid);

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
        provider_type: call.provider_type || 'twilio',
        external_call_id: call.external_call_id,
        phone_number_id: call.phone_number_id,
        original_caller_id: call.original_caller_id,
      });
      
      await logCallEvent(supabase, call.business_id, call.provider_type || 'twilio', 'ended', 
        { notes, outcome, durationSeconds }, call.external_call_id, call.id);

      return new Response(JSON.stringify({ success: true, call }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get available phone numbers for outbound
    if (action === 'phone-numbers' && req.method === 'GET') {
      const { data: numbers } = await supabase
        .from('business_phone_numbers')
        .select('id, phone_number, display_name, is_default, capabilities')
        .eq('business_id', profile.business_id)
        .eq('is_active', true)
        .contains('capabilities', ['outbound']);
      
      return new Response(JSON.stringify({ numbers: numbers || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get telephony provider info
    if (action === 'provider-info' && req.method === 'GET') {
      const { data: providers } = await supabase
        .from('telephony_providers')
        .select('id, provider_type, display_name, is_default, is_active')
        .eq('business_id', profile.business_id);
      
      return new Response(JSON.stringify({ 
        providers: providers || [],
        activeProvider: providerRecord.provider_type,
      }), {
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
