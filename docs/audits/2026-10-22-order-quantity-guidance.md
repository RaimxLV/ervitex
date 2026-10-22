# Pasūtījuma daudzuma norādes — priekšskatījums

## Rezultāts
- Vienīgais kopīgais noteikumu avots ir `src/lib/orderMinimums.ts`; uzvedība paliek informatīva. Netika pievienota pasūtījuma vai daudzuma bloķēšana.
- Tekstils 10; ieteikums 5 katrai krāsas **un izmēra kombinācijai**. Somas 10; ieteikums 5 **vienā krāsā**, bez izmēra ieteikuma.
- Prezentmateriāli bez/ar apdruku 10/25, rakstāmlietas 25/50. Blociņi nav rakstāmlietas.
- Gadžeti, lietussargi un faktiskās sublimācijas sadaļas preces 10.
- Nezināmai precei vispārīgā norāde ir 10 bez piegādātāja izdomāta apdrukas sliekšņa vai tekstila ieteikuma. Iepriekš PF nezināmās preces automātiski saņēma 10/25, pārējie piegādātāji tekstila ieteikumu, ETX automātiski sublimāciju; šī piegādātāja balstītā klasifikācija noņemta.
- Kategorija ir prioritāra; ja tās nav vai tā nenosaka grupu, izmanto oriģinālo preces tipu/nosaukumu. Plaša Textiles/Clothing piederība nepārspēj somas tipu. Sublimācijas prioritāte izmanto kopīgo `isEtxCategory` un skaidri nosauktu sublimācijas kategoriju, ne aprakstu, tulkojumu vai piegādātāju.
- Tieši viens vienkrāsains tumši pelēks panelis zem galerijas un dalīšanās pogām visos ekrānos. AddToQuoteBlock to nedublē detaļu lapā, bet saglabā patstāvīgā lietojuma iespēju.
- LV/EN tekstu atbilstība saglabāta; abi apdrukas sliekšņi redzami vienlaikus. Pirms preces metadatu ielādes nerāda nepamatotu vispārīgo paneli.

## Mainītie faili
- `src/lib/orderMinimums.ts`
- `src/lib/orderMinimums.test.ts`
- `src/components/quote/OrderMinimumNotice.tsx`
- `src/components/quote/AddToQuoteBlock.tsx`
- `src/components/catalog/CatalogItemDialog.tsx`
- `src/styles.css` (semantiskie paneļa krāsu/ēnas tokeni; noņemts gradients un pulsēšana)
- `AGENTS.md`, `roadmap.md`, šis pārskats un esošā pasūtījumu daudzumu projekta atmiņa.

## Īstas pārbaudāmās preces
Visas saites atver priekšskatījumu, ne publicēto versiju.

