-- Create employee_work_sessions table for individual check-in/check-out sessions
CREATE TABLE public.employee_work_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out_time TIMESTAMP WITH TIME ZONE,
  break_duration INTEGER DEFAULT 0, -- break time in minutes
  notes TEXT,
  location TEXT, -- where they checked in/out
  session_type TEXT DEFAULT 'regular', -- 'regular', 'overtime', 'break'
  branch_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_daily_summaries table for daily totals
CREATE TABLE public.employee_daily_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  total_hours NUMERIC DEFAULT 0,
  regular_hours NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  break_hours NUMERIC DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  first_check_in TIMESTAMP WITH TIME ZONE,
  last_check_out TIMESTAMP WITH TIME ZONE,
  branch_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, work_date)
);

-- Enable Row Level Security
ALTER TABLE public.employee_work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_daily_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on employee_work_sessions" 
ON public.employee_work_sessions 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on employee_daily_summaries" 
ON public.employee_daily_summaries 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_employee_work_sessions_updated_at
BEFORE UPDATE ON public.employee_work_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_daily_summaries_updated_at
BEFORE UPDATE ON public.employee_daily_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate session duration in hours
CREATE OR REPLACE FUNCTION public.calculate_session_hours(
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  break_minutes INTEGER DEFAULT 0
) RETURNS NUMERIC AS $$
BEGIN
  IF check_out IS NULL THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND(
    (EXTRACT(EPOCH FROM (check_out - check_in)) / 3600) - (break_minutes / 60.0),
    2
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to update daily summary when work session changes
CREATE OR REPLACE FUNCTION public.update_daily_summary()
RETURNS TRIGGER AS $$
DECLARE
  work_date DATE;
  total_hrs NUMERIC;
  session_cnt INTEGER;
  first_in TIMESTAMP WITH TIME ZONE;
  last_out TIMESTAMP WITH TIME ZONE;
  total_pay NUMERIC;
  emp_hourly_rate NUMERIC;
BEGIN
  -- Get the work date from check_in time
  work_date := (COALESCE(NEW.check_in_time, OLD.check_in_time))::DATE;
  
  -- Get employee hourly rate
  SELECT hourly_rate INTO emp_hourly_rate 
  FROM public.employees 
  WHERE id = COALESCE(NEW.employee_id, OLD.employee_id);
  
  -- Calculate totals for the day
  SELECT 
    COALESCE(SUM(public.calculate_session_hours(check_in_time, check_out_time, break_duration)), 0),
    COUNT(*),
    MIN(check_in_time),
    MAX(check_out_time)
  INTO total_hrs, session_cnt, first_in, last_out
  FROM public.employee_work_sessions
  WHERE employee_id = COALESCE(NEW.employee_id, OLD.employee_id)
    AND check_in_time::DATE = work_date;
  
  -- Calculate total pay
  total_pay := total_hrs * COALESCE(emp_hourly_rate, 0);
  
  -- Insert or update daily summary
  INSERT INTO public.employee_daily_summaries (
    employee_id, work_date, total_hours, total_earnings, session_count,
    first_check_in, last_check_out, branch_id, regular_hours
  ) VALUES (
    COALESCE(NEW.employee_id, OLD.employee_id),
    work_date,
    total_hrs,
    total_pay,
    session_cnt,
    first_in,
    last_out,
    COALESCE(NEW.branch_id, OLD.branch_id),
    LEAST(total_hrs, 8) -- assume 8 hours is regular, rest is overtime
  )
  ON CONFLICT (employee_id, work_date) 
  DO UPDATE SET
    total_hours = EXCLUDED.total_hours,
    total_earnings = EXCLUDED.total_earnings,
    session_count = EXCLUDED.session_count,
    first_check_in = EXCLUDED.first_check_in,
    last_check_out = EXCLUDED.last_check_out,
    regular_hours = EXCLUDED.regular_hours,
    overtime_hours = GREATEST(EXCLUDED.total_hours - 8, 0),
    updated_at = now();
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update daily summary
CREATE TRIGGER update_daily_summary_on_session_change
AFTER INSERT OR UPDATE OR DELETE ON public.employee_work_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_daily_summary();

-- Create indexes for better performance
CREATE INDEX idx_employee_work_sessions_employee_id ON public.employee_work_sessions(employee_id);
CREATE INDEX idx_employee_work_sessions_date ON public.employee_work_sessions(check_in_time::DATE);
CREATE INDEX idx_employee_work_sessions_branch_id ON public.employee_work_sessions(branch_id);
CREATE INDEX idx_employee_daily_summaries_employee_id ON public.employee_daily_summaries(employee_id);
CREATE INDEX idx_employee_daily_summaries_date ON public.employee_daily_summaries(work_date);
CREATE INDEX idx_employee_daily_summaries_branch_id ON public.employee_daily_summaries(branch_id);