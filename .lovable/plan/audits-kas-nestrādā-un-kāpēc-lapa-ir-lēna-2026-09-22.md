# Audits: kas nestrādā un kāpēc lapa ir lēna

## Ko atradu par ātrumu

1. **Katalogs lejuplādē visu uzreiz.** Katalogā ir 6 250 preces un 6 847 cenu ieraksti. Atverot katalogu, pārlūks tos visus novelk (~5 MB teksta) un pēc tam pats filtrē. Tāpēc katalogs ir lēns un telefonā īpaši.
2. **Ļoti smagas bildes.** „Par mums" lapā bija 1,1 MB liela bilde, veikalu bildes 500–820 KB. (Jau samazinātas — skat. zemāk.)
3. **Sākumlapa ielādē visas apdrukas tehnoloģiju bildes uzreiz**, arī tās, ko neviens neredz, pirms noskrollē.
4. **Divi ļoti lieli faili** (katalogs un preces logs) ielādējas pilnībā arī tad, ja vajag tikai vienu ražotāju.
5. **Peles ritināšanas efekts (smooth scroll)** darbojas visās lapās, arī tur, kur nav vajadzīgs.

## Ko atradu par darbību (kas „nestrādā kā vajag")

6. **E-pasti var neaiziet, bet sistēma rāda „nosūtīts".** Nododot darbu kolēģim, programma nepārbauda, vai vēstule tiešām aizgāja.
7. **Modeļa maiņa sarakstā var paņemt nepareizu cenu** — ja precei ir vairākas atbilstošas cenas, tā paņem visdārgāko.
8. **Saglabāšanas kļūda tiek noklusēta** — ejot no saraksta uz katalogu, ja saglabāšana neizdodas, tik un tā aizved uz katalogu, un izmaiņas pazūd.
9. **Divi cilvēki vienlaikus** var pārrakstīt viens otra izmaiņas sarakstā — nav pārbaudes.
10. **Admina pieprasījumu saraksts** velk visu tabulu bez ierobežojuma.

## Ko jau izdarīju

- Samazināju smagās bildes: „Par mums" lielā bilde 1 075 KB → 86 KB; veikalu bildes 820 → 308 KB, 644 → 253 KB, 605 → 232 KB, 496 → 183 KB; showroom 362 → 134 KB.

## Ko piedāvāju darīt tālāk (secībā)

### A. Ātrums
- Katalogu pārlikt tā, lai serveris atdod tikai vienu lapu preču (piem. 48 gab.) ar jau uzliktiem filtriem, nevis visu katalogu. Filtru sarakstus (ražotājs, kategorija, krāsa, cena) rēķina serveris.
- Sākumlapā tehnoloģiju un kategoriju bildes ielādēt tikai tad, kad tās nonāk ekrānā.
- Sadalīt lielo preces logu pa ražotājiem, lai ielādējas tikai vajadzīgā daļa.
- Smooth scroll atstāt tikai tajās lapās, kur tas tiešām vajadzīgs.
- Izdzēst neizmantotās smagās bildes (~12 MB), ko neviena lapa vairs nelieto.

### B. Darbība
- Nodošanas un „Pabeigts" darbības: pārbaudīt, vai vēstule aizgāja, un godīgi parādīt, ja nē.
- Modeļa maiņai cenu ņemt pēc precīzas krāsas un izmēra atbilstības, nevis visdārgāko.
- Ja saglabāšana neizdevās — nepārslēgt uz katalogu, bet parādīt kļūdu.
- Sarakstam pievienot pārbaudi pret vienlaicīgu pārrakstīšanu.
- Admina pieprasījumu sarakstam pievienot ierobežojumu un kārtošanu serverī.

## Kas man vajadzīgs no Tevis

Uzraksti, kuras konkrētās vietas „nestrādā kā vajag" (piem. katalogs, preču saraksts, e-pasti, admins), lai sāku no tām.

## Tehniskās piezīmes

- `UnifiedCatalog.tsx:406-590` — pilna `catalog_items` + `catalog_price_ranges` ielāde ar 1000 rindu partijām; ~855 KB uz 1000 rindām.
- `CatalogItemDialog.tsx:993-1008` — `catalog_variant_prices` pilna lapošana katrai atvēršanai (113 081 rinda tabulā).
- `quote-action/index.ts:76-103`, `send-quote-request/index.ts:78-101` — e-pasta `invoke` kļūda netiek pārbaudīta.
- `WorksheetPickBar.tsx:90-93` — `Math.max` pa cenu kandidātiem.
- `WorksheetPage.tsx:84-94,114-150` — `save()` kļūda ignorēta; optimistisks statusa atjauninājums.
- `AdminQuotes.tsx:96-99` — `select("*")` bez `limit`.
