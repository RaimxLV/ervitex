# Kataloga integritātes audits — 2026-10-20

## B15 / B25 (Beechfield) — cēlonis pierādīts
- Avots: piegādātāja B15 lapa satur arī saistīto B15C (sandwich peak) attēlus.
- Mūsu kļūda: `beechfield-sync` filtrēja attēlus ar apakšvirkni `fname.includes(code)` → `b15c_…` atbilda `b15`, `b25c_white_french-navy` atbilda `b25`, `b673` atbilda `B67`, `bg542` atbilda `BG5`.
- Galerijā krāsas atlase ar apakšvirkni (`"bottlegreen"` ⊂ `"…bottle-green-white…"`) šos svešos kadrus ielika izvēlētajā krāsā.
- Labojums: `_shared/bbImageOwnership.ts` (+ identiska `src/lib` kopija) — vesela koda tokena piederība un krāsas vārdi kā veseli tokeni. Izmantots importētājā, produkta galerijā (`loadBB`) un kataloga kartītēs.
- Datu labojums: izdzēstas 57 modeļa līmeņa (`color_name IS NULL`) rindas 23 modeļos; neviena nebija primārā. Iepriekšējās vērtības: `2026-10-20-bb-foreign-images-removed.csv` (atjaunošanai INSERT no CSV).
- Pārlūks (Chromium, lokāli): B15 Bottle Green galerija = tikai `b15_bottle-green`; B25 White = `b25_white` + `b25_white_lifestyle`. Vizuāli pārbaudīts B15 ekrānattēls.

## Pārklājums (pilni skaiti, ne paraugi)
| Piegādātājs | Modeļi | Varianti | Attēli | Attēlu piederība | Cenu rindas (SKU/modeļi) |
|---|---|---|---|---|---|
| BB | 672 | 2963 | 8634→8577 | modeļa: 57 FAIL→labots; krāsu: 26 neatbilst (skat. zemāk) | 2931 / 658 |
| SS | 159 | 10657 | 28322 | 0 sveši (fname satur stilu) | 10651 / 159 |
| MF | 424 | 15584 | 11639 | 0 sveši; SKU prefikss 0 kļūdu | 15521 / 418 |
| PF | 2277 | 20717 | 111281 | 0 attēlu ar citu modeļa item_code | 19644 / 2121; 37 cenu SKU nav pf_variants |
| NWG | 14191 | 14323 | 106634 | 0 item_number ar citu product_number | 64419 / 2858 |
| Russell | 93 | — | 5487 | 0 ar citu modeļa ceļu | 93 / 93 |
| UTT | 564 | 20836 | 6820 | 40 bez pilna koda, visiem sakrīt ciparu daļa (Regatta re674↔RETRA674) → PASS | 18238 / 399 |
| F&R | 255 | 3030 | 872 | NEPĀRBAUDĀMS programmatiski (ceļi `347_68_200_f…` nesatur stila kodu) | 2617 / 255 |
| ETX | — | — | — | manuāli | 12 / 12 |
Visas `catalog_variant_prices` cenas > 0.

## Anomālijas, kas NAV labotas
- BB 26 krāsu rindas no piegādātāja „Available Colours” bloka rāda cita koda failu (B640B→b640, B645B→b645, B655B→b655, B320B→b320, W710→w701, BG75→bgg75, QS70→qss70, 4 UUID faili). Piegādātāja dati; vai foto vizuāli atšķiras — nav pārbaudīts. Saglabāti.
- SS: 1786 stila+krāsas kombinācijām ir attēli bez varianta (nepublicētas/vecas krāsas); UI krāsas ņem no variantiem, tāpēc netiek rādītas.
- PF: 37 cenu rindām nav atbilstoša pf_variants SKU (bāreņi; izvēlē neparādās).

## Nepārbaudīts
- Katra attēla vizuālā atbilstība (tikai B15/B25 skatīti ar aci).
- Cenu formulu pārrēķins pret iepirkuma cenām šajā auditā netika palaists (psql nevar izsaukt `price_audit_*`); izmantot admin „Cenu audits”.
- Salīdzinājums ar piegādātāju tiešsaistes datiem (izņemot B15 lapas struktūru, kas redzama importētāja HTML filtrā) — netika veikts.
- Izmēru piederība krāsai ārpus BB (BB variantiem izmērs = null).
