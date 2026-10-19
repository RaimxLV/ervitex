# Lasīšanas audits — atrastie defekti un minimālie labojumi

Audits veikts tikai lasot kodu un vienu SELECT vaicājumu. Nekas nav mainīts, publicēts vai sūtīts. Testi šajā auditā NETIKA palaisti.

## Pierādīti defekti

### 1. Admina piedāvājumā kopsummu bloks neatbilst aritmētikai
- Fails: `src/pages/admin/AdminOfferEdit.tsx` (kopsummas, ~491.–498. rinda), aprēķins `src/lib/offer.ts` → `offerTotals`.
- Cēlonis: `goods` jau ir summa PĒC katras preces atlaides (`itemGoodsNet`), bet zem tās vēl rāda „Preču atlaides −X”.
- Reproducēšana: 10 gab. × 20 €, atlaide 15 %. Rāda „Preces 170 €”, „Preču atlaides −30 €”, „Kopā bez PVN 170 €”. Lasot no augšas, sanāk 140 €.
- Ietekme: PM redz pretrunīgus skaitļus. Gala summa ir pareiza, bet PM var to „labot” ar roku.
- Labojums: rindā „Preces” rādīt `goods + itemDiscount` (summu pirms atlaidēm) vai pārsaukt to par „Preces pēc atlaidēm” un atlaides rindu izņemt.

### 2. Preču sarakstā ar 0 % PVN rāda cenas ar 21 % PVN
- Fails: `src/pages/WorksheetPage.tsx`, 405. un 449. rinda: `sheet.vat_rate || 21`.
- Reproducēšana: sarakstam iestatīts `worksheet_vat_rate = 0` (piemēram, ES reversais PVN). `0 || 21` = 21, tāpēc rindās rāda „ar PVN” ar 21 %. Kopsummā izmanto `?? 21` (144. rinda), tāpēc tur ir 0 %.
- Ietekme: viena lapa rāda divas dažādas PVN likmes.
- Labojums: abās vietās nomainīt uz `sheet.vat_rate ?? 21`.

### 3. Sākumlapā preču skaits sevi apgāž: 7000+ pret 10 000
- `src/components/home/HeroSection.tsx:134` — fiksēts teksts „7000+ Produkti”.
- `src/components/home/BentoCategories.tsx:119` — „vairāk nekā 10 000 … vienībām”.
- `src/lib/seo.ts:24` un `src/components/RouteSeo.tsx:13` — „7000+ modeļu”.
- Fakts no datubāzes: `catalog_items` = 7276 ieraksti (skaitā var būt atlikumi un apavi, ko katalogā nerāda).
- Ietekme: divi dažādi skaitļi vienā lapā. Agrāk teicu, ka skaits mainās automātiski, bet „7000+” ir ierakstīts kodā.
- Labojums: BentoCategories tekstā rakstīt „vairāk nekā 7000”. Ja skaitam jāmainās pašam, to jāņem no kataloga skaita, noapaļojot uz leju līdz tūkstotim.

## Riski (nav pierādīti kā kļūda)

### 4. Preču saraksts neņem vērā katras preces atlaidi
- `src/lib/worksheet.ts` → `lineNet` un `worksheetTotals` neizmanto `discountPercent`, bet `offer.ts` to izmanto.
- Kļūda rodas tikai tad, ja preču sarakstā nonāk rindas ar `discountPercent` (piemēram, no piedāvājuma). Pirmais labojuma solis: pārbaudīt, vai šāda pārnese vispār notiek. Ja notiek, izmantot kopīgos `itemGoodsNet`/`itemDiscountNet`.

### 5. Klienta piedāvājuma lapā nav rindas „Preču atlaides kopā”
- `src/pages/OfferPage.tsx` kopsummā rāda tikai kopējo atlaidi (`totals.discount`), bet ne `totals.itemDiscount`. Atlaides katrai precei redzamas tabulā, tāpēc tā nav aprēķina kļūda — klientam trūkst tikai kopsavilkuma rindas.

## Pārbaudīts, kļūdas nav atrastas
- `src/lib/sendOffer.functions.ts`: sūtīt var tikai pieslēdzies lietotājs, admina loma tiek pārbaudīta servera pusē, melnrakstu nesūta, e-pasta adrese tiek pārbaudīta.
- Nulles cenas e-pastā un klienta lapā rāda kā „—” vai „pēc pieprasījuma”, nevis 0 €.

## Pēc apstiprinājuma
Izlabot 1.–3. punktu, pievienot testus 1. un 2. punktam un pārbaudīt 4. punkta datu plūsmu. Testus palaist un ziņot to reālo rezultātu.
