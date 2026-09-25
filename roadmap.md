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

## Vizuālie uzlabojumi
- [x] Pacelt publisko lapu mazos tekstus līdz vienotam, salasāmam izmēram.
- [x] Aizstāt “Par Ervitex” rūtiņu fonu ar vieglu auduma tekstūru.
- [x] Palielināt visas mājaslapas fontus par 2 px.
- [x] Paplašināt mega izvēlni līdz 95%, palielināt tās tekstus un sakārtot mobilo izvēlni.
- [x] Pārsaukt “Pakalpojumi” par “Apdrukas risinājumi”, sakārtot izvēlnes un pievienot Termodruku.

### P0
- [x] NWG katalogā parādīt visus produktus ar visām pieejamajām cenām.
  - [x] Deterministiska modeļu un SKU lapošana bez izlaistām rindām.
  - [x] Rotējošā tokena un paralēlo procesu lease aizsardzība kodā.
  - [x] Visiem 64 409 NWG izmēriem ir cena (iepriekš 659 bija tukši).
  - [x] Visi 2 833 pārdošanā esošie NWG modeļi katalogā ar cenu.
- [x] Automātiski aizvērt karājošos “procesā” sinhronizāciju ierakstus.
- [ ] Izlemt par SEO: noņemt `noindex` un `robots.txt Disallow: /`, pievienot og/twitter/canonical/sitemap.


### P1
- [ ] Kategorizēt 242 modeļus bez kategorijas (145 nwg, 97 bb) + admin atskaite.
- [ ] Salabot 14 Beechfield modeļus bez cenas un PF bāreņu cenu ierakstus.
- [ ] Pievienot Russell automātisko sinhronizāciju.
- [ ] E-pasta paziņojumi par jauniem un neatbildētiem klientu pieteikumiem (18 no 20 karājas).

### P2
- [ ] Sašaurināt publisko piekļuvi `catalog_overrides`, `mf_stock`, `ss_stock`.
- [ ] Dzēst dublējošo service worker un 6 neizmantotās komponentes.
- [ ] Noņemt `no-store` meta tagus; sakārtot ESLint kļūdas edge funkcijās; sadalīt `CatalogItemDialog.tsx`.

## Pieprasījumu plūsma (pabeigts 22.09.2026)
- [x] Numurs `ERV-DDMM-NNN` katram pieteikumam, tēmā `[#ERV-...]`
- [x] E-pastā vairs nav nodošanas un pabeigšanas pogu; nodošana notiek pie konkrētā pasūtījuma
- [x] `quote-action` funkcija: nodod, sūta pieteikumu darbiniecei ar Reply-To uz klientu, atzīmē pabeigtu
- [x] Admina cilnes: Nenodotie / Mani / Visi aktīvie / Pabeigtie + brīdinājums >2 dienām
- [x] Katalogā/piedāvājumos poga „Kopēt piedāvājuma saiti”
- [x] Evitas e-pasts: info@t-bode.lv; Raimonds: ofsetadruka@gmail.com

## Kopīgais preču saraksts (pie pieprasījuma)
- [x] Saraksta bloks dzīvo pie pieprasījuma, atveras pēc saites (/saraksts/:token).
- [x] Rediģēšana tiešsaistē: izmērs, skaits, preces cena, piezīme, rindas dzēšana.
- [x] Apdruka: Sietspiede / DTF / Izšūšana / Sublimācija / Cita, vairākas vienā precē, cena ar roku.
- [x] Summas bez PVN un ar PVN pārrēķinās uzreiz.
- [x] E-pastos paliek viena poga uz individuālo preču sarakstu.
- [x] Adminā: "Preču saraksts" un "Kopēt saraksta saiti".

## Vienotā klienta–preču saraksta plūsma
- [x] Pilns esošās klienta, e-pasta, kopīgā saraksta un admina plūsmas audits.
- [x] Konkurentu un B2B piedāvājumu rīku UI/UX salīdzinājums.
- [x] Apstiprināts vienotas plūsmas pārbūves plāns: viena saraksta datu vieta un viena galvenā e-pasta poga.
- [x] Pārbūvēt plūsmu līdz galam: modeļa maiņa, krāsas/izmēra maiņa un jaunu preču pievienošana pašā preču sarakstā.
- [x] E-pasti: noņemt preču tabulas/nosaukumus un visas dublētās pogas; atstāt vienu pogu uz individuālo preču sarakstu, saraksti neveidojot mājaslapā.
