# Neizpildītas izmaiņas (pārskatīšanai) — 2026-10-19

Nekas šeit NAV pielietots datubāzei vai sinhronizācijām.

| Fails | Saturs |
|---|---|
| `003_preview.sql` | Tikai SELECT: pirms/pēc ietekme pa avotiem. |
| `003_supplier_outlet_exact_prices.sql` | Izpildāma, atkārtojama migrācija: Malfini `is_outlet`/`source_category_name`, UTT `utt_variants.outlet` (2485 SKU no UTT eksporta), SS precīza SKU cena, cenu atjaunināšana bez outlet, `catalog_items` bez outlet, mērķēta cenu/diapazonu tīrīšana ar rezerves kopiju. |
| `003_rollback.sql` | Atjauno 2026-10-19 funkciju/skata definīcijas un rezerves kopijas rindas. |
| `004_utt_exact_price_recompute.sql` | Pēc 003: viena transakcija, mērķēts UTT cenu pārrēķins (sava ne-outlet SKU cena × zīmola uzcenojums; mediāna tikai aizdomu signāls → cena pēc pieprasījuma), rezerves kopija `private.utt_*_20261019` (REVOKE anon/authenticated). |
| `004_rollback.sql` | Atjauno 004 skartās UTT cenu rindas/diapazonus. |
| `003_sync_code.patch` | Malfini (tikai `limit<=1` cena, OUTLET pazīme), UTT (`outlet` lauks), preces loga UTT variantu filtrs. Pielietot TIKAI pēc migrācijas. |

Secība: preview → migrācija → patch → preview (jābūt 0 rindām) → kataloga pārbaude. Uzcenojumi (SS ×1,75, MF ×1,65, UTT zīmolu, PF ×1,65 u.c.) netiek mainīti; manuālie `hidden_by_admin` netiek aiztikti.

## Pārbaudes statuss (2026-10-19 11:45)
- Ielāps piemērots tikai izolētā kopijā /tmp: pielīp tīri; Deno tipu pārbaude abām sinhronizācijām OK; 12 helper testi iziet.
- `CatalogItemDialog` daļa kompilējas tikai pēc migrācijas (kolonna `outlet` jāparādās ģenerētajos tipos).
- `003_utt_median_impact.sql`: 18 281 ne-outlet variantiem nākamais pilnais refresh mainītu 7 cenas (5 modeļi), max Δ 11,43 € — jāizlemj pirms izpildes.

## UTT failsafe kandidāts (2026-10-19 11:55, tikai SELECT)
- Mediāna nekad neaizstāj cenu; aizdomīgām SKU cena netiek publicēta.
- Ne-outlet SKU → cena pēc pieprasījuma: 51 (no tām 44 pašlaik mediānas aizstātas); kopā bez cenas 104.
- Outlet cenu rindas izņemtas: 2248. Pozitīvas cenas mainās: 3 (max Δ 5,08 €), nemainās 18 240.
- Modeļi: 129 pilnībā izslēgti (tikai outlet); 11 paliek ar cenu pēc pieprasījuma; 409 UTT modeļi pēc tam.
- Manuāli slēptie UTT: 0, netiek aiztikti; apavu filtri nemainīti.
