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

/** Current feeds do not prove normal-price semantics; keep existing rows and
 * do not bootstrap unknown prices from a possibly promotional candidate.
 * The private evidence registry is the only path for approved new prices. */
export async function holdUnverifiedPriceRows(
  client: { from: (table: string) => any }, table: string,
  rows: Record<string, any>[], key: string,
): Promise<Record<string, any>[]> {
  const held: Record<string, any>[] = [];
  for (let i = 0; i < rows.length; i += 200) {
    const keys = [...new Set(rows.slice(i, i + 200).map((row) => String(row[key])))];
    const { data, error } = await client.from(table).select("*").in(key, keys);
    if (error) throw new Error(`${table}: held-price read failed: ${error.message}`);
    held.push(...(data ?? []));
  }
  return held;
}