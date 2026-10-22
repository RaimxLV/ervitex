# Focused catalogue audit — 22 October 2026

## Implemented in preview; no database writes or publication

- `src/lib/colorCodeMatch.ts`: SS card identifiers contain child numeric suffixes (`STSK180C08903`) and baby alphanumeric suffixes (`STSB920C149B2`). Old regex accepted only an optional single digit followed by letters. It could not resolve these to `C089`/`C149`, although detail loaders already used short colour codes. Matching now extracts the existing three-digit colour and accepts the whole size suffix, retaining colour identity.
- `src/lib/catalogPriceSelection.ts`: default details exclude Natural equivalents as cards already do; shared exact-colour filtering permits colourless fallback only for RU/ETX. Explicit unpriced selections never borrow another colour's price.
- `src/components/catalog/CatalogItemDialog.tsx`: all supplier loaders use `addSpec`; areal Weight becomes Fabric weight before translation. Latvian spec labels and source/cached description/material text normalize only grammage with g/m², g/m2, g/m^2 or gsm. Actual mass remains Weight/Svars. Selected size filtering no longer falls back to another size. PF conflict gates remain.
- `src/lib/fabricDensity.ts` and `.test.ts`: bounded terminology normalization preserving values/units.
- `src/lib/catalogPriceSelection.test.ts`: child/baby codes, 19.25 × 1.21 = 23.29, Natural, unpriced and supplier fallback boundaries.
- `AGENTS.md`, `roadmap.md`, project grammage memory updated.

## Read-only production data evidence

Audit reads public existing selling-price rows; no wholesale prices, repricing, refresh or sync invoked.

| Source | Models | Positive-price models | Without positive price |
|---|---:|---:|---:|
| BB | 672 | 658 | 14 |
| ETX | 12 | 12 | 0 |
| FR | 255 | 255 | 0 |
| MF | 424 | 418 | 6 |
| NWG | 2858 | 2858 | 0 |
| PF | 2156 | 2110 | 46 |
| RU | 93 | 93 | 0 |
| SS | 159 | 159 | 0 |
| UTT | 404 | 398 | 6 |

All nine sources have zero nonpositive public variant-price records and zero positive models missing a price range. 13 SS models had no mapped priced card colour under the old suffix regex; after accepting child AND baby suffixes the read-only aggregate is zero SS mismatches. Examples: STSK180, STSK181, STBB187, STSB105, STSB919, STSB920. STSK180 Aloe C089 and Black C002 both have existing 19.25 EUR net rows including size 3-4/98-104cm. No new price inferred.

Genuinely unpriced examples: BB QS275/QS287/QS65; MF 23Y/5X8/5Y1; PF 107151/107152/107153; UTT GI4100/GIL64000-EX/KA3031. Existing list/menu price-presence gates are preserved, not broadened. Model detail remains accessible by direct URL without inventing a price.

## Remaining exposure / blockers

- One NWG model, **1907087**, has catalogue colour `1907087-0000` (Unicolor), but authoritative priced SKU identity is `1907087-000`, colour `000`. Both variants exist; only `-000` has SKUs. It is not safe to truncate arbitrary zeroes or associate its orphan `-0000` image/colour with another variant's price. Its card remains unpriced pending reviewed variant/catalogue identity correction. Six other NWG models have no catalogue colours and use the existing model range; ETX's twelve colourless model prices are expected.
- Existing MF139 unknown regular-price evidence blocker is unchanged; no promo price was restored or relabelled. Existing supplier formula/VAT, manual-hidden, footwear, stock and outlet-retention paths were not changed.
- IndexedDB caches raw colours/ranges, not resolved colour keys; this fix applies immediately to existing cached records without invalidating/refetching the whole catalogue. Variant prices are fetched by visible models. Session and shared translation cache content is normalized on rendering, so no cache rewrite or new AI requests are required to fix old labels.
- Header search has no displayed price and uses the existing price-range gates; navigation reaches the same fixed detail renderer. Main catalogue search, related product cards and technology cards share the fixed colour helper.

## Translation prompt follow-up (prepared only; NOT edited/deployed)

Existing `supabase/functions/translate-text/index.ts` has a generic translation prompt. To respect the no-deployment instruction, leave its executable source untouched. The exact proposed addition after `Preserve bullet markers ... numbers and units.` is:

> For Latvian, fabric Weight/Fabric weight/grammage associated with g/m², g/m2 or gsm is Blīvums or Auduma blīvums, never Svars. Preserve actual product, shipping and packaging mass in g/kg and its labels. Do not change numbers or units.

Deployment needs separate authorization. Rendering protection is active now and protects old shared/manual/session translations without changing their stored contents or precedence.

## Browser verification

Production `/catalog?q=STSK180`: Aloe, CENA PĒC PIEPRASĪJUMA; no JS errors. Preview same card: Aloe, 19.25 net / 23.29 gross. Clicking it passes `color=STSK180C08903`; detail resolves Aloe with the same price. Explicit Black / 3-4/98-104cm shows 19.25. Desktop and 390px mobile card checked with screenshots. No request/email created.

128 focused Vitest tests passed across price identity, actual mass/grammage, PF conflict, NWG sizes, supplier flags, catalogue search/sorting/SEO and existing pending offer/order-printing behaviour. Preview build OK. Additional browser check: STSK180 `BLĪVUMS / 300 GSM` persists after reload with translation endpoint mocked (no extra paid AI call); genuinely unpriced PF107151 has no product price and its quantity row is `—`, while actual mass `SVARS / 340 g` is correctly preserved. Related items have their own prices; those are not mistaken for this unpriced product.

Preview: https://id-preview--720c1872-d106-476c-970d-190420757416.lovable.app