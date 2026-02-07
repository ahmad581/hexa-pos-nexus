import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DatabaseEmployee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  position: string;
  department: string | null;
  branch_id: string;
  hire_date: string;
  salary: number | null;
  hourly_rate: number | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkSession {
  id: string;
  employee_id: string;
  branch_id: string;
  check_in_time: string;
  check_out_time: string | null;
  break_duration: number | null;
  session_type: string | null;
  location: string | null;
  notes: string | null;
}

export interface DailySummary {
  id: string;
  employee_id: string;
  branch_id: string;
  work_date: string;
  total_hours: number | null;
  total_earnings: number | null;
  regular_hours: number | null;
  overtime_hours: number | null;
  session_count: number | null;
  first_check_in: string | null;
  last_check_out: string | null;
}

export const useEmployees = (branchId?: string) => {
  const queryClient = useQueryClient();

  // Fetch employees for a branch - ONLY if branchId is provided
  // This prevents cross-business data leakage
  const { data: employees = [], isLoading, refetch } = useQuery({
    queryKey: ['employees', branchId],
    queryFn: async () => {
      // Don't fetch if no branch is selected - prevents showing all employees across businesses
      if (!branchId) {
        return [] as DatabaseEmployee[];
      }
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('branch_id', branchId)
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      return data as DatabaseEmployee[];
    },
    enabled: !!branchId, // Only run query when branchId is available
  });

  // Fetch today's work sessions for employees
  const { data: todaySessions = [] } = useQuery({
    queryKey: ['employee-sessions-today', branchId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      let query = supabase
        .from('employee_work_sessions')
        .select('*')
        .gte('check_in_time', `${today}T00:00:00`)
        .lte('check_in_time', `${today}T23:59:59`);
      
      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WorkSession[];
    },
  });

  // Check if an employee is currently checked in
  const isEmployeeCheckedIn = (employeeId: string) => {
    const sessions = todaySessions.filter(s => s.employee_id === employeeId);
    const lastSession = sessions.sort((a, b) => 
      new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime()
    )[0];
    return lastSession && !lastSession.check_out_time;
  };

  // Get current session for an employee
  const getCurrentSession = (employeeId: string) => {
    const sessions = todaySessions.filter(s => s.employee_id === employeeId);
    return sessions.find(s => !s.check_out_time);
  };

  // Check in mutation
  const checkIn = useMutation({
    mutationFn: async ({ employeeId, branchId }: { employeeId: string; branchId: string }) => {
      const { data, error } = await supabase
        .from('employee_work_sessions')
        .insert({
          employee_id: employeeId,
          branch_id: branchId,
          check_in_time: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-sessions-today'] });
      toast.success('Checked in successfully');
    },
    onError: (error) => {
      toast.error('Failed to check in: ' + error.message);
    },
  });

  // Check out mutation
  const checkOut = useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      const { data, error } = await supabase
        .from('employee_work_sessions')
        .update({
          check_out_time: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-sessions-today'] });
      queryClient.invalidateQueries({ queryKey: ['employee-daily-summaries'] });
      toast.success('Checked out successfully');
    },
    onError: (error) => {
      toast.error('Failed to check out: ' + error.message);
    },
  });

  // Add employee mutation
  const addEmployee = useMutation({
    mutationFn: async (employee: Omit<DatabaseEmployee, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add employee: ' + error.message);
    },
  });

  // Update employee mutation
  const updateEmployee = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DatabaseEmployee> & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update employee: ' + error.message);
    },
  });

  // Delete (deactivate) employee mutation
  const deleteEmployee = useMutation({
    mutationFn: async (employeeId: string) => {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: false })
        .eq('id', employeeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove employee: ' + error.message);
    },
  });

  // Fetch daily summaries for employees
  const { data: dailySummaries = [] } = useQuery({
    queryKey: ['employee-daily-summaries', branchId],
    queryFn: async () => {
      let query = supabase
        .from('employee_daily_summaries')
        .select('*')
        .order('work_date', { ascending: false })
        .limit(100);
      
      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DailySummary[];
    },
  });

  return {
    employees,
    isLoading,
    refetch,
    todaySessions,
    dailySummaries,
    isEmployeeCheckedIn,
    getCurrentSession,
    checkIn,
    checkOut,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  };
};
