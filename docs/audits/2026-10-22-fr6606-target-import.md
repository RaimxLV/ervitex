# Retro Trucker 6606 — targeted import

## Applied data only
- User authorized exactly Falk&Ross article 306.73, manufacturer 6606, Classics / Yupoong. Separate 6606T (307.73) and 6606RT untouched.
- Read supplier product and colour matrices through the existing saved supplier account, using the same login and matrix fields as the existing importer. No order/cart action.
- All 21 available supplier variant cells have ordinary Pricing 4.50 EUR per piece, no quantity selected and no promotion marker in these matrices. Existing DB FR formula confirmed: round(purchase × 1.55, 2) = 6.98 EUR ex VAT; existing display +21% = 8.45 EUR.
- 17 colours; One Size in all 17, Kids 54cm only White, Black, Dark Grey, Navy. Unavailable empty Kids cells were not imported. Four zero-stock adult colours remain available in the catalogue, not unpublished. Stock uses existing importer basis warehouse + supplier, not incoming stock.
- Single queue entry, style, 21 exact `6606::colour::size` variants and purchase/public variant prices, one model price range. Nothing copied from a different model or size.
- 16 usable mirrored colour images. Supplier Silver master/photo points to the same Maroon photograph; Silver image URL withheld with failed marker rather than displaying a wrong-colour photograph. Silver SKU and verified price remain. This supplier image mismatch is the only incomplete photo.
- Target transaction inserted only 6606, then refreshed only catalog_items materialization. No refresh_catalog_prices, supplier-wide sync, mass repricing or settings change. Existing deployed importer has no strict single-URL mode, so it was not invoked.
- sync_logs contains source `falkross:target-6606` with product, formula and regular-price provenance; no account/session secrets.
- DB verification: style published and not manually hidden, 21 variants, 17 colours, 21 public prices, 16 usable image records, one public catalog_items row; range 6.98 EUR. All other products/manual exclusions left untouched.

## Prepared, not deployed
- `supabase/functions/falkross-sync/index.ts`: exact TARGET_DISCOVERY URL exception to queue construction, ignoreDuplicates keeps completed imports intact. Not a whole Classics list addition. Legacy supplier importer untouched otherwise and NOT deployed.
- `src/lib/catalogSearch.ts`: factual Yupoong brand has Flexfit-family search metadata, does not replace display brand.
- `src/components/catalog/UnifiedCatalog.tsx`: Yupoong family maps to Flexfit manufacturer filter, unknown FR brands no longer falsely map to Build Your Brand.
- `src/lib/falkross6606.test.ts`: exact discovery scope and family search tests. `AGENTS.md`, business memory, roadmap updated.

## Verification
- Live and preview q=6606 both show exact Retro Trucker; direct page renders Black photo, 17 colours, actual sizes and 6.98/8.45 EUR. Screenshot /tmp/browser/fr6606-import/live.png.
- Live uses existing factual brand line (visually truncated Classics / Yupoo...) and supplier group label Build Your Brand / Flexfit; the pending search-family/filter correction and all-clothing/admin guidance changes are preview-only, not published.
- 86 focused tests pass: exact FR discovery/search (2), catalog search (26), quantity categories (54), standalone public/admin notice/no duplicates (4). Build OK.
- Prior all-clothing/admin notice work completed and retained (12 browser checks public/admin isolated on desktop/mobile, prior 63 tests). No admin records or quotes created.
- Live URL: https://www.ervitex.lv/catalog/item/fr/6606
- Preview URL: https://id-preview--720c1872-d106-476c-970d-190420757416.lovable.app/catalog/item/fr/6606

## Remaining
- Silver supplier image mismatch: price/variant imported, correct photograph unavailable; no invented image.
- Prepared precise discovery and family-search changes need separate deployment/publication approval. Product data itself is already live. No website/functions deployed, emails or requests sent.