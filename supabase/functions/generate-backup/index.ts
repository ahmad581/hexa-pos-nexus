import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BackupRequest {
  branch_id: string;
  backup_type?: 'manual' | 'automatic';
  save_to_storage?: boolean;
}

function convertToCSV(data: any[], tableName: string): string {
  if (!data || data.length === 0) {
    return `# ${tableName}\n# No data\n\n`;
  }
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    `# ${tableName}`,
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      }).join(',')
    ),
    ''
  ];
  
  return csvRows.join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token for auth check
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for data access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { branch_id, backup_type = 'manual', save_to_storage = false }: BackupRequest = await req.json();

    if (!branch_id) {
      return new Response(
        JSON.stringify({ error: 'branch_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting backup for branch: ${branch_id}, type: ${backup_type}`);

    // Fetch all branch data
    const [
      settingsResult,
      employeesResult,
      menuItemsResult,
      ordersResult,
      orderItemsResult,
      tablesResult,
      inventoryItemsResult,
      inventoryTransactionsResult,
      appointmentsResult,
      membersResult,
      productsResult,
      prescriptionsResult,
      roomsResult,
      servicesResult,
      stylistsResult,
      loansResult,
      loanPaymentsResult,
      loanSettingsResult,
      workSessionsResult,
      dailySummariesResult,
      documentsResult
    ] = await Promise.all([
      supabase.from('branch_settings').select('*').eq('branch_id', branch_id),
      supabase.from('employees').select('*').eq('branch_id', branch_id),
      supabase.from('menu_items').select('*').eq('branch_id', branch_id),
      supabase.from('orders').select('*').eq('branch_id', branch_id),
      supabase.from('order_items').select('*, orders!inner(branch_id)').eq('orders.branch_id', branch_id),
      supabase.from('tables').select('*').eq('branch_id', branch_id),
      supabase.from('inventory_items').select('*').eq('branch_id', branch_id),
      supabase.from('inventory_transactions').select('*, inventory_items!inner(branch_id)').eq('inventory_items.branch_id', branch_id),
      supabase.from('appointments').select('*').eq('branch_id', branch_id),
      supabase.from('members').select('*').eq('branch_id', branch_id),
      supabase.from('products').select('*').eq('branch_id', branch_id),
      supabase.from('prescriptions').select('*').eq('branch_id', branch_id),
      supabase.from('rooms').select('*').eq('branch_id', branch_id),
      supabase.from('services').select('*').eq('branch_id', branch_id),
      supabase.from('stylists').select('*').eq('branch_id', branch_id),
      supabase.from('employee_loans').select('*').eq('branch_id', branch_id),
      supabase.from('loan_payments').select('*').eq('branch_id', branch_id),
      supabase.from('loan_settings').select('*').eq('branch_id', branch_id),
      supabase.from('employee_work_sessions').select('*').eq('branch_id', branch_id),
      supabase.from('employee_daily_summaries').select('*').eq('branch_id', branch_id),
      supabase.from('employee_documents').select('*').eq('branch_id', branch_id),
    ]);

    // Generate CSV content
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const csvSections = [
      `# Branch Backup - ${branch_id}`,
      `# Generated: ${new Date().toISOString()}`,
      `# Type: ${backup_type}`,
      '',
      convertToCSV(settingsResult.data || [], 'Branch Settings'),
      convertToCSV(employeesResult.data || [], 'Employees'),
      convertToCSV(menuItemsResult.data || [], 'Menu Items'),
      convertToCSV(ordersResult.data || [], 'Orders'),
      convertToCSV(orderItemsResult.data || [], 'Order Items'),
      convertToCSV(tablesResult.data || [], 'Tables'),
      convertToCSV(inventoryItemsResult.data || [], 'Inventory Items'),
      convertToCSV(inventoryTransactionsResult.data || [], 'Inventory Transactions'),
      convertToCSV(appointmentsResult.data || [], 'Appointments'),
      convertToCSV(membersResult.data || [], 'Members'),
      convertToCSV(productsResult.data || [], 'Products'),
      convertToCSV(prescriptionsResult.data || [], 'Prescriptions'),
      convertToCSV(roomsResult.data || [], 'Rooms'),
      convertToCSV(servicesResult.data || [], 'Services'),
      convertToCSV(stylistsResult.data || [], 'Stylists'),
      convertToCSV(loansResult.data || [], 'Employee Loans'),
      convertToCSV(loanPaymentsResult.data || [], 'Loan Payments'),
      convertToCSV(loanSettingsResult.data || [], 'Loan Settings'),
      convertToCSV(workSessionsResult.data || [], 'Work Sessions'),
      convertToCSV(dailySummariesResult.data || [], 'Daily Summaries'),
      convertToCSV(documentsResult.data || [], 'Employee Documents'),
    ];

    const csvContent = csvSections.join('\n');
    const fileName = `backup-${branch_id}-${timestamp}.csv`;

    // If saving to storage (for automatic backups)
    if (save_to_storage) {
      const filePath = `${branch_id}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('branch-backups')
        .upload(filePath, csvContent, {
          contentType: 'text/csv',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Record in backup history
      await supabase.from('backup_history').insert({
        branch_id,
        backup_type,
        file_path: filePath,
        file_size: new Blob([csvContent]).size,
        status: 'completed',
        created_by: user.id
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Backup saved to storage',
          file_path: filePath 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For manual download, return the CSV directly
    return new Response(csvContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      }
    });

  } catch (error) {
    console.error('Backup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
