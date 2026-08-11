# NWG kataloga pilns audits un sakārtošana

Stanley/Stella netiks aiztikts. Darbs attiecas tikai uz NWG (Craft, Clique, ProJob, Cutter & Buck).

## Audita secinājumi

- `641001` un `641006` datubāzē nav sajaukti: NWG API atgriež `641001 — 1001 MATERIALS INBAG`, savukārt otrajā ekrānattēlā atvērta cita prece `641006 — 1006 TOOL POCKET`.
- NWG pamatdati pēdējo reizi pilnībā sinhronizēti 20. jūlijā, tāpēc publiskais katalogs nav droši salīdzināms ar šodienas partnera lapu.
- Pašreizējais sinhronizators pretēji tā aprakstam meklē visā globālajā NWG katalogā pēc burtiem/cipariem, nevis lasa mūsu aktuālo sortimentu. Tas ir galvenais “svešu” un vecu modeļu avots.
- Publiskajā katalogā ir 2616 NWG modeļi, tostarp zīmoli, kuriem tur nevajadzētu būt; frontendā tie tiek paslēpti, bet datu slānis joprojām ir nekorekts.
- Atrasti 3 attēli, kuru `product_number` nepieder attēla variantam.
- 167 publiski atlasīti partneru modeļi ir nepilnīgas čaulas bez kategorijas un apraksta; 273 nav kategorijas.
- NWG līgumcena ir saņemta tikai daļai SKU. Formula līgumcenai ir pareiza: `iepirkuma cena × 1.67 × 1.21`. Ja līgumcenas nav, pašreiz tiek rādīta NWG publiskā mazumtirdzniecības cena ar PVN, nevis izdomāta cena.

## Ko labošu

### 1. Pārbūvēšu NWG sinhronizāciju uz aktuālo sortimentu
- Iegūšu sortimenta koku un produktus tikai no mūsu pieejamajiem sortimentiem, nevis no globālas teksta meklēšanas.
- Saglabāšu tikai Craft, Clique, ProJob un Cutter & Buck zīmolus.
- Pilnas veiksmīgas sinhronizācijas beigās arhivēšu modeļus, kuri vairs nav partnera aktuālajā plūsmā.
- Sinhronizācijas kļūdas gadījumā neko automātiski neizdzēsīšu/nearhivēšu.

### 2. Salabošu datu sasaistes
- Validēšu ķēdi `modelis → krāsas variants → SKU/izmērs → attēls → cena`.
- Izlabošu 3 konstatētās nepareizās attēlu piesaistes.
- Neļaušu turpmāk saglabāt variantu, SKU vai attēlu zem cita modeļa koda.
- No publiskā kataloga izslēgšu nepilnīgas čaulas un modeļus bez derīga aktīva varianta.

### 3. Pabeigšu cenu sinhronizāciju
- Līgumcenas ielasīšu tikai aktuālā NWG sortimenta SKU.
- Pārbaudīšu, ka katrai līgumcenai gala cena ir tieši `X × 1.67 × 1.21`.
- Skaidri nodalīšu līgumcenu no NWG publiskās cenas, lai viena netiktu kļūdaini uzskatīta par otru.

### 4. Pārbaude pirms publiskošanas
- Salīdzināšu nejaušu paraugu no katra zīmola ar partnera API: kods, nosaukums, attēls, krāsa, izmērs un cena.
- Atsevišķi atkārtoti pārbaudīšu `641001` un `641006`.
- Pārbaudīšu kataloga kartīti un produkta lapu desktopā un mobilajā skatā.
- Sagatavošu skaitlisku atskaiti: cik modeļu palika, cik arhivēti, cik bez cenas/attēla un vai ir palikusi kaut viena neatbilstoša saite.

## Drošības robeža

Neviena Stanley/Stella tabula, funkcija, cena, lapa vai kartīte šajā darbā netiks mainīta.
