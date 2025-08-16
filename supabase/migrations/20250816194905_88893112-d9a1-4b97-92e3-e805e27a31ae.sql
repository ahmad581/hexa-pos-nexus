-- Fix function search path security warnings
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.update_inventory_status();

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_inventory_status()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.current_stock = 0 THEN
    NEW.status = 'Out of Stock';
  ELSIF NEW.current_stock <= NEW.min_stock THEN
    NEW.status = 'Low Stock';
  ELSIF NEW.current_stock >= NEW.max_stock THEN
    NEW.status = 'Overstock';
  ELSIF NEW.expiry_date IS NOT NULL AND NEW.expiry_date < now() THEN
    NEW.status = 'Expired';
  ELSE
    NEW.status = 'Normal';
  END IF;
  
  RETURN NEW;
END;
$$;