import type { OrderMinimum } from './orderMinimums';

export interface QuantityOverride {
  minimum: number;
  printed_minimum: number | null;
  recommended_minimum: number | null;
}
export function validQuantityOverride(value: QuantityOverride): boolean {
  return [value.minimum, value.printed_minimum, value.recommended_minimum].every(n => n === null || (Number.isSafeInteger(n) && n > 0 && n <= 2147483647));
}
export function applyQuantityOverride(base: OrderMinimum, value?: QuantityOverride | null): OrderMinimum {
  if (!value || !validQuantityOverride(value)) return base;
  return {
    ...base, minimum: value.minimum,
    printedMinimum: base.printedMinimum ? value.printed_minimum ?? base.printedMinimum : undefined,
    recommended: base.recommended ? { ...base.recommended, minimum: value.recommended_minimum ?? base.recommended.minimum } : undefined,
  };
}