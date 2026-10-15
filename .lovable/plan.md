# Ervitex palaišana uz www.ervitex.lv — plāns pa soļiem

Ejam secīgi; katrs solis beidzas ar pārbaudi, un tikai tad sākam nākamo.

## 1. solis — Kolēģu piekļuves (uzreiz)
- Laurai, Samantai, Ilonai un Justīnei izveidot vai pārbaudīt kontus admin panelim.
- Katram — pagaidu parole, kas pirmajā ielogošanās reizē jānomaina, un poga „Aizmirsu paroli”.
- Paroles nodod tikai Raimonds personīgi; čatā tās nerakstām.

## 2. solis — Vecās lapas audits un saišu karte
- Nolasīt visas www.ervitex.lv lapas (vecais sitemap, iekšējās saites, preču un kategoriju adreses).
- Sagatavot tabulu „vecā adrese → jaunā adrese” (kategorijas, preces, kontakti, par mums, apdrukas tehnoloģijas).
- Pārnest vecās lapas labākos virsrakstus, aprakstus un atslēgvārdus uz jaunajām lapām.
- Rezultāts: saraksts Raimondam apstiprināšanai.

## 3. solis — Pārbūve, lai meklētāji uzreiz redz saturu
- Pārcelt lapu uz Lovable jaunāko pamatu ar servera atveidi: katra prece, kategorija un tehnoloģija Google, ChatGPT, Gemini un sociālajiem tīkliem atveras ar gatavu tekstu, cenu un foto.
- Izskats un funkcijas nemainās; pēc pārbūves pārbaudām katalogu, pieprasījumus, piedāvājumus, admin paneli.

## 4. solis — Pilns SEO
- Katrai lapai: savs virsraksts, apraksts, kanoniskā adrese, LV/EN versiju norādes.
- Strukturētie dati: uzņēmums (kopš 1998), kontakti, preces ar cenu un pieejamību, navigācijas ceļš.
- Dinamiskais sitemap: tikai sākumlapa, katalogs, kategorijas, preces, tehnoloģijas, par mums, kontakti.
- Neindeksē: grozs/pieprasījums, ielogošanās, admin, piedāvājumu un sarakstu saites, paslēptie atlikumi, meklēšanas un filtru kombinācijas.
- Fails mākslīgā intelekta meklētājiem (llms.txt) ar īsu uzņēmuma un sortimenta aprakstu.
- Vecās adreses (no 2. soļa) automātiski pārvirza uz jaunajām.

## 5. solis — Vecā lapa kā rezerve
- Vecajā serverī izveidot vecais.ervitex.lv un pārcelt tur veco lapu, neko nedzēšot.
- Tur — aizliegums meklētājiem, lai Google to neredz un nerodas dublikāti.
- Ja jaunā lapa kādreiz nestrādā — domēnu var atgriezt uz veco serveri.

## 6. solis — Domēna pārslēgšana (Raimonda apstiprinājums)
- Pieslēgt www.ervitex.lv un ervitex.lv šai lapai, galvenā — www.
- E-pasta ieraksti (pasts, notify.ervitex.lv) paliek neskarti.
- Noņemt „neindeksēt” aizliegumu tikai pēc Raimonda „jā”.
- Publicēt.

## 7. solis — Google un citi meklētāji
- Pieslēgt Google Search Console, apstiprināt domēnu, iesniegt sitemap, pieprasīt galveno lapu pārbaudi.
- Bing Webmaster (no tā datus ņem arī ChatGPT un Copilot).
- Google uzņēmuma profils (kartes) — pārbaudīt adresi, saiti, foto.
- Pārbaudīt, ka vecās adreses pāriet uz jaunajām, un sekot kļūdām pirmās 2–4 nedēļas.

## 8. solis — Pozīciju celšana (pastāvīgi)
- Atslēgvārdu izpēte Latvijā: „apdruka uz krekliem”, „reklāmas apģērbs”, „vairumtirdzniecība T-krekli” u.c.
- Kategoriju lapām īsi, cilvēcīgi ievadteksti; tehnoloģiju lapām biežāk uzdotie jautājumi.
- Ātruma pārbaude telefonā, attēlu nosaukumi un apraksti.
- Ikmēneša atskaite: kur esam, kas jāuzlabo.

Godīgi: 1. vietu visos vaicājumos neviens nevar garantēt, bet šie soļi dod labāko iespēju, īpaši vaicājumos par zīmoliem un konkrētām precēm.

## Tehniskās piezīmes
- Servera atveide: migrācija uz TanStack Start; maršruti, RouteSeo → per-route head; sitemap ģenerē no catalog_items (bez catalog_remnants, apaviem, paslēptajiem).
- Pārvirzes: vecās adreses kā maršruti ar servera 301, ja pamats to atļauj, citādi klienta pārvirze + canonical.
- index.html noindex un robots.txt `Disallow: /` maina tikai 6. solī.
- Kolēģu konti: Lovable Cloud auth + user_roles admin loma.
- Sw.js/service-worker.js kill-switch faili paliek.
