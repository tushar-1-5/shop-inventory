-- ============================================
-- Shop Inventory - Supabase Database Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================

-- 1. TABLES
-- ============================================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text DEFAULT '',
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  sku text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  buying_price numeric(10,2) NOT NULL DEFAULT 0.00,
  selling_price numeric(10,2) NOT NULL DEFAULT 0.00,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
  supplier text DEFAULT '',
  image_url text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  entity_name text NOT NULL,
  changes jsonb,
  performed_by uuid REFERENCES public.profiles(id),
  performed_at timestamptz NOT NULL DEFAULT now()
);

-- 2. FUNCTIONS
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Log product changes
CREATE OR REPLACE FUNCTION public.log_product_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  change_data jsonb := '{}'::jsonb;
  user_id uuid;
BEGIN
  user_id := COALESCE(auth.uid(), CASE
    WHEN TG_OP = 'DELETE' THEN OLD.created_by
    ELSE NEW.created_by
  END);

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_log (action, entity_type, entity_id, entity_name, changes, performed_by)
    VALUES (
      'product_created', 'product', NEW.id, NEW.name,
      jsonb_build_object(
        'sku', NEW.sku,
        'quantity', NEW.quantity,
        'buying_price', NEW.buying_price,
        'selling_price', NEW.selling_price
      ),
      user_id
    );
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.name IS DISTINCT FROM NEW.name THEN
      change_data := change_data || jsonb_build_object('name', jsonb_build_object('old', OLD.name, 'new', NEW.name));
    END IF;
    IF OLD.description IS DISTINCT FROM NEW.description THEN
      change_data := change_data || jsonb_build_object('description', jsonb_build_object('old', OLD.description, 'new', NEW.description));
    END IF;
    IF OLD.sku IS DISTINCT FROM NEW.sku THEN
      change_data := change_data || jsonb_build_object('sku', jsonb_build_object('old', OLD.sku, 'new', NEW.sku));
    END IF;
    IF OLD.buying_price IS DISTINCT FROM NEW.buying_price THEN
      change_data := change_data || jsonb_build_object('buying_price', jsonb_build_object('old', OLD.buying_price, 'new', NEW.buying_price));
    END IF;
    IF OLD.selling_price IS DISTINCT FROM NEW.selling_price THEN
      change_data := change_data || jsonb_build_object('selling_price', jsonb_build_object('old', OLD.selling_price, 'new', NEW.selling_price));
    END IF;
    IF OLD.supplier IS DISTINCT FROM NEW.supplier THEN
      change_data := change_data || jsonb_build_object('supplier', jsonb_build_object('old', OLD.supplier, 'new', NEW.supplier));
    END IF;
    IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
      change_data := change_data || jsonb_build_object('category_id', jsonb_build_object('old', OLD.category_id, 'new', NEW.category_id));
    END IF;
    IF OLD.low_stock_threshold IS DISTINCT FROM NEW.low_stock_threshold THEN
      change_data := change_data || jsonb_build_object('low_stock_threshold', jsonb_build_object('old', OLD.low_stock_threshold, 'new', NEW.low_stock_threshold));
    END IF;

    IF OLD.quantity IS DISTINCT FROM NEW.quantity THEN
      INSERT INTO public.activity_log (action, entity_type, entity_id, entity_name, changes, performed_by)
      VALUES (
        'quantity_changed', 'product', NEW.id, NEW.name,
        jsonb_build_object('quantity', jsonb_build_object('old', OLD.quantity, 'new', NEW.quantity)),
        user_id
      );
    END IF;

    IF change_data != '{}'::jsonb THEN
      INSERT INTO public.activity_log (action, entity_type, entity_id, entity_name, changes, performed_by)
      VALUES ('product_updated', 'product', NEW.id, NEW.name, change_data, user_id);
    END IF;

    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.activity_log (action, entity_type, entity_id, entity_name, changes, performed_by)
    VALUES (
      'product_deleted', 'product', OLD.id, OLD.name,
      jsonb_build_object('sku', OLD.sku),
      user_id
    );
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER on_product_change
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.log_product_changes();

-- Log category changes
CREATE OR REPLACE FUNCTION public.log_category_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  change_data jsonb := '{}'::jsonb;
  user_id uuid;
BEGIN
  user_id := COALESCE(auth.uid(), CASE
    WHEN TG_OP = 'DELETE' THEN OLD.created_by
    ELSE NEW.created_by
  END);

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activity_log (action, entity_type, entity_id, entity_name, changes, performed_by)
    VALUES ('category_created', 'category', NEW.id, NEW.name, NULL, user_id);
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.name IS DISTINCT FROM NEW.name THEN
      change_data := change_data || jsonb_build_object('name', jsonb_build_object('old', OLD.name, 'new', NEW.name));
    END IF;
    IF OLD.description IS DISTINCT FROM NEW.description THEN
      change_data := change_data || jsonb_build_object('description', jsonb_build_object('old', OLD.description, 'new', NEW.description));
    END IF;
    IF change_data != '{}'::jsonb THEN
      INSERT INTO public.activity_log (action, entity_type, entity_id, entity_name, changes, performed_by)
      VALUES ('category_updated', 'category', NEW.id, NEW.name, change_data, user_id);
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.activity_log (action, entity_type, entity_id, entity_name, changes, performed_by)
    VALUES ('category_deleted', 'category', OLD.id, OLD.name, NULL, user_id);
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER on_category_change
  AFTER INSERT OR UPDATE OR DELETE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.log_category_changes();

-- 3. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view all categories"
  ON public.categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON public.categories FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON public.categories FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete categories"
  ON public.categories FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view all products"
  ON public.products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON public.products FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON public.products FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON public.products FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view all activity"
  ON public.activity_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "System can insert activity logs"
  ON public.activity_log FOR INSERT TO authenticated WITH CHECK (true);
