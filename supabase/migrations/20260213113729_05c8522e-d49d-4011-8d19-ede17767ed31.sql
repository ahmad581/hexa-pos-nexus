
-- =============================================
-- RETAIL PRODUCTS TABLE
-- =============================================
CREATE TABLE public.retail_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.custom_businesses(id) ON DELETE CASCADE NOT NULL,
  branch_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT NOT NULL,
  barcode TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  brand TEXT,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC,
  is_on_sale BOOLEAN NOT NULL DEFAULT false,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  size TEXT,
  color TEXT,
  material TEXT,
  weight NUMERIC,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retail_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view retail products in their business"
  ON public.retail_products FOR SELECT
  USING (
    business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
    OR business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
    OR is_super_admin(auth.uid())
  );

CREATE POLICY "Managers can manage retail products"
  ON public.retail_products FOR ALL
  USING (
    business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
    OR is_super_admin(auth.uid())
    OR is_manager_for_business(auth.uid(), business_id)
  )
  WITH CHECK (
    business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
    OR is_super_admin(auth.uid())
    OR is_manager_for_business(auth.uid(), business_id)
  );

CREATE INDEX idx_retail_products_business ON public.retail_products(business_id);
CREATE INDEX idx_retail_products_branch ON public.retail_products(branch_id);
CREATE INDEX idx_retail_products_sku ON public.retail_products(sku);
CREATE INDEX idx_retail_products_category ON public.retail_products(category);

-- =============================================
-- RETAIL CUSTOMERS TABLE
-- =============================================
CREATE TABLE public.retail_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.custom_businesses(id) ON DELETE CASCADE NOT NULL,
  branch_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  loyalty_tier TEXT NOT NULL DEFAULT 'Bronze',
  total_purchases NUMERIC NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retail_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view retail customers in their business"
  ON public.retail_customers FOR SELECT
  USING (
    business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
    OR business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
    OR is_super_admin(auth.uid())
  );

CREATE POLICY "Managers can manage retail customers"
  ON public.retail_customers FOR ALL
  USING (
    business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
    OR is_super_admin(auth.uid())
    OR is_manager_for_business(auth.uid(), business_id)
  )
  WITH CHECK (
    business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
    OR is_super_admin(auth.uid())
    OR is_manager_for_business(auth.uid(), business_id)
  );

CREATE INDEX idx_retail_customers_business ON public.retail_customers(business_id);

-- =============================================
-- RETAIL ORDERS TABLE
-- =============================================
CREATE TABLE public.retail_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.custom_businesses(id) ON DELETE CASCADE NOT NULL,
  branch_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  customer_id UUID REFERENCES public.retail_customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  order_type TEXT NOT NULL DEFAULT 'in-store',
  status TEXT NOT NULL DEFAULT 'draft',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  discount_type TEXT,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  cashier_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retail_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view retail orders in their business"
  ON public.retail_orders FOR SELECT
  USING (
    business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
    OR business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
    OR is_super_admin(auth.uid())
  );

CREATE POLICY "Staff can manage retail orders"
  ON public.retail_orders FOR ALL
  USING (
    business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
    OR business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
    OR is_super_admin(auth.uid())
  )
  WITH CHECK (
    business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
    OR business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
    OR is_super_admin(auth.uid())
  );

CREATE INDEX idx_retail_orders_business ON public.retail_orders(business_id);
CREATE INDEX idx_retail_orders_customer ON public.retail_orders(customer_id);

-- =============================================
-- RETAIL ORDER ITEMS TABLE
-- =============================================
CREATE TABLE public.retail_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.retail_orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.retail_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retail_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view retail order items via order"
  ON public.retail_order_items FOR SELECT
  USING (
    order_id IN (SELECT id FROM retail_orders WHERE
      business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
      OR business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
      OR is_super_admin(auth.uid())
    )
  );

CREATE POLICY "Staff can manage retail order items"
  ON public.retail_order_items FOR ALL
  USING (
    order_id IN (SELECT id FROM retail_orders WHERE
      business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
      OR business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
      OR is_super_admin(auth.uid())
    )
  )
  WITH CHECK (
    order_id IN (SELECT id FROM retail_orders WHERE
      business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
      OR business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
      OR is_super_admin(auth.uid())
    )
  );

-- =============================================
-- RETAIL RETURNS TABLE
-- =============================================
CREATE TABLE public.retail_returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.custom_businesses(id) ON DELETE CASCADE NOT NULL,
  branch_id TEXT NOT NULL,
  order_id UUID REFERENCES public.retail_orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.retail_customers(id) ON DELETE SET NULL,
  return_number TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  refund_type TEXT NOT NULL DEFAULT 'original_payment',
  refund_amount NUMERIC NOT NULL DEFAULT 0,
  store_credit_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  processed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retail_returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view retail returns in their business"
  ON public.retail_returns FOR SELECT
  USING (
    business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
    OR business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
    OR is_super_admin(auth.uid())
  );

CREATE POLICY "Staff can manage retail returns"
  ON public.retail_returns FOR ALL
  USING (
    business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
    OR business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
    OR is_super_admin(auth.uid())
  )
  WITH CHECK (
    business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
    OR business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
    OR is_super_admin(auth.uid())
  );

-- =============================================
-- RETAIL RETURN ITEMS TABLE
-- =============================================
CREATE TABLE public.retail_return_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_id UUID REFERENCES public.retail_returns(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.retail_products(id) ON DELETE SET NULL,
  order_item_id UUID REFERENCES public.retail_order_items(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  refund_amount NUMERIC NOT NULL,
  condition TEXT NOT NULL DEFAULT 'good',
  return_to_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.retail_return_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view retail return items via return"
  ON public.retail_return_items FOR SELECT
  USING (
    return_id IN (SELECT id FROM retail_returns WHERE
      business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
      OR business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
      OR is_super_admin(auth.uid())
    )
  );

CREATE POLICY "Staff can manage retail return items"
  ON public.retail_return_items FOR ALL
  USING (
    return_id IN (SELECT id FROM retail_returns WHERE
      business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
      OR business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
      OR is_super_admin(auth.uid())
    )
  )
  WITH CHECK (
    return_id IN (SELECT id FROM retail_returns WHERE
      business_id IN (SELECT id FROM custom_businesses WHERE user_id = auth.uid())
      OR business_id IN (SELECT business_id FROM profiles WHERE user_id = auth.uid() AND business_id IS NOT NULL)
      OR is_super_admin(auth.uid())
    )
  );

-- =============================================
-- TRIGGERS for updated_at
-- =============================================
CREATE TRIGGER update_retail_products_updated_at
  BEFORE UPDATE ON public.retail_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retail_customers_updated_at
  BEFORE UPDATE ON public.retail_customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retail_orders_updated_at
  BEFORE UPDATE ON public.retail_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_retail_returns_updated_at
  BEFORE UPDATE ON public.retail_returns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
