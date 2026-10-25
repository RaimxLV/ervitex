import { describe, expect, it } from 'vitest';
import { applyQuantityOverride, validQuantityOverride } from './productOrderMinimums';
import { getOrderMinimum } from './orderMinimums';

describe('per-product informative quantities', () => {
  it('changes 10 to 25 without changing the category default or the recommendation', () => {
    const base = getOrderMinimum({ source: 'ss', category: 'T-shirts' });
    const changed = applyQuantityOverride(base, { minimum: 25, printed_minimum: null, recommended_minimum: 5 });
    expect(changed.minimum).toBe(25);
    expect(changed.recommended?.minimum).toBe(5);
    expect(base.minimum).toBe(10);
    expect(applyQuantityOverride(base, null).minimum).toBe(10);
  });
  it('edits both promotional thresholds separately', () => {
    const base = getOrderMinimum({ source: 'pf', category: 'Mugs' });
    expect(applyQuantityOverride(base, { minimum: 25, printed_minimum: 50, recommended_minimum: null })).toMatchObject({ minimum: 25, printedMinimum: 50 });
  });
  it.each([0, -1, 1.5, NaN, Infinity])('rejects invalid quantity %s', minimum => {
    expect(validQuantityOverride({ minimum, printed_minimum: null, recommended_minimum: null })).toBe(false);
  });
});