import { expect, it } from "vitest";
import { authorizeManager, keyHash } from "./managerAccess.server";

const id = "11111111-1111-4111-8111-111111111111";
const sb = (row: unknown) => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: row }) }) }) }) });

it("valid request-scoped key opens; wrong key, other request's key, customer token and expired key do not", async () => {
  const key = "A".repeat(43);
  const row = { manager_key_hash: await keyHash(key), manager_key_expires_at: new Date(Date.now() + 864e5).toISOString() };
  expect((await authorizeManager(sb(row), id, key, undefined)).ok).toBe(true);
  expect((await authorizeManager(sb(row), id, "B".repeat(43), undefined)).ok).toBe(false);
  expect((await authorizeManager(sb(null), id, key, undefined)).ok).toBe(false); // another request has no matching hash
  expect((await authorizeManager(sb({ manager_key_hash: null }), id, "a1b2c3".repeat(6), undefined))).toEqual({ ok: false, reason: "signin" });
  const expired = { ...row, manager_key_expires_at: new Date(Date.now() - 1000).toISOString() };
  expect(await authorizeManager(sb(expired), id, key, undefined)).toEqual({ ok: false, reason: "expired" });
});
