import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderMinimumNotice } from './OrderMinimumNotice';

const state = vi.hoisted(() => ({ isAdmin: true, loading: false, data: null, save: vi.fn() }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => state }));
vi.mock('@/hooks/useProductOrderMinimum', () => ({ useProductOrderMinimum: () => state }));
vi.mock('@/i18n/LanguageContext', () => ({ useLanguage: () => ({ lang: 'lv' }) }));
afterEach(cleanup);
beforeEach(() => { state.isAdmin = true; state.loading = false; state.save.mockReset(); state.save.mockResolvedValue(undefined); });
describe('admin product quantity editor', () => {
  it('saves the edited minimum as 25 with the original recommendation of 5', async () => {
    render(<OrderMinimumNotice source="ss" productId="STTU169" category="T-shirts" />);
    fireEvent.click(screen.getByRole('button', { name: 'Rediģēt' }));
    fireEvent.change(screen.getByLabelText('Minimālais daudzums'), { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: 'Saglabāt' }));
    await waitFor(() => expect(state.save).toHaveBeenCalledWith({ minimum: 25, printed_minimum: null, recommended_minimum: 5 }));
  });
  it('cancel and Escape do not write changes', () => {
    render(<OrderMinimumNotice source="ss" productId="STTU169" category="T-shirts" />);
    fireEvent.click(screen.getByRole('button', { name: 'Rediģēt' }));
    fireEvent.change(screen.getByLabelText('Minimālais daudzums'), { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: 'Atcelt' }));
    fireEvent.click(screen.getByRole('button', { name: 'Rediģēt' }));
    expect((screen.getByLabelText('Minimālais daudzums') as HTMLInputElement).value).toBe('10');
    fireEvent.keyDown(screen.getByLabelText('Minimālais daudzums'), { key: 'Escape' });
    expect(state.save).not.toHaveBeenCalled();
  });
  it.each([{ isAdmin: false, loading: false }, { isAdmin: true, loading: true }])('no editor without resolved admin access: %o', role => {
    Object.assign(state, role);
    render(<OrderMinimumNotice source="ss" productId="STTU169" category="T-shirts" />);
    expect(screen.queryByRole('button', { name: 'Rediģēt' })).toBeNull();
    expect(state.save).not.toHaveBeenCalled();
  });
});