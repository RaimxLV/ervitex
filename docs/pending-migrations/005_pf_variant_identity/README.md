# 005 — PF variant identity (APPLIED 2026-10-19, migration 0019)

Status: review package. No DB writes, no trial DDL, no sync, no deploy. SQL validated offline only (pglast SQL + PL/pgSQL parser); guards use hashes read with SELECT.

## Required order
```text
apply:    003 -> 004 -> 005 (01_schema + 02_feed_values + 02_data, one transaction) -> verify -> source patches
rollback: source_rollback.sh -> 005/99_rollback.sql -> 004_rollback.sql -> 003_rollback.sql
```
- 005 is rebased on 003, not a snapshot: `01_schema.sql` reads the current `refresh_catalog_prices`, `catalog_items_mv` and `catalog_items` from the DB at run time and changes only the PF fragments (each must match exactly once). The 003 MF/UTT/SS outlet and exact-price logic is carried over unchanged.
- Guards (abort the whole transaction): `md5(prosrc refresh_catalog_prices)` = `3fd1011aa68fb54f641895acc0cb9c8e` (the body exactly as 003 writes it; live today is `31de0b3b…`, so 005 refuses to run before 003); `md5(catalog_items_mv definition)` = `7dc17b02cb3b08461f1bf6800f1d57d0` (live; 003/004 don't change it); `catalog_items` contains the 003 `ms.is_outlet` filter; `private.utt_touched_20261019` (004) exists; 005 not already applied. After recreation, the `catalog_items` definition must equal the pre-005 one.
- `003_rollback.sql` writes full pre-003 snapshots; running it while 005 is live would silently undo 005's PF logic. That's why 005 must be rolled back first. 005 rollback restores the exact pre-005 definitions saved in `private.pf005_saved_defs` and refuses to run if the function is no longer the 005 version.
- Indexes, `security_invoker` and ACLs of the MV/view are read at run time and re-applied. Saved definitions and backups are in `private`, with `REVOKE ALL FROM PUBLIC, anon, authenticated` and access for `service_role` only.

## Commands (after approval, as an admin migration session)
```text
psql -v ON_ERROR_STOP=1 -1 -f 01_schema.sql -f 02_feed_values.sql -f 02_data.sql
psql -f 03_verify_after.sql        # SELECT only; expected numbers in comments
patch -p1 < docs/pending-migrations/005_pf_variant_identity/frontend.patch   # then regenerate DB types
patch -p1 < docs/pending-migrations/005_pf_variant_identity/sync.patch
```
`02_feed_values.sql` creates `ON COMMIT DROP` temp tables, so all three files must run in the same `-1` transaction. `02_data.sql` aborts if the value counts differ (19674/994/121), if a feed key names an SKU missing from the DB, or if any retained SKU price changes.

## Feed evidence
- Official PF feed v3, EN, CNL1, `creationDateTime` 2026-10-18T13:40:28.431809Z. The already-downloaded file was reused; local capture 2026-10-19 13:27 UTC; sha256 `d082a1852790fdd14a94ceb718d9f2a00f8062217d87bef98ddfaaab7e7d4681`. No credentials or endpoint are recorded.
- Complete: parsed as one JSON document, 2156 models / 19723 items. Missing SKUs are classified against the whole file.

## Feed → DB comparison (DB read 2026-10-19)
| | count |
|---|---|
| DB pf_variants | 20668 (2276 models) |
| present in feed | 19674 |
| absent from feed (stale) | 994 SKUs in 289 models; 121 models with no SKU left |
| feed-only SKUs (not imported here) | 49 |
| retained SKUs with a new two-tone key | 2259 SKUs in 253 models |
| same model+colour+size with >1 SKU: before / after | 555 / 1 (`220200` BLACK+WHITE: 22020095, 22020099) |
| same model+colour+size with different prices: before / after | 29 / 0 |
| derived price rows rekeyed / removed (stale, backed up) | 2257 / 974 |
| price ranges changed / models without price (all hidden as stale) | 81 / 114 |
| price change on any retained SKU | 0 (guarded) |
| deleted source rows (pf_variants, pf_prices, pf_images, pf_styles) | 0 |

Examples (public price, unchanged): K1058B2C H_GREY → H_GREY+ROYAL 14.42; K1058B7E → H_GREY+PURPLE 14.42; K1058B7C stale (15.13, hidden); 10650504 BLACK → BLACK+SILVER 131.08; 10650503 Steel → Steel+GOLD 113.97; 10650500 stale (89.08, hidden). After the stale SKUs are excluded, every live K1058 SKU is 14.42.

## End-to-end key path
| Step | Change |
|---|---|
| importer (`sync.patch`) | writes `color_key`/`color_label` from all `colors.color`; generation stamp; explicit `mode=mark_stale` deactivates only when all manifest models carry the stamp, never deletes |
| catalog MV | colour = `color_key`, `n` = full label, new `k`, swatch SKU with photos first, stale variants/models excluded |
| `refresh_catalog_prices` | PF `color_code` = `color_key`, stale SKUs skipped; other sources as in 003 |
| card price (`catalogPriceSelection`) | PF uses `k` exactly |
| card photo | exact PF SKU only (already live in the preview) |
| detail (`CatalogItemDialog.loadPF`) | key/label from the new columns, stale hidden, SKU map flags collisions instead of keeping the last; PF price never falls back to another colour or size; different prices or more than one SKU per colour+size → no price |
| quote picker (`useVariants`, `RowVariantControls`) | PF picks by `k`; price only from one SKU (`pfResolveVariant`); a pick stores `colorKey` and `sku`; 22020095/99 → `ambiguous`, no price, no SKU, even at equal price |
| composite keys (`colorCodeCandidates`) | `+` keys match only exactly (already live) |

Legacy/saved rows: `unitPrice` of saved offers and worksheets is never rewritten (the existing auto-fill only fills an empty price). An old row with only `colorName` matches a colour only if exactly one full label equals it; an old "Heather grey" row matches nothing, so no price or SKU is guessed. New rows store `colorKey`/`sku` as additional JSON fields (`validate_worksheet_items` accepts extra keys).

## Files
`01_schema.sql`, `02_feed_values.sql` (generated), `02_data.sql`, `03_verify_after.sql`, `99_rollback.sql`, `frontend.patch` (6 files incl. `useVariants.pf005.test.ts`), `sync.patch`, `source_rollback.sh`.

## Verification done
- `frontend.patch` applied in an isolated copy with the new columns added to the copy's types: `tsgo` passes (a deliberately broken probe file was caught), all 225 tests pass (33 files). The patch applies forward and in reverse (`patch --dry-run`).
- `sync.patch`: the patched copy passes `deno check`; applies to the current file.
- Live helpers (inactive until the patch is applied): `pfColors.ts`, `pfVariantIdentity.ts` with tests on real K1058/106505/220200 rows.

## Limits / still open
- The guards and fragment replacements were not executed against a database (no trial DDL allowed). If 003 is changed before it is applied, the function hash guard aborts and 005 must be regenerated.
- After the schema is applied, DB types must be regenerated; the patch's typecheck used hand-added column types.
- Quote rows created from the detail dialog or the pick bar store the full label (no `sku`); their price still comes from exactly one SKU.
- 49 feed-only SKUs need a normal import after `sync.patch`. The `220200` pair needs a supplier check. The legacy `pf_retail_prices` view (1.0165) is unused for public prices and left unchanged.
