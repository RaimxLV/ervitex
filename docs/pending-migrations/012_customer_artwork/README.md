# Customer artwork security — release status

## Applied preparation only
- `01_additive.sql` applied byte-for-byte using the migration tool as `drizzle/migrations/0027_quote_artwork_private_quarantine.sql`.
- Private `quote-quarantine` bucket created, 15 MB limit, no client SELECT/INSERT/UPDATE/DELETE policy. Only service role handles objects.
- `quote_artwork` RLS enabled; authenticated admins can inspect metadata only. Reservation RPC is service-role-only, row-locks the request and enforces 10 files/15 MB each/50 MB aggregate. No customer data changed.

## Prepared, NOT deployed/enforced
- Same-origin capability-validated upload, byte signature/extension/MIME checks, generated names, private quarantine, digest-bound scanner adapter, admin-only 60-second forced download.
- Both legacy email functions changed locally to remove 30-day storage bearer links and arbitrary external links. `send-quote-request` accepts only registered stored artwork refs; email directs staff to authenticated admin view.
- `02_enforce_release.sql` NOT applied. It removes old direct storage INSERT/admin SELECT policies and guards new attachment references. Coordinate this with compatible frontend/server route/notifier release; otherwise current live customer file upload stops working. No frontend or functions published.
- Existing 22 attachment objects are preserved. They lack a trusted scan verdict and are not auto-certified. Previously issued signed URLs may remain valid until expiry; policy removal is not token revocation. A separate legacy migration/scan strategy is required.

## Blockers
- No `ARTWORK_SCANNER_URL` / `ARTWORK_SCANNER_TOKEN` configured. All new accepted artwork stays pending and unavailable to staff. No fake clean verdict.
- Scanner contract: HTTPS POST raw bytes, bearer token, `X-Content-SHA256`; bounded JSON `{sha256, complete: true, verdict: "clean" | "infected"}`. `complete` must mean the entire document including embedded content and recursive ZIP members was scanned; encrypted/uninspectable/unsupported content must not return clean. Select/configure a real private service before enabling release. Pending objects need a separately reviewed re-scan operation; no background scanner currently exists.
- No standard backend rate-limit primitive. New ad-hoc IP/time limiter awaits user's confirmation of this tradeoff. Existing quote creation trigger remains unchanged (3/minute for anonymous callers when trusted IP metadata exists; not a comprehensive anti-bot guarantee). No CAPTCHA configured/claimed.
- Full production protection is NOT active until coordinated release. Old direct-storage upload policy remains live intentionally to avoid silently breaking the unpublished frontend.

## Fetch error evidence
No preview runtime/network trace or published worker/notifier error was available for the reported toast. Source proves RequestPage exposes raw `err.message` from save/upload, including browser `Failed to fetch`; exact failing request cannot be identified from this evidence. New upload uses a same-origin bounded endpoint, clear network/timeout message and stable retry IDs; no claim of reproducing or fixing an unknown network cause.

## Focused verification
Harmless synthetic fixtures only. Tests cover signatures/MIME/filename disguises, renamed fake EXE/ELF, active SVG, limits, capability/origin denial, private pending/infected verdicts, notifier URL spoofing and retry recovery. No real customer submission, email, malware, offer autosave or storage test objects.
## 2026-10-26 — automatic file protection (owner-approved policy change)
- Indefinite quarantine replaced. Without a configured scanner, files passing the automatic policy get status `validated` ("automātiski pārbaudīts") — NOT antivirus, never called clean/scanned. With `ARTWORK_SCANNER_URL/TOKEN`, scanner verdict is used: infected always blocks; outage = `error` with retry, never clean.
- Policy (`src/lib/artworkInspect.ts`, `policy-v1`): signature/extension/MIME match; executables/scripts/double extensions refused; PDF: rejects JavaScript/JS/Launch/EmbeddedFile(s)/RichMedia/XFA/SubmitForm/GoToR/AA, hex-escaped names, names inside Flate object streams (bounded 60 MB inflate), encrypted and truncated PDFs; SVG: rejects scripts, event handlers, DOCTYPE/entities, foreignObject, external href/url/import; PS/EPS/AI(PS): rejects pipe/file-system operators; ZIP: ≤50 members, no encryption, ZIP64, traversal, nested archives, members re-inspected after bounded decompression; PNG/JPEG structural completeness. GIF/WEBP/TIFF/PSD: signature only (passive raster).
- Limits: not a malware scanner; cannot detect exploits in image/PDF parser bugs or in PostScript code itself; PSD/TIFF internals are not parsed. Originals are never modified.
- Release binding: download only when `checked_sha256 = sha256` and policy version current, re-read from storage bytes. Legacy `quote-attachments` objects are registered on demand (row `legacy=true`) and pass the same policy when a request window or admin button opens them.
- Migration `0030_artwork_automatic_policy` applied (additive: statuses, bucket/checked columns, manager key hash/expiry).
- Staff window `/pieprasijums/:id`: request-scoped manager key in URL fragment (SHA-256 stored, 90 days, issued once per request) or admin sign-in with exact return. Customer `/saraksts` never shows files.

## 2026-10-26 (later) — owner: "to pārbaudi atceļam; galvenais lai exe nepieņem"
- Antivirus/scanner step and deep PDF/SVG/ZIP/EPS content checks removed (`policy-v2`). Only extension allowlist, byte-signature match, executable/script signature and double-extension blocking remain, plus size/count limits. Accepted files are `validated` = "Pieņemts", NOT scanned. Private storage and staff-only downloads unchanged.
