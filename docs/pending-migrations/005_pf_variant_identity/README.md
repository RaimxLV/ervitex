# 005 — PF variant identity (NOT APPLIED)

Status: draft for review. No DB writes, sync runs or deploys were made. SQL was only parsed offline (pglast).

## Feed evidence
- Official PF product feed, v3, language EN, department CNL1, `creationDateTime` 2026-10-18T13:40:28.431809Z.
- Local capture (already downloaded file, reused): 2026-10-19 13:27 UTC, sha256 `d082a1852790fdd14a94ceb718d9f2a00f8062217d87bef98ddfaaab7e7d4681`.
- Completeness: the whole file parsed as a single JSON document (no truncated tail), 2156 models / 19723 items. Missing-SKU classification uses this complete file, not one page.
- Credentials/endpoint are not recorded here.

## Feed → DB comparison (DB read 2026-10-19)
| | count |
|---|---|
| DB pf_variants | 20668 (2276 models) |
| present in feed | 19674 |
| absent from feed (stale) | 994 SKUs, 289 models touched; 121 models with no SKU left in feed |
| feed-only SKUs (not in DB, not imported by this step) | 49 |
| retained SKUs whose colour key changes (two-tone) | 2259 SKUs in 253 models |
| same model+colour+size with >1 SKU: before / after | 555 / 1 (`220200` BLACK+WHITE: 22020095, 22020099 — unresolved, both kept) |
| same model+colour+size with different prices: before / after | 29 / 0 |
| derived `catalog_variant_prices` rows: rekeyed / removed (stale, backed up) | 2257 / 974 |
| `catalog_price_ranges` changed / models left without price (all hidden as stale) | 81 / 114 |
| price change on any retained SKU | 0 |
| source rows deleted (`pf_variants`, `pf_prices`, `pf_images`, `pf_styles`) | 0 |

### Examples (public price incl. ×1.65 and VAT, unchanged)
| SKU | before (DB colour, size) | after (feed key) | price |
|---|---|---|---|
| K1058B2C | H_GREY, 3/4 | H_GREY+ROYAL — Heather grey / Royal blue | 14.42 |
| K1058B7E | H_GREY, 5/6 | H_GREY+PURPLE | 14.42 |
| K1058B7C | H_GREY, 3/4 | stale (feed_active=false) | 15.13 → not shown |
| 10650504 | BLACK | BLACK+SILVER — Black / Silver | 131.08 |
| 10650503 | Steel | Steel+GOLD — Steel / Gold | 113.97 |
| 10650500 | BLACK | stale | 89.08 → not shown |

After exclusion all live K1058 SKUs are 14.42; every 15.13 K1058 SKU is absent from the feed.

## Files
- `01_schema.sql` — additive columns (`color_key`, `color_label`, `feed_seen_at`, `feed_active` on variants; `feed_seen_at`, `feed_active` on styles); recreates `private.catalog_items_mv` + `public.catalog_items` from the live definitions with only the PF changes (colour = full key, `n` = full label, new `k`, swatch SKU prefers one with photos, stale variants/models excluded) and re-applies the previous ACLs; `refresh_catalog_prices` PF insert uses `color_key` and skips stale SKUs.
- `02_feed_values.sql` — generated feed values (temp tables only). `02_data.sql` — backups (no anon/authenticated access, RLS on), key backfill, stale flags, derived cache rekey, range update, MV refresh.
- `99_rollback.sql` — old MV/view/function, flags and derived cache restored from backups. Added columns stay (unused).
- `03_verify_after.sql` — SELECT-only checks with expected numbers.
- `sync.patch` — importer writes `color_key`/`color_label` + feed generation stamp; new explicit `mode=mark_stale` deactivates (never deletes) only after all manifest models carry the stamp. Patched copy passes `deno check`.
- `frontend.patch` — PF card/detail price uses `k` exact match. Depends on 01.

## Already in the preview (safe without schema)
- Composite keys with `+` match only exactly (no suffix guessing).
- PF card photos match the exact SKU; previously `10650504` could show `10650503` photos through the Malfini middle-digit rule.

## Remaining / not done
- Quote picker (`useVariants`/`RowVariantControls`) must pick PF colour by `k`; integration not written yet — needs 01 applied to test against real rows.
- Card "from" price per colour still takes the lowest size of that colour (existing behaviour, not per-SKU aggregation across colours).
- 49 feed-only SKUs need a normal import run after the patch.
- `220200` pair stays ambiguous; needs supplier attribute check.
- Old `pf_retail_prices` view still uses the legacy 1.0165 factor; not used for public prices here, left unchanged.
