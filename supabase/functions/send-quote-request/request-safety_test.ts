import { canNotifyRequest, scopedAttachmentPaths, safeAttachmentName } from "../_shared/request-safety.ts";
const id = "11111111-1111-4111-8111-111111111111";
const key = "22222222-2222-4222-8222-222222222222";
function assert(value: boolean) { if (!value) throw new Error("Assertion failed"); }
Deno.test("attachments only belong to the actual request", () => {
  const path = `${id}/${key}-logo.png`;
  assert(scopedAttachmentPaths(id, [path, path]).length === 1);
  for (const bad of [`${key}/${key}-logo.png`, `${id}/../logo.png`, "https://example.invalid/file", `${id}/${key}-..png`]) {
    let rejected = false; try { scopedAttachmentPaths(id, [bad]); } catch { rejected = true; } assert(rejected);
  }
});
Deno.test("malformed URI cannot crash the email", () => { assert(safeAttachmentName("https://example.invalid/%E0%A4%A.pdf") === "%E0%A4%A.pdf"); });
Deno.test("UUID alone cannot trigger mail or patch another request", () => {
  assert(!canNotifyRequest({ submission_key: key }, undefined, false));
  assert(!canNotifyRequest({ submission_key: key }, id, false));
  assert(canNotifyRequest({ submission_key: key }, key, false));
  assert(canNotifyRequest({ submission_key: null }, undefined, true));
});