import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the request body
    const { 
      name, 
      email, 
      password, 
      business_type, 
      icon, 
      category, 
      features,
      telephony_provider,
      phone_number
    } = await req.json()

    // Validate required fields
    if (!name || !email || !password || !business_type) {
      throw new Error('Missing required fields')
    }

    // Normalize email for consistent comparisons
    const normalizedEmail = (email || '').toLowerCase().trim()

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // 2. Create custom business first
    const { data: business, error: businessError } = await supabaseAdmin
      .from('custom_businesses')
      .insert({
        user_id: authData.user.id,
        name,
        business_type,
        icon,
        category,
        terminology: {
          branch: "Branch",
          branches: "Branches",
          unit: "Unit",
          units: "Units",
          customer: "Customer",
          customers: "Customers",
          service: "Service",
          services: "Services"
        }
      })
      .select()
      .single()

    if (businessError) throw businessError

    // 3. Create profile with SuperManager role and business_id
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email,
        first_name: name.split(' ')[0] || name,
        last_name: name.split(' ').slice(1).join(' ') || '',
        primary_role: 'SuperManager',
        business_id: business.id,
        is_active: true,
      })

    if (profileError) throw profileError

    // 4. Create user_roles entry
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'SuperManager',
        is_active: true,
      })

    if (roleError) throw roleError

    // 5. Add selected features to business
    if (features && features.length > 0) {
      const featureInserts = features.map((featureId: string) => ({
        business_id: business.id,
        feature_id: featureId
      }))

      const { error: featuresError } = await supabaseAdmin
        .from('business_features')
        .insert(featureInserts)

      if (featuresError) throw featuresError
    }

    // 6. Set up telephony provider if specified
    let telephonyProviderRecord = null;
    let phoneNumberRecord = null;

    if (telephony_provider) {
      // Create telephony provider
      const { data: provider, error: providerError } = await supabaseAdmin
        .from('telephony_providers')
        .insert({
          business_id: business.id,
          provider_type: telephony_provider.type || 'mock',
          display_name: telephony_provider.display_name || `${telephony_provider.type || 'Mock'} Provider`,
          config: telephony_provider.config || {},
          is_active: true,
          is_default: true,
          webhook_mode: telephony_provider.webhook_mode || null,
        })
        .select()
        .single();

      if (providerError) {
        console.error('Error creating telephony provider:', providerError);
      } else {
        telephonyProviderRecord = provider;

        // If phone number is provided, add it
        if (phone_number) {
          const { data: phoneNum, error: phoneError } = await supabaseAdmin
            .from('business_phone_numbers')
            .insert({
              business_id: business.id,
              provider_id: provider.id,
              phone_number: phone_number.number,
              display_name: phone_number.display_name || 'Primary Number',
              is_default: true,
              capabilities: phone_number.capabilities || ['inbound', 'outbound'],
              external_id: phone_number.external_id || null,
              is_active: true,
            })
            .select()
            .single();

          if (phoneError) {
            console.error('Error creating phone number:', phoneError);
          } else {
            phoneNumberRecord = phoneNum;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: authData.user,
        business,
        telephonyProvider: telephonyProviderRecord,
        phoneNumber: phoneNumberRecord,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error creating client:', error)
    
    // Map to safe user-facing error messages
    let userMessage = 'Failed to create client. Please try again.';
    const errorMessage = error instanceof Error ? error.message : '';
    
    if (errorMessage.includes('duplicate') || errorMessage.includes('already exists') || errorMessage.includes('already registered')) {
      userMessage = 'An account with this email already exists.';
    } else if (errorMessage.includes('Missing required fields')) {
      userMessage = 'Please fill in all required fields.';
    } else if (errorMessage.includes('invalid') && errorMessage.includes('email')) {
      userMessage = 'Please enter a valid email address.';
    }
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})