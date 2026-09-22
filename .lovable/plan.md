# Pasūtījumu plūsma: no pieprasījuma līdz gatavam darbam

Mērķis: mājaslapa paliek preču katalogs. Visa saruna notiek parastā e-pastā. Mājaslapa dod tikai divas lietas — kārtīgu sarakstu, kas kuram pieder, un ātru veidu, kā uztaisīt preču saiti klientam.

## Kas mainās

### 1. Katram pieprasījumam savs numurs
Katrs jauns pieprasījums saņem īsu numuru, piemēram **ERV-2609-014**.
- Numurs ir e-pasta tēmas sākumā: `[ERV-2609-014] Cenu pieprasījums — Uzņēmums SIA`.
- Kad klients atbild, numurs paliek tēmā, tāpēc visa saruna turas vienā virknē un nesaplūst ar citiem pasūtījumiem.
- Pēc numura var atrast pieprasījumu mājaslapas sarakstā vienā meklēšanas laukā.

### 2. Laura izdala darbu ar vienu klikšķi e-pastā
Biroja e-pasta apakšā būs četras pogas: **Ilonai**, **Santai**, **Justīnei**, **Sev**.
- Laura nospiež pogu savā e-pastā — nekur nav jāpieslēdzas.
- Izvēlētā projektu vadītāja uzreiz saņem pilnu pieprasījumu savā pastā, ar klienta adresi atbildes laukā (Reply-To), lai var vienkārši spiest "Atbildēt".
- Klients automātiski saņem īsu vēstuli: "Jūsu pieprasījumu vada Ilona, ilona@ervitex.lv".
- Sarakstā uzreiz redzams, kam pieprasījums pieder.

### 3. Cita preces piedāvāšana — bez kopēšanas rokām
Ja izvēlētā prece nav laba apdrukai:
- Katalogā pie preces ir poga **Pievienot piedāvājumam**, un pēc tam viena poga **Kopēt saiti**.
- Sanāk viena saite ar visām ieteiktajām precēm, krāsām, izmēriem un cenām (tas jau strādā — piedāvājumu rīks).
- Projektu vadītāja ieliek šo saiti savā e-pastā klientam un raksta ar saviem vārdiem. Nekādas veidlapas.
- Piedāvājumu var uzreiz sasiet ar pieprasījuma numuru, lai vēlāk saprot, no kā tas radās.

### 4. Statuss mainās pats, kur var
- Nosūtīts piedāvājums → statuss automātiski "Piedāvājums nosūtīts".
- Klients atvēra piedāvājuma saiti → sarakstā parādās "Klients skatījās".
- Rokām paliek tikai viena darbība: **Slēgt**, kad darbs pabeigts. To var izdarīt arī ar pogu e-pastā.

### 5. Saraksts, kurā nav čupas
Sadaļa "Pieprasījumi" pārkārtota:
- Cilnes: **Neizdalītie** (gaida Lauru) · **Mani** · **Visi atvērtie** · **Slēgtie**.
- Katrs ieraksts rāda numuru, klientu, atbildīgo, vecumu dienās un saistīto piedāvājumu.
- Sarkans brīdinājums, ja pieprasījums stāv neizdalīts ilgāk par 4 stundām vai bez atbildes ilgāk par 2 dienām.
- Rīta kopsavilkuma vēstule birojam: cik neizdalīti, cik kavējas.

## Ko nedarām
- Nekādu sarakstes lasīšanu vai rakstīšanu mājaslapā.
- Nekādu obligātu soļu, kas jāizpilda, lai virzītos tālāk.
- Neaiztiekam klienta pieprasījuma formu — tā strādā labi.

## Tehniskās detaļas
- `quote_requests`: pievieno `ref` (īsais numurs, ģenerēts ar secību), `assigned_pm_slug`, `assigned_at`, `offer_id`, `last_customer_reply_at`; RLS paliek kā ir, GRANT kā esošajām kolonnām.
- `pm_offers`: pievieno `quote_request_id`, `viewed_at`; `get_pm_offer` atzīmē skatīšanos.
- Jauna edge funkcija `quote-assign` (`verify_jwt = false`, paraksta žetons saitē) apkalpo e-pasta pogas: piešķiršanu PM, statusa maiņu uz slēgts. Žetons ir HMAC no `request_id + darbība`, derīgs 30 dienas.
- `send-quote-request`: tēmā ievieto `ref`, e-pasta veidnē pievieno piešķiršanas pogas (`quote-request.tsx`), saglabā `replyTo` kā šobrīd.
- Jauna veidne `quote-assigned.tsx` (PM) un `quote-assigned-customer.tsx` (klientam).
- `AdminQuotes.tsx`: cilnes pēc piešķiršanas, meklēšana pēc `ref`, saite uz saistīto piedāvājumu, PM izvēle arī no paneļa.
- `AdminOfferEdit.tsx`: lauks "No pieprasījuma" + poga "Kopēt saiti"; saglabājot ar statusu `sent` atjauno saistītā pieprasījuma statusu uz `quoted`.
- Rīta kopsavilkums: `pg_cron` 08:30 → `invoke_sync_function`-stila izsaukums jaunai funkcijai `quote-digest`.
