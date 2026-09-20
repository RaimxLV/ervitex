# Roadmap

- [x] Pārveidot jauno Ervitex veikala fotogrāfiju par 20 gadus pamestu nakts ainu.
- [x] Aiz teksta ievietot jauno ainu ar jaudīgu peles lukturi.
- [x] Pievienot bojātu lampu mirgošanu un retas elektriskās dzirksteles.
- [x] Pārbaudīt izskatu datorā un telefonā.
- [x] Pievienot vieglu fona parallax kustību, platāku lukturi un caurspīdīgākus teksta laukumus.
- [x] Aizstāt ainas attēlu un precīzi sinhronizēt fona un luktura parallax slāņus.
- [x] Pārkārtot kontaktu lapu: speciālisti, birojs un jautājumi, karte, veikali.
- [x] Pievienot atbilstošu foto katram T-Bode veikalam.
- [x] Pārveidot biroja informācijas un ziņas bloku mūsdienīgā izkārtojumā.
- [x] Aizvietot “Par mums” luktura ainu ar depth-map vadītu 2.5D ainu no iesūtītajiem attēliem.
- [x] Saglabāt un sinhronizēt lukturi, ritināšanas kustību, lampu mirgošanu un dzirksteles.
- [x] Pārbaudīt jauno ainu datorā un telefonā.
- [x] Noņemt no “Par Ervitex” ainas lukturi, mirgojošās gaismas, dzirksteles un pilienus.
- [x] Sakārtot depth-map parallax, lai aina aizpilda visu stāsta bloku visās ierīcēs.
- [x] Pārbaudīt ainu datorā, planšetē un telefonā.
- [x] Pilns tehniskais audits (rezultāts: Faili → ervitex-audits-2026-09-20.md).

## No audita — jāsalabo

### P0
- [ ] NWG katalogā parādīt visus produktus ar visām pieejamajām cenām; bez manuālas paroles vai sesijas atjaunošanas.
  - [x] Deterministiska modeļu un SKU lapošana bez izlaistām rindām.
  - [x] Rotējošā tokena un paralēlo procesu lease aizsardzība kodā.
  - [ ] Pārbaudīt pilnu produktu un cenu ciklu.
- [ ] Izlemt par SEO: noņemt `noindex` un `robots.txt Disallow: /`, pievienot og/twitter/canonical/sitemap.
- [ ] Automātiski aizvērt karājošos “running” sinhronizāciju ierakstus (nwg:all, nwg:styles, pf:refresh).

### P1
- [ ] Kategorizēt 242 modeļus bez kategorijas (145 nwg, 97 bb) + admin atskaite.
- [ ] Salabot 14 Beechfield modeļus bez cenas un PF bāreņu cenu ierakstus.
- [ ] Pievienot Russell automātisko sinhronizāciju.
- [ ] E-pasta paziņojumi par jauniem un neatbildētiem klientu pieteikumiem (18 no 20 karājas).

### P2
- [ ] Sašaurināt publisko piekļuvi `catalog_overrides`, `mf_stock`, `ss_stock`.
- [ ] Dzēst dublējošo service worker un 6 neizmantotās komponentes.
- [ ] Noņemt `no-store` meta tagus; sakārtot ESLint kļūdas edge funkcijās; sadalīt `CatalogItemDialog.tsx`.
