# Vienota pieprasījuma un preču saraksta pārbūve

## Mērķis

Viens pieprasījums ir viena dzīva darba vieta klientam un Ervitex. Nav atsevišķa “kopīgā saraksta” un vēl viena “piedāvājuma” ar kopētiem datiem.

```text
Klients izvēlas preces
        ↓
Pieprasījums + viena kopīga saite
        ↓
Klients un Ervitex labo vienu sarakstu
        ↓
Gatavs / pabeigts
```

## 1. E-pasti

- Izņemt preču tabulas un preču nosaukumus no pieprasījuma e-pastiem.
- Katram saņēmējam e-pastā atstāt vienu galveno pogu: **Atvērt preču sarakstu**.
- Noņemt atsevišķās pogas **Nomainīt modeli**, **Pabeigts** un citus darbību dublikātus.
- Klienta dati un pielikumi paliek tikai tur, kur tie vajadzīgi birojam; klienta vēstule paliek īsa.
- Darba nodošanu Ilonai, Santai, Justīnei, Evitai, Laurai vai Raimondam veikt kopīgajā darba vietā, nevis ar sešām e-pasta pogām.
- Vēstules sarakste turpinās parastajā e-pastā ar pareizu atbildes adresi.

## 2. Viena kopīga darba vieta

- Esošo `/saraksts/:token` pārvērst par pilnu pieprasījuma darba vietu.
- Tas pats saraksts redzams klientam un Ervitex; abi drīkst labot visu.
- Augšā: klients, uzņēmums, kontakti, atbildīgais, pēdējās izmaiņas un statuss.
- Zemāk: šauras preču rindas, kas atveras labošanai.
- Katrā rindā: attēls, modelis, kods, krāsa, izmērs, skaits, preces cena, apdruka un rindas summa.
- Kopsumma vienmēr redzama: preces, apdruka, bez PVN, PVN, ar PVN.
- Viena skaidra **Saglabāt** darbība un viens **Pabeigts** statuss.
- Bez pamācībām un skaidrojošiem tekstiem — tikai dati, lauki, pogas un īsi statusi.

## 3. Modeļa un varianta maiņa tajā pašā sarakstā

- Pie atvērtas preces pievienot **Mainīt modeli**.
- Meklēšana izmanto to pašu pilno katalogu un tās pašas bildes, krāsas, izmērus un cenas, ko katalogs.
- Izvēloties citu modeli, saglabāt esošos izmērus un skaitus.
- Ja jaunajam modelim kāda izmēra nav, konkrēto rindu skaidri atzīmēt un prasīt izvēlēties pieejamu izmēru; neatstāt vecā modeļa cenu.
- Krāsu un izmēru drīkst mainīt arī bez visa modeļa nomaiņas.
- Jaunu preci pievienot no tās pašas kataloga meklēšanas, neizejot no saraksta.

## 4. Apdrukas cenas

- Katrai precei var pievienot vairākas apdrukas: sietspiede, DTF, izšūšana, sublimācija vai cita.
- Katrai apdrukai: veids, vieta un manuāli ievadāma cena.
- Cenas režīms: **par gabalu** vai **kopā**. Piemēram, sietspiede — 120 € kopā.
- Aprēķins uzreiz pārrēķina rindu un visu sarakstu bez PVN un ar PVN.
- Negatīvas, nederīgas un pārmērīgas vērtības bloķēt arī datu pusē, ne tikai ekrānā.

## 5. Admina plūsma

- Pieprasījumu sarakstā galvenā darbība ir **Atvērt sarakstu**.
- No konkrēta pieprasījuma izņemt **Izveidot piedāvājumu**, jo tas pašlaik izveido novecojošu kopiju.
- Noņemt atkārtoto preču tabulu no atvērtās admina rindas; īsajā rindā atstāt klientu, daudzumu, atbildīgo, datumu un statusu.
- Atbildīgā izvēle, rakstīšana klientam, saites kopēšana, pabeigšana un dzēšana paliek vienuviet pie konkrētā pieprasījuma.
- Statusi kļūst vienoti: **Jauns**, **Darbā**, **Gaida klientu**, **Pabeigts**.
- Zaļš — jauns, neitrāls/zils — darbā vai gaida klientu, sarkans — kavējas, pelēks — pabeigts.

## 6. Dati un pāreja

- `quote_requests.worksheet_items` kļūst par vienīgo aktuālo preču, cenu un apdrukas datu vietu šai plūsmai.
- Sākotnējās klienta preces vienreiz ieplūst šajā sarakstā; turpmāk visas vietas lasa vienus un tos pašus datus.
- Atsevišķos `pm_offers` neatmest uzreiz: saglabāt vecajiem un patstāvīgi izveidotiem piedāvājumiem, bet vairs neveidot tos no klienta pieprasījuma.
- Esošajiem pieprasījumiem saglabāt pašreizējās saites un datus.
- Viena saite paliek bez pieslēgšanās, bet ir gara, neuzminama, atsaucama un pēc pabeigšanas slēdzama labošanai.
- Pievienot īsu izmaiņu vēsturi: kas, kad un ko mainīja; bez komentāru vai sarakstes moduļa.

## 7. Pārbaude

- Pārbaudīt pilnu ceļu: katalogs → pieprasījums → biroja vēstule → darba nodošana → modeļa maiņa → apdrukas cena → klienta labojums → pabeigšana.
- Pārbaudīt, ka viena un tā pati summa un preces redzamas abās pusēs pēc pārlādes.
- Pārbaudīt telefonu un datoru, garus preču sarakstus, vairākus izmērus un vairākas apdrukas vienai precei.
- Pārbaudīt, ka e-pastā tiešām ir viena poga un nav preču tabulas.
- Pārbaudīt saites drošību, nederīgu cenu bloķēšanu un slēgta saraksta aizsardzību.

## Audita pamatojums

Pašlaik pieprasījums, kopīgais saraksts un piedāvājums glabā atsevišķas preču kopijas. Modeļa maiņa darbojas tikai atsevišķajā piedāvājumā, bet klienta redzamais saraksts par to neko nezina. Arī statusi un atbildīgais cilvēks tiek glabāti vairākās vietās. Tas rada dubultas pogas, novecojušus datus un liekas darbības.

Konkurentu un B2B rīku labākais kopīgais princips ir viena pastāvīga saite uz vienu dzīvu sarakstu: e-pasts tikai atver sarakstu, bet labošana, aizvietošana, cenu sadalījums un statuss dzīvo pašā sarakstā. Ervitex nav vajadzīgi konti, sarežģīti apstiprināšanas soļi vai sarakstes modulis.
