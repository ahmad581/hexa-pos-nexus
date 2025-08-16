-- Fix function search path security warnings by recreating functions properly
DROP TRIGGER IF EXISTS update_warehouses_updated_at ON public.warehouses;
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON public.inventory_items;
DROP TRIGGER IF EXISTS update_inventory_item_status ON public.inventory_items;

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

-- Recreate triggers
CREATE TRIGGER update_warehouses_updated_at
  BEFORE UPDATE ON public.warehouses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_item_status
  BEFORE INSERT OR UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_status();