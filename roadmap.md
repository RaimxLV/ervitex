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

- [x] Saskaņot visu kataloga kartīšu cenu ar uzreiz atvērtās krāsas cenu un saglabāt krāsas izvēli saitē.

## Vizuālie uzlabojumi
- [x] Atjaunot sākumlapai vieglu ritināšanas izlīdzinājumu un skaidri pamanāmu, optimizētu hero dziļuma efektu.
- [x] Aizstāt LV/EN tekstu ar vienu glancētu apaļu karodziņu; datorā otru valodu rādīt vertikāli hover stāvoklī.
- [x] Aizvietot DTF galerijas dubulto attēlu ar jauno optimizēto foto.
- [x] Pārbūvēt tehnoloģiju galerijas modernākā, nepārtrauktā struktūrā bez tukšas pēdējās lapas.
- [x] Pacelt publisko lapu mazos tekstus līdz vienotam, salasāmam izmēram.
- [x] Aizstāt “Par Ervitex” rūtiņu fonu ar vieglu auduma tekstūru.
- [x] Palielināt visas mājaslapas fontus par 2 px.
- [x] Paplašināt mega izvēlni līdz 95%, palielināt tās tekstus un sakārtot mobilo izvēlni.
- [x] Pārsaukt “Pakalpojumi” par “Apdrukas risinājumi”, sakārtot izvēlnes un pievienot Termodruku.
- [x] Sakārtot “Apdrukas risinājumi” kartīšu izkārtojumu (3+2, centrēts).
- [x] Sakārtot katalogu: kompaktāka augšējā laukuma, lielāki filtri, tīrākas produktu kartītes.
- [x] Salabot kataloga tiešo atvēršanu un paātrināt mega izvēlni ar plūstošu animāciju.

### P0
- [x] Pārrēķināt NWG cenas pēc zīmola atlaides: Clique −63%, Craft −50%, ProJob −40%, Cutter & Buck −40%; pēc tam ×1,75.
- [x] Salabot PF Concept cenu sinhronizāciju.
- [ ] Pilnībā atjaunot NWG līgumcenas ar klienta lietotājvārdu/paroli un pārbaudīt katru aktīvo SKU.
- [x] Rādīt katra piegādātāja cenu pārklājumu un novērst NWG noraidīto SKU bezgalīgu atkārtošanu.
- [x] NWG katalogā parādīt visus produktus ar visām pieejamajām cenām.
  - [x] Deterministiska modeļu un SKU lapošana bez izlaistām rindām.
  - [x] Rotējošā tokena un paralēlo procesu lease aizsardzība kodā.
  - [ ] Visām aktīvajām NWG variācijām ir pārbaudīta līgumcena; pašlaik 4 655 aktīvajām četru publisko zīmolu variācijām tās trūkst.
  - [ ] Visiem pārdošanā esošajiem NWG modeļiem katalogā cena balstās uz pārbaudītu līgumcenu.
- [x] Automātiski aizvērt karājošos “procesā” sinhronizāciju ierakstus.
- [ ] SEO sagatavots; gaida atļauju noņemt noindex un robots Disallow (Google ieslēgšana).


### P1
- [ ] Kategorizēt 242 modeļus bez kategorijas (145 nwg, 97 bb) + admin atskaite.
- [ ] Salabot 14 Beechfield modeļus bez cenas un PF bāreņu cenu ierakstus.
- [ ] Pievienot Russell automātisko sinhronizāciju.
- [ ] E-pasta paziņojumi par jauniem un neatbildētiem klientu pieteikumiem (18 no 20 karājas).

### P2
- [x] Drošības audits 01.10: dzēsta create-super-admin, slēptas iepirkuma cenas, iekšējās funkcijas tikai serverim.
- [x] Dzēsti vecie service worker faili.
- [ ] Noņemt `no-store` meta tagus; sakārtot ESLint kļūdas edge funkcijās; sadalīt `CatalogItemDialog.tsx`.

