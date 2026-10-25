CREATE TABLE public.product_order_minimums (
 source text NOT NULL CHECK (length(source) BETWEEN 1 AND 40),
 product_id text NOT NULL CHECK (length(product_id) BETWEEN 1 AND 160),
 minimum integer NOT NULL CHECK (minimum > 0),
 printed_minimum integer CHECK (printed_minimum > 0),
 recommended_minimum integer CHECK (recommended_minimum > 0),
 PRIMARY KEY (source, product_id)
);
GRANT SELECT ON public.product_order_minimums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_order_minimums TO authenticated;
GRANT ALL ON public.product_order_minimums TO service_role;
ALTER TABLE public.product_order_minimums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public quantity guidance" ON public.product_order_minimums FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert quantity guidance" ON public.product_order_minimums FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update quantity guidance" ON public.product_order_minimums FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins reset quantity guidance" ON public.product_order_minimums FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));