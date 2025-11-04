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
    const { name, email, password, business_type, icon, category, features } = await req.json()

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

    // 2. Create profile with SystemMaster role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email,
        first_name: name.split(' ')[0] || name,
        last_name: name.split(' ').slice(1).join(' ') || '',
        primary_role: 'SystemMaster',
        is_active: true,
      })

    if (profileError) throw profileError

    // 3. Create user_roles entry
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'SystemMaster',
        is_active: true,
      })

    if (roleError) throw roleError

    // 4. Create custom business
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

    return new Response(
      JSON.stringify({
        success: true,
        user: authData.user,
        business
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error creating client:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})