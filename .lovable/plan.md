# Novērst kataloga “0 ierakstu” kļūdu

## Izmaiņas
- Kataloga sākotnējam datu pieprasījumam pievienot automātisku atkārtošanu īslaicīgas tīkla/backend kļūdas gadījumā.
- Neatzīmēt neveiksmīgu tukšu atbildi kā veiksmīgi ielādētu katalogu un nesaglabāt to atmiņas kešā.
- Ja atkārtotie mēģinājumi neizdodas, rādīt skaidru ielādes kļūdu ar pogu “Mēģināt vēlreiz”, nevis maldinošu “0 rezultāti”.
- Pārbaudīt `/catalog` reālā pārlūkā pret publicētajiem kataloga datiem.

## Tehniski
- Izmaiņas tikai `UnifiedCatalog` datu ielādes un kļūdas stāvokļos; filtru un produktu datu loģika netiek mainīta.