| Noteikums | Prece | Saite |
|---|---|---|
| Tekstils 10 + ieteikums krāsai/izmēram | Stanley/Stella MINI CRUISER2.0 STSK180 | [Apskatīt](https://id-preview--720c1872-d106-476c-970d-190420757416.lovable.app/catalog/item/ss/STSK180) |
| Prezentmateriāls 10/25 | Bahia 330 ml ceramic mug 100364 | [Apskatīt](https://id-preview--720c1872-d106-476c-970d-190420757416.lovable.app/catalog/item/pf/100364) |
| Blociņš 10/25, ne rakstāmlieta | Teak A5 recycled hard cover notebook 106013 | [Apskatīt](https://id-preview--720c1872-d106-476c-970d-190420757416.lovable.app/catalog/item/pf/106013) |
| Rakstāmlieta 25/50 | Rattan bamboo and recycled plastic ballpoint pen 106026 | [Apskatīt](https://id-preview--720c1872-d106-476c-970d-190420757416.lovable.app/catalog/item/pf/106026) |
| Soma 10 + ieteikums tikai krāsai | Panama zippered tote bag 20L 119179 | [Apskatīt](https://id-preview--720c1872-d106-476c-970d-190420757416.lovable.app/catalog/item/pf/119179) |
| Gadžets 10 | Boompods Beachboom Mini 5W speaker 120829 | [Apskatīt](https://id-preview--720c1872-d106-476c-970d-190420757416.lovable.app/catalog/item/pf/120829) |
| Lietussargs 10 | Alex 21.5 inch foldable umbrella 109016 | [Apskatīt](https://id-preview--720c1872-d106-476c-970d-190420757416.lovable.app/catalog/item/pf/109016) |
| Sublimācijas sadaļa 10, arī dvielim | Ervitex Dvielis 30 x 50 CM | [Apskatīt](https://id-preview--720c1872-d106-476c-970d-190420757416.lovable.app/catalog/item/etx/9728674b-4f1d-4193-a7e0-59876c937d3e) |

## Validācija
- `bunx vitest run src/lib/orderMinimums.test.ts src/lib/etxCatalog.test.ts`: 25/25 PASS (20 daudzumu noteikumu un 5 esošās kategoriju pārbaudes).
- Aptvertas visas grupas; cepures, dvieļi, priekšauti; soma tekstilā; blociņš rakstāmlietu kombinētā kategorijā; sublimācijas krūze 10, bet parastajā krūžu kategorijā aprakstīta sublimācijas iespēja joprojām 10/25; nezināmās preces katrā avotā 10.
- Ierobežots read-only kategoriju pārskats un 1–2 oriģinālās preces no visiem deviņiem avotiem: SS Baby Bib/Mid Tote bag, MF Classic, Russell Workwear Trousers, UTT Heavy Blend sweatshirt, Falk&Ross 110 Organic Cap, Beechfield B10, NWG Sanders, PF Teak notebook, ETX Sporta maisiņš. Oriģinālā kategorija/tips/nosaukums, ne tulkots apraksts.
- Pārlūkā 8 tabulas preces × 1280 un 390 px: paredzētie sliekšņi/ieteikumi, katrai viens panelis, panelis seko galerijas dalīšanās pogām, nav horizontālas teksta pārplūdes un JavaScript kļūdu. Attēlu pārbaude: mobilais tekstila/pildspalvas panelis un datora blociņa divas kolonnas.
- Angļu režīmā telefonā pārbaudīti pen, STSK180, tote un sublimācijas dvielis: pareizi teksti un viens panelis.
- Esošie kataloga lapu head palika nemainīti: katalogam pageHead, precei catalogItemHead.

## Robežas
- Reālu sublimācijas krūzi faktiskajā ETX sadaļā atlasītajos datos neatrada; šīs pārklāšanās prioritāte pārbaudīta ar konkrētu regresijas testu, īstā sadaļas prece pārlūkā ir dvielis.
- Nezināmi/neinformatīvi avota nosaukumi saņem vispārīgu 10; klasifikācija neizdomā trūkstošu autoritatīvu kategoriju.
- Cenu formulas, varianti, krājumi, publiskā redzamība/manuālās izslēgšanas, SS/NWG un piedāvājumu iepriekšējie labojumi nav mainīti.
- Nav DB rakstījumu, sinhronizācijas, izvietošanas, publicēšanas, e-pastu vai pieprasījumu. Šim uzdevumam nav bloķētāju; iepriekšējie roadmap bloķētāji paliek atsevišķi.

## 09:18 UTC precizējums — darbinieki un visi apģērbi
- Apstiprināts cēlonis: CatalogItemDialog slēpa paneli ar `!canFlagStock`, AddToQuoteBlock ar `!isAdmin`. Noņemti tikai šie paneļa redzamības nosacījumi, ne noliktavas vadības vai autentifikācijas nosacījumi. Galerija turpina piederēt vienam panelim, standalone bloks vienu rāda arī administratoram.
- Iepriekš jau atpazina bikses, šortus, jakas, kreklus, flīsu un workwear. Trūka tiešo tipu outerwear, knitwear, softshell, sportswear, jerseys, dresses, skirts, underwear un atbilstošu LV vārdu. Apģērbu tipu atpazīšana tagad izmanto angļu veselus vārdus un ierobežotas latviešu locījumu saknes; vārdi Capsule, Capacity, Invest un Desktop vairs nerada kļūdainu tekstila ieteikumu.
- Somu krāsas ieteikums, notebook 10/25, pen 25/50 un sublimācijas 10 prioritātes saglabātas.
- 63/63 fokusēti testi PASS: 54 kategoriju/politikas, 5 ETX, 4 standalone publiska/admin paneļa un galerijas dublēšanās pārbaudes.
- Reālās publiskās preces STSK180, NWG010177 (Sanders jaka), RU0R001M0 (bikses): publiski un izolētā admin attēlojuma mock režīmā, 1280/390 px, kopā 12 pārbaudes. Visur viens panelis un 10 + ieteikums 5 krāsai/izmēram. Admin režīmā piedāvājuma izvēles virsraksts un noliktavas pogas palika redzamas. Mock lietots tikai pārlūka atbildē; nerada īstu administratora sesiju, neizmaina autorizāciju un visi DB rakstījumi/servera funkciju izsaukumi bloķēti. Īsti administratora ieraksti netika izmantoti vai veidoti.
- Priekšskatījuma build OK; dizains, izvietojums, cenas un iepriekšējie darbi saglabāti. Nav publicēšanas/izvietošanas.
- Iepriekšējais FLEXFIT6606 read-only rezultāts paliek spēkā: 306.73/6606 ir Classics/Yupoong piegādātāja prece, nav mūsu importa rindā/modelī/variantos/cenās/attēlos; nav manuāli slēpta un nav meklēšanas kļūda. Importa saraksti aptver Build Your Brand un Flexfit, ne atsevišķi Classics/NEW2026. Live/preview q=6606 rāda tos pašus 8 citus modeļus, ne pašu 6606 vai 6606T. Minimālā ieteiktā korekcija ir mērķēta atklāšanas/supplier-brand identitātes sasaistes papildināšana un tikai 306.73 modeļa parastās cenas/variantu/attēlu ielāde ar atsevišķu atļauju. Pilno supplier brand-list lapošanu avots neatdeva, tāpēc vēsturiskais precīzais izlaišanas brīdis nav pierādīts. Nekāds FR labojums vai imports nav veikts.