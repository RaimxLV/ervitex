# MF akciju cenu labojums — root 14:24 pārstrāde

## Statuss
- Plašais 009 noraidīts un aizstāts. DB NAV piemērota, 009 NAV staged (`migration_stage` 009 rindas: 0). Frontend nav publicēts.
- Izvietots tikai `malfini-sync`: deploy source SHA-256 `d7dd1b57952e8b25a36860fa664858e77e7773c1ae177e90498a02b47e6c77d9`. Funkcija, refresh un sync netika izsaukti.
- Atceltas jaunākās neizvietotās UTT/F&R/SS/NWG/PF cenu un izņemšanas izmaiņas, kā arī UTT outlet frontend izmaiņa. Iepriekšējie nesaistītie labojumi saglabāti.

## Izvietotā MF uzvedība
- Ne-akcijas SKU, arī jaunām precēm, turpina esošo dokumentēto plūsmu: unit/limit=1 cena ×1,75.
- Modeļa `OUTLET` vai SKU `outlet != 0`: importētājs neraksta ne atlaides cenu, ne `null`; esošā exact-SKU rinda netiek dzēsta.
- Trūkstoša unit cena tiek izlaista; ieteiktā cena vai cita izmēra/krāsas cena netiek aizvietota.
- Turētā cena nav marķēta vai apgalvota kā verificēta standarta cena.

## Sagatavotais SQL
- Fails: `docs/pending-migrations/009_regular_price_retention/01_apply.sql`, MD5 `d32594cd2e0aecace6068a57f8f69272`.
- Pārbauda dzīvās definīcijas: refresh MD5 `70fe11431867e526b6c12957762bd5f3`, `catalog_items` MD5 `26917678018e447c4c1d0c0e8acf1d9f`.
- Precīzās izmaiņas: `refresh.diff` un `view.diff` mapē `mf-surgical-2026-10-21`.
- Refresh saglabā tikai esošās MF publiskās rindas apstiprinātiem modeļa/SKU outlet gadījumiem; promo kandidātu filtrs paliek.
- READ ONLY apjoms: 3351 modeļa/SKU promo ieraksti, no tiem 3267 ar pašreizēju publisko cenu. Tie ir tikai held esošie ieraksti, ne 3267 verificētu standarta cenu apgalvojums. Nav pielietots vai pārrēķināts.
- View noņem tikai MF outlet-model filtru. NWG/F&R cenu klātbūtnes vārti, UTT filtri, published/hidden/manuālās un apavu izslēgšanas nav mainītas.

## Pārbaudes
- Lokāla sintētiskā PostgreSQL 17 kopija ar dzīvo shēmu/definīcijām, bez reāliem datiem: patch + regresijas + `ROLLBACK`; definīciju MD5 un 0 rindas atjaunotas.
- Regresijas: akcija sākas, trūkst kandidāta, akcija beidzas, nezināms XS netiek izdomāts, jauns normāls MF nav iesaldēts, RU ×1,70 nemainīts.
- Vitest: 57/57 faili, 353/353 testi.

## Bloķētāji
- MF139 24 outlet SKU (piem. `1394412`) cenas netiek atjaunotas: nav same-SKU droša standarta pierādījuma; 4,73 un 5,25 kopēšana aizliegta.
- Precīzie 24: `1390412,1390413,1390414,1390415,1390416,1390417,1390712,1391212,1391512,1393912,1393913,1393914,1393915,1393916,1393917,1394012,1394312,1394412,1396312,1396313,1396316,1396317,1399312,1399512`.
- 009 gaida root byte-exact staging/pārskatu.
- Dzīvajā DB vecais refresh dzēšanas guard vēl darbojas līdz SQL apstiprināšanai; tikai MF importētāja izvietošana šo DB ceļu nesalabo.
- MF akcijas bez modeļa/SKU outlet marķiera, neatkarīga normal lauka semantika un izņemšana pēc pilna sertificēta snapshot vēl nav atbalstītas/verificētas. Nekāds pilnīguma risinājums netiek apgalvots.
- Pārējo piegādātāju akciju un izņemšanas semantika nav verificēta un nav mainīta/izvietota.