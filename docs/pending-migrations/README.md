# Neizpildītas migrācijas (pārskatīšanai)

Šie SQL faili NAV pielietoti datubāzei. Pirms izpildes vajag cenu pirms/pēc salīdzinājumu un apstiprinājumu.

1. `001_ss_no_style_min_fallback.sql` — Stanley/Stella variants bez savas cenas vairs nesaņem modeļa lētāko cenu (šobrīd 6 varianti, modelis STJW190).
2. `002_mf_outlet_price_on_request.sql` — Malfini preces ar oriģinālo kategoriju `OUTLET` (raw->>'categoryName', 6 modeļi / 63 varianti, 2,64–20,00 €) netiek cenotas, kamēr nav pierādīts, ka OUTLET vairumcena ir parastā cena. Rāda „Cena pēc pieprasījuma”.

Formulas (×1,75, ×1,65 utt.) šie faili nemaina.
