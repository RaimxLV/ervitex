import { describe, expect, it } from 'vitest';
import { separateProductSpecs, splitCareInstructions } from './productContent';
describe('supplier product content', () => {
 it('moves supplier care symbols without losing them', () => {
  const result = separateProductSpecs([{label:'Care Symbols',value:'Do not bleach'},{label:'Weight',value:'270 g/m²'}],null,null);
  expect(result.care).toBe('Do not bleach'); expect(result.specs).toEqual([{label:'Weight',value:'270 g/m²'}]);
 });
 it('preserves UTT temperatures and pipe-separated care', () => {
  expect(splitCareInstructions("Normal agitation at 40 °C|Do Not Tumble Dry|Iron, Low|Do Not Dryclean|Don't bleach")).toEqual(['Normal agitation at 40 °C','Do Not Tumble Dry','Iron, Low','Do Not Dryclean',"Don't bleach"]);
 });
});
