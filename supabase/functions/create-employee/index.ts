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
      email, 
      password, 
      first_name, 
      last_name, 
      role, 
      business_id, 
      branch_id,
      position,
      salary,
      hourly_rate,
      phone
    } = await req.json()

    // Validate required fields
    if (!email || !password || !first_name || !role || !business_id) {
      throw new Error('Missing required fields: email, password, first_name, role, and business_id are required')
    }

    // branch_id is required for employee creation
    if (!branch_id) {
      throw new Error('Branch is required to create an employee')
    }

    // Validate role is a valid app_role
    const validRoles = ['SuperManager', 'Manager', 'Cashier', 'HallManager', 'HrManager', 'CallCenterEmp', 'Employee']
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`)
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // 2. Create profile linked to the existing business
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: normalizedEmail,
        first_name,
        last_name: last_name || '',
        primary_role: role,
        business_id,
        branch_id: branch_id || null,
        is_active: true,
      })
      .select()
      .single()

    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    // 3. Create user_roles entry
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role,
        branch_id: branch_id || null,
        is_active: true,
      })

    if (roleError) {
      // If role creation fails, clean up
      await supabaseAdmin.from('profiles').delete().eq('id', profile.id)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw roleError
    }

    // 4. Create employee record in the employees table
    // Generate employee number (timestamp-based for uniqueness)
    const employeeNumber = `EMP-${Date.now().toString().slice(-8)}`
    
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from('employees')
      .insert({
        employee_number: employeeNumber,
        first_name,
        last_name: last_name || '',
        email: normalizedEmail,
        phone: phone || null,
        position: position || role,
        branch_id,
        hire_date: new Date().toISOString().split('T')[0],
        salary: salary || null,
        hourly_rate: hourly_rate || null,
        is_active: true,
      })
      .select()
      .single()

    if (employeeError) {
      // If employee creation fails, clean up everything
      await supabaseAdmin.from('user_roles').delete().eq('user_id', authData.user.id)
      await supabaseAdmin.from('profiles').delete().eq('id', profile.id)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw employeeError
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: authData.user,
        profile,
        employee
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error creating employee:', error)
    
    // Map to safe user-facing error messages
    let userMessage = 'Failed to create employee. Please try again.';
    const errorMessage = error instanceof Error ? error.message : '';
    
    if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
      userMessage = 'An account with this email already exists.';
    } else if (errorMessage.includes('Missing required fields')) {
      userMessage = 'Please fill in all required fields.';
    } else if (errorMessage.includes('Invalid role')) {
      userMessage = 'Invalid role selected.';
    } else if (errorMessage.includes('Branch is required')) {
      userMessage = 'Please select a branch.';
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