## Pieprasījumu plūsma (pabeigts 22.09.2026)
- [x] Numurs `ERV-DDMM-NNN` katram pieteikumam, tēmā `[#ERV-...]`
- [x] E-pastā vairs nav nodošanas un pabeigšanas pogu; nodošana notiek pie konkrētā pasūtījuma
- [x] `quote-action` funkcija: nodod, sūta pieteikumu darbiniecei ar Reply-To uz klientu, atzīmē pabeigtu
- [x] (01.10.2026) Admina "Pieprasījumi" kļuvis par vienkāršu vēsturi "Visi pasūtījumi": bez statusu cilnēm, kavēšanās brīdinājumiem, krāsām un piešķiršanas — paliek meklētājs, atvēršana, "Rakstīt klientam", saraksta saite, dzēšana. Darbinieki strādā pa Outlook.
- [x] Katalogā/piedāvājumos poga „Kopēt piedāvājuma saiti"
- [x] Evitas e-pasts: info@t-bode.lv; Raimonds: ofsetadruka@gmail.com

## Kopīgais preču saraksts (pie pieprasījuma)
- [x] Saraksta bloks dzīvo pie pieprasījuma, atveras pēc saites (/saraksts/:token).
- [x] Rediģēšana tiešsaistē: izmērs, skaits, preces cena, piezīme, rindas dzēšana.
- [x] Apdruka: Sietspiede / DTF / Izšūšana / Sublimācija / Cita, vairākas vienā precē, cena ar roku.
- [x] Summas bez PVN un ar PVN pārrēķinās uzreiz.
- [x] E-pastos paliek viena treknraksta bordo saite uz individuālo preču sarakstu.
- [x] Adminā: "Preču saraksts" un "Kopēt saraksta saiti".
- [x] Kopējās apdrukas izmaksas ir atsevišķā, vienmēr redzamā blokā zem precēm; prece nav jāatver.

## Vienotā klienta–preču saraksta plūsma
- [x] Pilns esošās klienta, e-pasta, kopīgā saraksta un admina plūsmas audits.
- [x] Konkurentu un B2B piedāvājumu rīku UI/UX salīdzinājums.
- [x] Apstiprināts vienotas plūsmas pārbūves plāns: viena saraksta datu vieta un viena galvenā e-pasta poga.
- [x] Pārbūvēt plūsmu līdz galam: modeļa maiņa, krāsas/izmēra maiņa un jaunu preču pievienošana pašā preču sarakstā.
- [x] E-pasti: noņemt preču tabulas/nosaukumus un visas dublētās pogas; atstāt vienu pamanāmu saiti uz individuālo preču sarakstu, saraksti neveidojot mājaslapā.
- [x] Mega izvēlnes sarkanās pogas krāsojums: 24 s plūstošs cikls (duration-* klase to paātrināja līdz 0,7 s)
- [x] Vienādot visas publisko lapu melnās ievadjoslas ar kompakto kataloga galveni.

## Pieprasījuma plūsmas uzlabojums (28.09.2026)
- [x] Padarīt klienta pirmo rediģēšanu pārskatāmu un droši saglabājamu.
- [x] Padarīt Lauras nodošanu kolēģēm un e-pasta atbildes darbību nepārprotamu.
- [x] Saglabāt preču maiņas un atbildīgā maiņas vēsturi, lai nekas nepazūd.
- [x] Pārbaudīt pilno plūsmu no klienta pieprasījuma līdz kolēģes atbildei.
- [x] Nodalīt “Saglabāt izmaiņas”, gatavās e-pasta pogas kopēšanu un aizvēršanu.
- [x] Noņemt iekšējo ziņas klientam formu; saraksti atstāt tikai parastajā e-pastā.
- [x] Pilnībā pārbaudīt saraksta saglabāšanu, kopēšanu, aizvēršanu un nodošanu no e-pasta.
- [x] Noņemt projektu vadītāju izvēles pogas no e-pasta un aizstāt saraksta pogu ar universālu bordo teksta saiti.
