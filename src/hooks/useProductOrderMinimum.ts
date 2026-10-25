import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { validQuantityOverride, type QuantityOverride } from '@/lib/productOrderMinimums';

export function useProductOrderMinimum(source: string, productId?: string) {
  const client = useQueryClient();
  const key = ['product-order-minimum', source, productId];
  const query = useQuery({
    queryKey: key,
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase.from('product_order_minimums').select('minimum,printed_minimum,recommended_minimum').eq('source', source).eq('product_id', productId || '').maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 60_000,
  });
  const save = async (value: QuantityOverride | null) => {
    if (!productId || (value && !validQuantityOverride(value))) throw new Error('Invalid quantities');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) throw new Error('Admin required');
    const { data: role, error: roleError } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    if (!role || roleError) throw new Error('Admin required');
    const result = value
      ? await supabase.from('product_order_minimums').upsert({ source, product_id: productId, ...value })
      : await supabase.from('product_order_minimums').delete().eq('source', source).eq('product_id', productId);
    if (result.error) throw result.error;
    client.setQueryData(key, value);
    await client.invalidateQueries({ queryKey: key });
  };
  return { ...query, save };
}