# Neizpildītas izmaiņas (pārskatīšanai) — 2026-10-19

Nekas šeit NAV pielietots datubāzei vai sinhronizācijām.

| Fails | Saturs |
|---|---|
| `003_preview.sql` | Tikai SELECT: pirms/pēc ietekme pa avotiem. |
| `003_supplier_outlet_exact_prices.sql` | Izpildāma, atkārtojama migrācija: Malfini `is_outlet`/`source_category_name`, UTT `utt_variants.outlet` (2485 SKU no UTT eksporta), SS precīza SKU cena, cenu atjaunināšana bez outlet, `catalog_items` bez outlet, mērķēta cenu/diapazonu tīrīšana ar rezerves kopiju. |
| `003_rollback.sql` | Atjauno 2026-10-19 funkciju/skata definīcijas un rezerves kopijas rindas. |
| `003_sync_code.patch` | Malfini (tikai `limit<=1` cena, OUTLET pazīme), UTT (`outlet` lauks), preces loga UTT variantu filtrs. Pielietot TIKAI pēc migrācijas. |

Secība: preview → migrācija → patch → preview (jābūt 0 rindām) → kataloga pārbaude. Uzcenojumi (SS ×1,75, MF ×1,65, UTT zīmolu, PF ×1,65 u.c.) netiek mainīti; manuālie `hidden_by_admin` netiek aiztikti.
