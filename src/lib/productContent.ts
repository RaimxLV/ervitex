export type ProductSpec = { label: string; value: string };
const careLabel = /^(care(?: symbols| instructions)?|wash(?:ing)? instructions|kopšan)/i;
const materialLabel = /^(material composition|composition|sastāvs)$/i;
export function separateProductSpecs(specs: ProductSpec[], care: string | null, material: string | null) {
  const values = [care, ...specs.filter(s => careLabel.test(s.label)).map(s => s.value)].filter(Boolean);
  return { care: [...new Set(values)].join('; ') || null, material: material || specs.find(s => materialLabel.test(s.label))?.value || null, specs: specs.filter(s => !careLabel.test(s.label) && !materialLabel.test(s.label)) };
}
export function productTextLines(text: string): string[] {
  return [...new Set(text.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, ' ').split(/\r?\n|[•▪✓]|;\s*|(?<=[.!?])\s+(?=[A-ZĀČĒĢĪĶĻŅŠŪŽ])/).map(s => s.replace(/^\s*[-*·]\s*/, '').trim()).filter(Boolean))];
}
export function splitCareInstructions(text: string): string[] {
  const parts = text.split(/[\n•·;|]+|,\s*(?=(?:do not|don't|no |tumble|iron|wash|maximum washing|nebal|neglud|mazg|žāv|gludin|nedrīkst))/i);
  const unique = new Map<string, string>();
  for (const part of parts) { const clean = part.replace(/\s+/g, ' ').replace(/[.\s]+$/, '').trim(); if (clean) unique.set(clean.toLowerCase(), clean.charAt(0).toUpperCase() + clean.slice(1)); }
  return [...unique.values()];
}
