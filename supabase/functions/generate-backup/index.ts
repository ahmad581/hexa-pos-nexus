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

// Define which tables are relevant for each business type
const businessTypeDataMap: Record<string, string[]> = {
  'restaurant': ['menu_items', 'orders', 'order_items', 'tables'],
  'cafe': ['menu_items', 'orders', 'order_items', 'tables'],
  'hotel': ['rooms', 'services'],
  'salon': ['stylists', 'appointments', 'services'],
  'barbershop': ['stylists', 'appointments', 'services'],
  'spa': ['stylists', 'appointments', 'services'],
  'gym': ['members', 'services'],
  'fitness': ['members', 'services'],
  'pharmacy': ['prescriptions', 'products'],
  'retail': ['products'],
  'grocery': ['products'],
  'pet-care': ['appointments', 'services'],
  'auto-repair': ['appointments', 'services'],
  'clinic': ['appointments', 'prescriptions', 'services'],
  'healthcare': ['appointments', 'prescriptions', 'services'],
};

// Universal tables that apply to all business types
const universalTables = [
  'branch_settings',
  'employees',
  'inventory_items',
  'inventory_transactions',
  'employee_loans',
  'loan_payments',
  'loan_settings',
  'employee_work_sessions',
  'employee_daily_summaries',
  'employee_documents',
];

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

function getTableDisplayName(tableName: string): string {
  const displayNames: Record<string, string> = {
    'branch_settings': 'Branch Settings',
    'employees': 'Employees',
    'menu_items': 'Menu Items',
    'orders': 'Orders',
    'order_items': 'Order Items',
    'tables': 'Tables',
    'inventory_items': 'Inventory Items',
    'inventory_transactions': 'Inventory Transactions',
    'appointments': 'Appointments',
    'members': 'Members',
    'products': 'Products',
    'prescriptions': 'Prescriptions',
    'rooms': 'Rooms',
    'services': 'Services',
    'stylists': 'Stylists',
    'employee_loans': 'Employee Loans',
    'loan_payments': 'Loan Payments',
    'loan_settings': 'Loan Settings',
    'employee_work_sessions': 'Work Sessions',
    'employee_daily_summaries': 'Daily Summaries',
    'employee_documents': 'Employee Documents',
  };
  return displayNames[tableName] || tableName;
}

async function fetchTableData(supabase: any, tableName: string, branchId: string): Promise<any[]> {
  let query;
  
  switch (tableName) {
    case 'order_items':
      // Join with orders to filter by branch
      const { data: orderIds } = await supabase
        .from('orders')
        .select('id')
        .eq('branch_id', branchId);
      
      if (!orderIds || orderIds.length === 0) return [];
      
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds.map((o: any) => o.id));
      
      return orderItems || [];
      
    case 'inventory_transactions':
      // Join with inventory_items to filter by branch
      const { data: itemIds } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('branch_id', branchId);
      
      if (!itemIds || itemIds.length === 0) return [];
      
      const { data: transactions } = await supabase
        .from('inventory_transactions')
        .select('*')
        .in('inventory_item_id', itemIds.map((i: any) => i.id));
      
      return transactions || [];
      
    default:
      // Standard branch_id filter
      const { data } = await supabase
        .from(tableName)
        .select('*')
        .eq('branch_id', branchId);
      
      return data || [];
  }
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

    // Get the branch to determine business type
    const { data: branch, error: branchError } = await supabase
      .from('branches')
      .select('business_type, name')
      .eq('id', branch_id)
      .single();

    if (branchError || !branch) {
      return new Response(
        JSON.stringify({ error: 'Branch not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const businessType = branch.business_type?.toLowerCase() || 'restaurant';
    console.log(`Starting backup for branch: ${branch_id}, business type: ${businessType}, backup type: ${backup_type}`);

    // Get tables to backup based on business type
    const businessSpecificTables = businessTypeDataMap[businessType] || [];
    const tablesToBackup = [...universalTables, ...businessSpecificTables];
    
    // Remove duplicates
    const uniqueTables = [...new Set(tablesToBackup)];

    console.log(`Tables to backup: ${uniqueTables.join(', ')}`);

    // Fetch data for each table
    const tableDataPromises = uniqueTables.map(async (tableName) => {
      try {
        const data = await fetchTableData(supabase, tableName, branch_id);
        return { tableName, data };
      } catch (error) {
        console.error(`Error fetching ${tableName}:`, error);
        return { tableName, data: [] };
      }
    });

    const tableResults = await Promise.all(tableDataPromises);

    // Generate CSV content
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const csvSections = [
      `# Branch Backup - ${branch.name || branch_id}`,
      `# Business Type: ${businessType}`,
      `# Generated: ${new Date().toISOString()}`,
      `# Type: ${backup_type}`,
      `# Tables included: ${uniqueTables.length}`,
      '',
      ...tableResults.map(({ tableName, data }) => 
        convertToCSV(data, getTableDisplayName(tableName))
      ),
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
          file_path: filePath,
          tables_included: uniqueTables.length,
          business_type: businessType
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
