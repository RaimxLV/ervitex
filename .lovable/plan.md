# Plūdenāka sākumlapas aina

## Izmaiņas
- Sākumlapai noņemt mākslīgo ritināšanas inerci, lai peles rullītis un skārienžesti reaģē dabiski un bez ieķeršanās.
- Dziļuma efektu vadīt tikai ar ritināšanu, saglabājot mierīgu un paredzamu kustību.
- Samazināt ainas grafisko slodzi, nezaudējot attēla kvalitāti: pielāgot izšķirtspēju ekrānam un apturēt pārrēķinus, kad aina nav redzama.
- Uzlabot dziļuma pāreju, lai tuvākie un tālākie objekti kustas vienmērīgi un bez attēla malu deformācijām.
- Saglabāt esošo sākumlapas saturu, pogas un vizuālo noformējumu.

## Pārbaude
- Pārbaudīt atvēršanu un nepārtrauktu ritināšanu datorā un telefonā.
- Salīdzināt kadru vienmērību pirms un pēc izmaiņām.
- Pārbaudīt, ka aina nelec, nekropļojas un pārējās sākumlapas sadaļas turpina darboties.

## Tehniskā pieeja
- Sākumlapā izmantot pārlūka dabisko ritināšanu; izlīdzināšanu atstāt tikai citām lapām, kur tā nerada konfliktu.
- WebGL ainu atjaunot vienā `requestAnimationFrame` ciklā tikai tad, kad mainās ritinājuma mērķis un aina ir redzama.
- Ierobežot renderēšanas pikseļu blīvumu un vienkāršot dziļuma kartes paraugu skaitu.
- Dziļuma nobīdei izmantot vienu vertikālu, maigi izlīdzinātu progresu ar drošu attēla malu rezervi.
