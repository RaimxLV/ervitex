/** Supplier fields without proven normal/list semantics must not replace a held price. */
export function retainRegularPrice(input: {
  previous: number | null;
  candidate: number | null;
  standardVerified: boolean;
  promotional: boolean;
}): number | null {
  if (input.standardVerified && !input.promotional && input.candidate != null && Number.isFinite(input.candidate) && input.candidate > 0) return input.candidate;
  return input.previous != null && Number.isFinite(input.previous) && input.previous > 0 ? input.previous : null;
}

export type CompleteSnapshot = {
  authoritative: boolean; successful: boolean; complete: boolean;
  expected: number; received: number; failed: number;
};

export function canRetireSupplierItem(snapshot: CompleteSnapshot, present: boolean, manuallyHidden: boolean): boolean {
  return !present && !manuallyHidden && snapshot.authoritative && snapshot.successful && snapshot.complete &&
    snapshot.expected > 0 && snapshot.received === snapshot.expected && snapshot.failed === 0;
}