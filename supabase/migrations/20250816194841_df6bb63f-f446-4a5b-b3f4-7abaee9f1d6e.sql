-- Create warehouses table
CREATE TABLE public.warehouses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  manager_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER NOT NULL DEFAULT 100,
  unit_price DECIMAL(10,2),
  supplier TEXT,
  last_restocked TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'Normal' CHECK (status IN ('Normal', 'Low Stock', 'Out of Stock', 'Overstock', 'Expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory requests table (branch to warehouse requests)
CREATE TABLE public.inventory_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id TEXT NOT NULL,
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  requested_quantity INTEGER NOT NULL,
  approved_quantity INTEGER,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Fulfilled')),
  request_notes TEXT,
  approved_by TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  fulfilled_at TIMESTAMP WITH TIME ZONE
);

-- Create inventory transactions table (for tracking stock changes)
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Add', 'Remove', 'Transfer', 'Adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_id UUID, -- can reference inventory_requests.id or other related records
  performed_by TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public access for now, can be restricted based on auth later)
CREATE POLICY "Allow all operations on warehouses" ON public.warehouses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on inventory_items" ON public.inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on inventory_requests" ON public.inventory_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on inventory_transactions" ON public.inventory_transactions FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_warehouses_updated_at
  BEFORE UPDATE ON public.warehouses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically update inventory item status based on stock levels
CREATE OR REPLACE FUNCTION public.update_inventory_status()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status updates
CREATE TRIGGER update_inventory_item_status
  BEFORE INSERT OR UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_inventory_status();

-- Insert sample data
INSERT INTO public.warehouses (name, address, phone, manager_name) VALUES
  ('Main Warehouse', '123 Industrial Ave, Warehouse District', '+1 (555) 100-0001', 'John Smith'),
  ('Secondary Warehouse', '456 Storage Blvd, Industrial Park', '+1 (555) 100-0002', 'Sarah Johnson'),
  ('Distribution Center', '789 Logistics Way, Commerce Zone', '+1 (555) 100-0003', 'Mike Wilson');

-- Insert sample inventory items
INSERT INTO public.inventory_items (warehouse_id, name, sku, category, description, current_stock, min_stock, max_stock, unit_price, supplier) VALUES
  ((SELECT id FROM public.warehouses WHERE name = 'Main Warehouse'), 'Wireless Headphones', 'WH001', 'Electronics', 'Bluetooth wireless headphones with noise cancellation', 25, 5, 100, 99.99, 'TechCorp'),
  ((SELECT id FROM public.warehouses WHERE name = 'Main Warehouse'), 'Cotton T-Shirt', 'CT001', 'Clothing', '100% cotton crew neck t-shirt', 0, 10, 200, 19.99, 'FashionCo'),
  ((SELECT id FROM public.warehouses WHERE name = 'Secondary Warehouse'), 'Water Bottle', 'WB001', 'Sports', 'Stainless steel insulated water bottle', 8, 15, 50, 24.99, 'SportPlus'),
  ((SELECT id FROM public.warehouses WHERE name = 'Secondary Warehouse'), 'Notebook Set', 'NB001', 'Stationery', 'Set of 3 lined notebooks', 45, 20, 100, 12.99, 'PaperWorks'),
  ((SELECT id FROM public.warehouses WHERE name = 'Distribution Center'), 'Phone Case', 'PC001', 'Electronics', 'Protective phone case for latest models', 78, 25, 150, 15.99, 'TechCorp');