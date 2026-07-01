
# Vienota Stanley/Stella + Katalogs plūsma

Tu saprati pareizi. Šobrīd `products` tabulā ir 126 manuāli pievienoti Stanley/Stella modeļi (piem. `STTU200`, `STSU011`) ar mūsu cenām, bet tie neizmanto reālos S/S attēlus/krāsas/nosaukumus no `ss_styles` — tāpēc rāda tukšas/dīvainas kartītes. Vienlaikus `ss_style_code` kolonna produktiem nav aizpildīta, kaut arī `name_lv` jau satur stila kodu.

## Ko izdaru

### 1. Sasaistu esošos katalogā ievietotos modeļus ar S/S datiem (vienreizējs)
- Ievadu `ss_style_code` visiem `brand='Stanley/Stella'` produktiem no `name_lv` (upper-case, trim).
- Rezultāts: katalogā rādot šo produktu, varam paņemt attēlus, krāsu apļus un pilno nosaukumu no `ss_style_summary`.

### 2. Katalogs lapa — S/S produktiem izmanto īsto S/S kartīti
- `CatalogPage.tsx` fetch iemet LEFT JOIN uz `ss_style_summary` pēc `ss_style_code`.
- `ProductCard.tsx` (tikai S/S produktiem ar aizpildītu `ss_style_code`):
  - Nosaukums = `ss_styles.name` (piem. "ASHER") + zem tā mūsu kods
  - Attēli = `ss_style_summary.images` (pilnīgi tāds pats swipe/hover kā S/S lapā)
  - Krāsu apļi = `ss_style_summary.colors` (HEX no ss_variants)
  - Cena = `retail_price` no `products` (mūsu manuālā) — negrozām
  - Zīmola tegs = `STANLEY/STELLA`
- Ja `ss_style_code` ir bet `ss_style_summary` nav (arhivēts), krītam atpakaļ uz esošo dizainu.

### 3. Stanley/Stella lapa — "Pievienot katalogam ar cenu" (tikai adminam)
- `StanleyStellaPage.tsx` kartītei apakšā (tikai `is_admin`):
  - Ja stils **jau ir** katalogā → mazs zaļš tegs "Katalogā €12.34" + poga "Rediģēt cenu".
  - Ja **nav** → poga "+ Pievienot katalogam".
- Klikšķis atver mazu Dialog (cenas ievade EUR ar PVN + kategorija dropdown, iepriekš aizpildīts no S/S `Type`).
- Saglabā:
  - Ja produkts eksistē → `UPDATE products SET retail_price=…, active=true, hidden_manual=false`.
  - Ja nav → `INSERT` jauns `products` ieraksts ar `brand='Stanley/Stella'`, `name_lv = style_code`, `ss_style_code = style_code`, `retail_price`, `active=true`.
- Refresh — modelis uzreiz parādās sadaļā **Katalogs** ar īsto S/S attēlu un mūsu cenu.

### 4. Noņemšana (opcionāli tajā pašā dialogā)
Poga "Noņemt no kataloga" → `active=false, hidden_manual=true`. S/S lapā paliek redzams.

## Tehniskās detaļas (izstrādes piezīmes)

- Migrācijas nav vajadzīgas — `products.ss_style_code` jau eksistē. Vienreizējs `UPDATE` aizpildīs saiti.
- RLS: `products` INSERT/UPDATE jau atļauts `admin` lomai (pārbaudīšu, ja nav — pieliksim policy).
- Query: pievienojam `useQuery` `ss_style_summary` uz katalogu ar `.in('style_code', priceSyleCodes)` — viens papildu request, kešots.
- Neietekmē citus brandus (BagBase, Beechfield, Quadra, Westford Mill) — tie turpina rādīt savas manuālās bildes.
- S/S atsevišķā lapa `/stanley-stella` nemainās vizuāli, tikai pievienojas admin-only pogas.

## Rezultāts

- Katalogs: S/S modeļiem ir profesionāli attēli, krāsas, nosaukumi + mūsu cena.
- S/S lapa: viena poga = jauns modelis parādās Katalogā ar cenu. Nav vairs jāievada dati divās vietās.
