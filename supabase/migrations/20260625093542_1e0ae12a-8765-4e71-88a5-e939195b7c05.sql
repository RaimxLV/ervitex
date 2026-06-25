
-- Stanley/Stella sync fields
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS ss_style_code text,
  ADD COLUMN IF NOT EXISTS ss_in_stock boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS ss_stock_qty integer,
  ADD COLUMN IF NOT EXISTS ss_wholesale_price numeric,
  ADD COLUMN IF NOT EXISTS price_override numeric,
  ADD COLUMN IF NOT EXISTS hidden_manual boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hide_when_oos boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_products_ss_style_code ON public.products(ss_style_code);
CREATE INDEX IF NOT EXISTS idx_products_visibility ON public.products(active, hidden_manual);

-- Sync logs table
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  status text NOT NULL,
  products_updated integer DEFAULT 0,
  products_created integer DEFAULT 0,
  products_failed integer DEFAULT 0,
  message text,
  details jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

GRANT SELECT ON public.sync_logs TO authenticated;
GRANT ALL ON public.sync_logs TO service_role;

ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sync logs"
  ON public.sync_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
