# Roadmap

## Komandas foto nomaiņa — 09.10.2026
- [ ] Adminā izvēlēties jaunu foto, saglabāt un pārbaudīt kontaktu lapā; saglabāt kadrēšanas iespējas.

## Preču saraksta izskata audits — 09.10.2026
- [x] Palielināts logo, noņemti apdrukas skaidrojumi un numurētās instrukcijas, prece/krāsa/izmērs/daudzums/summa sakārtoti saskaņotās kolonās; kontakti atsevišķos laukos, apdruka un kopsavilkums vienādoti. Īsts saraksts pārbaudīts klienta un autentificēta admina skatā, atvērta rediģēšana un pārbaudīts drukas skats; bez pārplūdes un lapas kļūdām, build OK. Cenas un saglabāšanas loģika nemainīta.

## Sākumlapas virsraksta maketi — 09.10.2026
- [ ] Jauns izkārtojums: „Vairumtirdzniecības tekstila risinājumi" kā viena frāze — tikai „Vairumtirdzniecības" izcelts un sarkans, „tekstila risinājumi" balts; „& industriālā apdruka" sarkans. Piedāvāt variantus, ieviest izvēlēto un pārbaudīt datorā un telefonā.

## Sākumlapas galvenais virsraksts — 09.10.2026
- [x] Virsraksts nomainīts uz „Vairumtirdzniecības tekstila risinājumi & industriālā apdruka”; „Vairumtirdzniecības” sarkanā krāsā; izlikts trijās rindās, lai abas pogas un statistika paliek redzami bez ritināšanas. Pārbaudīts 1449x893, 1280x900 un 390x844.
- [x] Galvenē novērsta sadursme: „Stanley/Stella” nozīmīte un meklēšanas ikona vairs nesaskaras ar izvēlnes vārdiem; izvēlnes vienumi nepārlaužas; 1280–1920 px bez pārplūdes.
- [x] Izkārtojums un tekstu stili paliek tādi paši; tikai „Vairumtirdzniecības” kļūst par galveno, lielāko vārdu (pilns izmērs ~99 px datorā); pārējās rindas netiek aiztiktas. Konteineris paplašināts uz 52rem un vertikālais padding samazināts, lai statistika paliek redzama. Pārbaudīts 1449x893, 1280x900 un 390x844 — bez pārplūdes un kļūdām; build OK.


## Sākumlapas virsraksta izskats — 09.10.2026
- [x] „tekstila risinājumi” ar mazo „t”; „& industriālā” un „apdruka” katrs savā rindā (kopā 4 rindas).
- [x] viss virsraksts krietni treknāks — `.hero-ultra` (`-webkit-text-stroke: 0.028em`), jo fonta maksimums ir 700; rindas augstums 0.95, lai 4 rindas un statistika joprojām der ekrānā (1449x893: statistikas apakša 880 px). Pārbaudīts pārlūkā: malas tīras, rindas nepārklājas, abas pogas un skaitļi redzami.

## Meklētāja pārklājums un Stanley/Stella prioritāte — 08.10.2026

- [x] Noņemta melnā josla; meklētāja logs atveras pāri lapas saturam, nepārbīdot lapu.
- [x] Pārlūkā “16” piedāvā vairākas Stanley/Stella preces vispirms, “169” pirmais STTU169, ielādējas visas 8 bildes, “STTU169” atstāj vienu un atver Creator 2.0. Septiņi testi sekmīgi, lapas kļūdu nav.

## Pilns publiskās lapas stila audits — 08.10.2026
- [x] Pārbaudītas visas publiskās lapas datorā un telefonā; zilais tekstos noņemts, mazie sadaļu virsraksti vienādoti sarkani ar līniju, sakārtots virsrakstu burtu ritms un akcenti. Nav horizontālu pārplūžu; “Par mums” ielāde pārbaudīta atsevišķi.

## Tehnoloģiju lapas lietojuma sadaļas dizains — 08.10.2026
- [x] Saglabāts esošais “Piemērota izvēle” teksta izkārtojums un visās tehnoloģiju lapās melnais pilna platuma bloks aizvietots ar izvēlēto izteiktāko, centrēto gaiši pelēko paneli.

## Zemākā sākuma cena — 08.10.2026
- [x] Kartītēs sākumā rādīt zemāko cenu un atbilstošo krāsu; preces skatā izvēlēties zemākās cenas izmēru, saglabājot apzinātu izvēli; arī saistīto preču kartītēs.
- [x] Četri cenu izvēles testi sekmīgi; pārlūkā GI12000 kartītē un preces skatā €2,90 ar PVN, Royal/S, bez lapas kļūdām.

