-- Add business_id to inventory_items to connect inventory to custom businesses
ALTER TABLE public.inventory_items 
ADD COLUMN business_id uuid REFERENCES public.custom_businesses(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_inventory_items_business_id ON public.inventory_items(business_id);

-- Add business_id to inventory_requests
ALTER TABLE public.inventory_requests 
ADD COLUMN business_id uuid REFERENCES public.custom_businesses(id) ON DELETE CASCADE;

CREATE INDEX idx_inventory_requests_business_id ON public.inventory_requests(business_id);

-- Add business_id to inventory_transactions
ALTER TABLE public.inventory_transactions 
ADD COLUMN business_id uuid REFERENCES public.custom_businesses(id) ON DELETE CASCADE;

CREATE INDEX idx_inventory_transactions_business_id ON public.inventory_transactions(business_id);

-- Add business_id to warehouses
ALTER TABLE public.warehouses 
ADD COLUMN business_id uuid REFERENCES public.custom_businesses(id) ON DELETE CASCADE;

CREATE INDEX idx_warehouses_business_id ON public.warehouses(business_id);