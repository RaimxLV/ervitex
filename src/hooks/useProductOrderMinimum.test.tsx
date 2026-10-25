import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProductOrderMinimum } from './useProductOrderMinimum';
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), from: vi.fn(), upsert: vi.fn(), role: vi.fn() }));
vi.mock('@tanstack/react-query', () => ({ useQuery: () => ({ data: null }), useQueryClient: () => ({ setQueryData: vi.fn(), invalidateQueries: vi.fn() }) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { auth: { getUser: mocks.getUser }, from: mocks.from } }));
beforeEach(() => {
  vi.clearAllMocks();
  const chain = { select: () => chain, eq: () => chain, maybeSingle: mocks.role, upsert: mocks.upsert };
  mocks.from.mockReturnValue(chain);
  mocks.upsert.mockResolvedValue({ error: null });
});
describe('quantity write access and identity', () => {
  it('does not write while signed out', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const { result } = renderHook(() => useProductOrderMinimum('ss', 'STTU169'));
    await expect(result.current.save({ minimum: 25, printed_minimum: null, recommended_minimum: 5 })).rejects.toThrow();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it('does not write for an authenticated non-admin', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user' } }, error: null });
    mocks.role.mockResolvedValue({ data: null, error: null });
    const { result } = renderHook(() => useProductOrderMinimum('ss', 'STTU169'));
    await expect(result.current.save({ minimum: 25, printed_minimum: null, recommended_minimum: 5 })).rejects.toThrow();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it('writes only the exact source and product for a verified admin', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'admin' } }, error: null });
    mocks.role.mockResolvedValue({ data: { role: 'admin' }, error: null });
    const { result } = renderHook(() => useProductOrderMinimum('ss', 'STTU169'));
    await result.current.save({ minimum: 25, printed_minimum: null, recommended_minimum: 5 });
    expect(mocks.upsert).toHaveBeenCalledExactlyOnceWith({ source: 'ss', product_id: 'STTU169', minimum: 25, printed_minimum: null, recommended_minimum: 5 });
  });
});