## UTT katalogs (Gildan, Kariban, Regatta) — 07.10.2026
- [x] Tiešs UTT API pieslēgums ar ikdienas automātisku preču, cenu un atlikumu atjaunošanu (katru nakti 02:50); Gildan ×2, Kariban ×1,8, Regatta ×1,75. 559 modeļi, 20 659 varianti.
- [x] Bildes automātiski pārnestas uz mūsu serveri (6 802 bildes; UTT aizliedz hotlinking).
- [x] Gildan, Kariban, Regatta ražotāju filtrā, preces skatā un admina sinhronizāciju/cenu audita panelī; pārbaudīts pārlūkā.

## Ražotāju uzcenojums un kontakti — 07.10.2026
- [x] Craft, ProJob un Cutter & Buck koeficientu ×1,75 aizstāt ar ×1,5; atlaides un PVN nemainīt. Pārbaudītas 54 006 variāciju cenas bez neatbilstībām, cenu diapazoni saskan, Craft cenas redzamas publiskajā katalogā; Clique nemainīts.
- [x] Piedāvāt kontaktu izkārtojumu: Laura, Ilona, Santa, Justīne pirmajā rindā; Evita otrajā; Vilnis un Ēriks atsevišķā trešajā rindā.
- [x] Ieviests un pārlūkā pārbaudīts kontaktu izkārtojums 4+1+2: vadība trešajā rindā ar lielāku atstarpi, bez papildu virsraksta; vienādi kartīšu platumi.
- [x] Komandas rindas atdalītas ar grafisku elementu: katra grupa sākas ar mazu pelēku CAPS parakstu un plānu līniju („Projektu vadītāji", „Mazumtirdzniecība", „Vadība"); pārbaudīts 1280 un 390 px bez pārplūdes, kartītes nemainītas.

## Profesionālas ikonas — 07.10.2026
- [x] Izskaidrot gatava licencēta komplekta un dizainera veidotu ikonu iespējas pēc lietotāja atsaucēm.
- [ ] Aizvietot noraidītās ikonas; gaida lietotāja izvēlētu profesionālu komplektu vai tā failus.

## Tehnoloģiju kontrasts — 07.10.2026
- [x] Ieviest gaišas priekšrocības un tumšu lietojuma sadaļu visām tehnoloģijām; “Par mums” krāsas un animācijas.
- [x] Precizēt ikonas: īpaši uzzīmēti apģērbu tirāžas, personalizācijas, diegu spoļu, uzšuvju, reljefa, auduma, transfēra plēves, floka un atstarošanas simboli. Piecas lapas pārbaudītas bez kļūdām; hover pacelšanās 6px, datorā/telefonā bez pārplūdes.

## Mazās sarkanās ikonas — 07.10.2026
- [x] Auditēt publisko lapu sarkanās ikonas: vienots 1,5 līniju svars un maigs fons kā “Par mums”; precizēti cenas, krāsu un grāmatvedības simboli, kopšanas ikonās vairs nav nejaušu aizvietojumu. Pārlūkā pārbaudītas visas piecas tehnoloģijas un kontakti bez kļūdām; 3 kopšanas simbolu testi sekmīgi.

## Galerijas — 06.10.2026
- [x] Pievienot 8 optimizētās Sublimācijas bildes arī kopīgajai galerijai; WA0021 kā titula attēlu (−48,5% svara).
- [x] Auditēt galerijas: ielādēt un dekodēt pirms nomaiņas, saglabāt iepriekšējo kadru, iesildīt blakus attēlus, apturēt automātiku ārpus skata; labota arī GitHub tehnoloģiju attēlu adrese. Piecas tehnoloģijas un mozaīka pārbaudītas 1280/390 px ar aizkavētu īsto CDN attēlu piegādi; 3 automātiskie testi sekmīgi.

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
- [x] Pievienot izvēlēto melno sākumlapas fotomozaīku no visu tehnoloģiju galerijām; pārbaudītas nejaušas pārejas, ielādēti foto un izkārtojums datorā un telefonā bez pārplūdes.
- [x] Noņemt stāva etiķeti, ieejas norādi nostiprināt 16px no kreisās un apakšējās malas; precizēt durvis, pastiprināt kontūras un secīgi pulsēt; pārbaudīts datorā un telefonā.
- [x] Aizstāt biroja logu kopējo kontūru ar 12 atsevišķām logu un precīzu durvju kontūru; viegls mirdzums, pulsēšana, bez peles pildījuma; pārbaudīts datorā un telefonā.
- [x] Biroja foto aizpilda kartes augstuma laukumu; caurspīdīgas norādes bez šķībajām kontūrām, pārbaudīts telefonā un datorā.
- [x] Kontaktos aizstāt ēkas skici ar foto un interaktīvi izcelt D ieeju un biroja logus pēc zilajām atzīmēm; pārbaudīts klikšķis, tastatūra un telefona skats.
- [x] Pilns publisko lapu telefona audits: sabalansēti fonti, lauki un atstarpes, desktopu nemainot.
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
- [x] Sietspiedes galerijai pievienot vēl 2 bildes (BOLD reljefs, ceha kaudze uz oranža) un optimizēt uz WebP.
