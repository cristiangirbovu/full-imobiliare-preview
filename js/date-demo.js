// FULL IMOBILIARE — date demo (v0)
// Structura oglindește exact schema Supabase (schema.sql). La integrare, acest fișier
// se înlocuiește cu apeluri către Supabase; interfața (app.js) rămâne neschimbată.
const ANUNTURI = [
  {
    id_intern: "FI-1001", adresa_harta: "Strada Avionului, București", titlu: "Apartament cu 3 camere, bloc nou, vedere panoramică",
    descriere: "Apartament luminos la etajul 4 dintr-un ansamblu finalizat în 2022, cu living generos, bucătărie open-space și două băi. Orientare sud-vest, loc de parcare subteran inclus.",
    tranzactie: "vanzare", tip: "apartament", pret_eur: 132000, negociabil: true,
    oras: "București", zona: "Aviației", suprafata_mp: 78, camere: 3, bai: 2,
    etaj: 4, etaje_total: 8, an_constructie: 2022, compartimentare: "decomandat",
    certificat_energetic: "A", dotari: ["Parcare subterană", "Balcon", "Centrală proprie", "AC"],
    status: "activ", agent_nume: "Viorel D.", agent_telefon: "[DE COMPLETAT]",
    poze: ["img/demo/living-modern.png", "img/demo/fatada-eleganta.png", "img/demo/lobby.png"],
    publicat_la: "2026-07-08"
  },
  {
    id_intern: "FI-1002", adresa_harta: "Strada Mihail Glinka, București", titlu: "Apartament cu 2 camere, renovat complet, Floreasca",
    descriere: "Apartament în bloc consolidat, renovat integral în 2025: instalații noi, bucătărie mobilată și utilată, parchet masiv. La 5 minute de parcul Verdi.",
    tranzactie: "vanzare", tip: "apartament", pret_eur: 115000, negociabil: false,
    oras: "București", zona: "Floreasca", suprafata_mp: 64, camere: 2, bai: 1,
    etaj: 2, etaje_total: 4, an_constructie: 1978, compartimentare: "semidecomandat",
    certificat_energetic: "B", dotari: ["Renovat 2025", "Mobilat", "Utilat", "Boxă"],
    status: "activ", agent_nume: "Viorel D.", agent_telefon: "[DE COMPLETAT]",
    poze: ["img/demo/interior-clasic.png", "img/demo/living-modern.png"],
    publicat_la: "2026-07-05"
  },
  {
    id_intern: "FI-1003", adresa_harta: "Bulevardul Barbu Văcărescu 154, București", titlu: "Penthouse cu 4 camere și terasă de 40 mp",
    descriere: "Penthouse pe două niveluri cu terasă perimetrală și vedere deschisă asupra orașului. Finisaje premium, două locuri de parcare, boxă.",
    tranzactie: "vanzare", tip: "apartament", pret_eur: 295000, negociabil: true,
    oras: "București", zona: "Barbu Văcărescu", suprafata_mp: 156, camere: 4, bai: 3,
    etaj: 11, etaje_total: 12, an_constructie: 2020, compartimentare: "decomandat",
    certificat_energetic: "A", dotari: ["Terasă 40 mp", "2 parcări", "Smart home", "AC"],
    status: "rezervat", agent_nume: "Georgeta V.", agent_telefon: "[DE COMPLETAT]",
    poze: ["img/demo/penthouse.png", "img/demo/lobby.png"],
    publicat_la: "2026-06-28"
  },
  {
    id_intern: "FI-1004", adresa_harta: "Bulevardul Pipera, Voluntari", titlu: "Apartament cu 2 camere de închiriat, ansamblu cu canal",
    descriere: "Apartament mobilat și utilat modern, disponibil imediat, în ansamblu rezidențial liniștit cu spații verzi. Contract minim 12 luni.",
    tranzactie: "inchiriere", tip: "apartament", pret_eur: 650, negociabil: false,
    oras: "București", zona: "Pipera", suprafata_mp: 58, camere: 2, bai: 1,
    etaj: 3, etaje_total: 6, an_constructie: 2019, compartimentare: "decomandat",
    certificat_energetic: "A", dotari: ["Mobilat modern", "Parcare", "Pază", "Disponibil imediat"],
    status: "activ", agent_nume: "Georgeta V.", agent_telefon: "[DE COMPLETAT]",
    poze: ["img/demo/ansamblu-canal.png", "img/demo/living-modern.png"],
    publicat_la: "2026-07-10"
  },
  {
    id_intern: "FI-1005", adresa_harta: "Strada Independenței, Corbeanca, Ilfov", titlu: "Casă cu 4 camere și teren 500 mp, Corbeanca",
    descriere: "Casă individuală P+1 cu living dublu, bucătărie închisă și grădină amenajată. Garaj și foișor. Toate utilitățile, acces asfaltat.",
    tranzactie: "vanzare", tip: "casa", pret_eur: 289000, negociabil: true,
    oras: "Ilfov", zona: "Corbeanca", suprafata_mp: 210, camere: 4, bai: 3,
    etaj: null, etaje_total: 2, an_constructie: 2017, compartimentare: "decomandat",
    certificat_energetic: "B", dotari: ["Teren 500 mp", "Garaj", "Grădină amenajată", "Foișor"],
    status: "activ", agent_nume: "Viorel D.", agent_telefon: "[DE COMPLETAT]",
    poze: ["img/demo/fatada-eleganta.png", "img/demo/interior-clasic.png"],
    publicat_la: "2026-07-01"
  },
  {
    id_intern: "FI-1006", adresa_harta: "Bulevardul Nicolae Grigorescu, București", titlu: "Apartament cu 3 camere, vândut în 18 zile",
    descriere: "Exemplu de anunț finalizat: rămâne afișat 30 de zile de la vânzare, ca dovadă de activitate (regulă agreată la kickoff).",
    tranzactie: "vanzare", tip: "apartament", pret_eur: 148000, negociabil: false,
    oras: "București", zona: "Titan", suprafata_mp: 82, camere: 3, bai: 2,
    etaj: 6, etaje_total: 10, an_constructie: 2015, compartimentare: "decomandat",
    certificat_energetic: "B", dotari: ["Parcare", "Balcon închis", "AC"],
    status: "vandut", agent_nume: "Georgeta V.", agent_telefon: "[DE COMPLETAT]",
    poze: ["img/demo/lobby.png", "img/demo/ansamblu-canal.png"],
    publicat_la: "2026-06-02"
  }
];

// Articole de blog (aceeași formă ca tabela `articole` din schema.sql).
const ARTICOLE = [
  {
    slug: "ghidul-cumparatorului-prima-achizitie",
    titlu: "Ghidul cumpărătorului la prima achiziție: pașii de la vizionare la chei",
    rezumat: "Cumperi prima locuință? Iată drumul complet, pas cu pas: vizionare, verificarea actelor, antecontract, credit, semnare și predarea cheilor.",
    continut: "Prima achiziție imobiliară vine cu entuziasm, dar și cu multe întrebări. Vestea bună: drumul de la vizionare la chei are pași clari, iar dacă îi cunoști dinainte, eviți surprizele și negociezi de pe o poziție mai bună.\n\n## 1. Vizionarea și verificarea proprietății\nNu te opri la prima impresie. Verifică orientarea, izolarea, instalațiile și vecinătățile la ore diferite ale zilei. Cere de la început extrasul de carte funciară: afli cine e proprietarul real și dacă există sarcini pe imobil.\n\n## 2. Verificarea juridică a actelor\nAici se blochează cele mai multe tranzacții. Actele de proprietate, certificatul energetic, documentația cadastrală și eventualele ipoteci trebuie verificate înainte de orice avans. Clienții Full Imobiliare au acest pas inclus gratuit, juristul agenției verifică fiecare dosar.\n\n## 3. Antecontractul și avansul\nAntecontractul fixează prețul, termenul și condițiile. Nu semna niciodată fără să fie clare situația avansului și condițiile de restituire. Avansul uzual e între 5 și 10% din preț.\n\n## 4. Creditul și evaluarea\nBanca evaluează imobilul independent de prețul negociat. Pregătește dosarul de venit din timp și lasă o marjă de siguranță între rata maximă aprobată și bugetul real al familiei.\n\n## 5. Semnarea și cheile\nLa notar se semnează contractul de vânzare, se achită prețul și se predau cheile pe bază de proces-verbal, cu indexele de utilități notate. Din acel moment, casa e a ta cu adevărat.",
    imagine_url: "img/demo/living-modern.png",
    status: "publicat",
    publicat_la: "2026-07-08",
    actualizat_la: "2026-07-08"
  },
  {
    slug: "certificatul-energetic-ghid",
    titlu: "Certificatul energetic: ce este, cât costă și de ce nu poți vinde fără el",
    rezumat: "Fără certificat energetic nu poți semna la notar și nici publica legal un anunț. Ce clase există, cât durează obținerea și cine îl face.",
    continut: "Certificatul energetic e documentul care arată cât de eficientă energetic e o locuință, cu clase de la A (cea mai bună) la G. Din punct de vedere legal, el e obligatoriu atât la vânzare, cât și la închiriere, iar clasa energetică trebuie menționată încă din anunț.\n\n## Ce presupune obținerea\nUn auditor energetic atestat vizitează imobilul, măsoară și analizează anvelopa clădirii, tâmplăria, sistemul de încălzire și emite certificatul, de regulă în 1-3 zile lucrătoare. Costul pentru un apartament e de ordinul a câteva sute de lei.\n\n## De ce contează clasa energetică\nDincolo de obligația legală, clasa energetică influențează tot mai mult decizia cumpărătorilor: o locuință clasa A sau B înseamnă facturi semnificativ mai mici și un argument real de negociere. La creditele verzi, băncile oferă dobânzi preferențiale pentru imobile eficiente.\n\n## Cum te ajutăm noi\nPentru proprietățile listate prin Full Imobiliare ne ocupăm direct de obținerea certificatului, ca anunțul să fie complet și legal din prima zi. E unul dintre serviciile incluse în pachetul complet al agenției.",
    imagine_url: "img/demo/interior-clasic.png",
    status: "publicat",
    publicat_la: "2026-07-11",
    actualizat_la: "2026-07-11"
  },
  {
    slug: "cat-costa-vanzarea-unui-apartament",
    titlu: "Cât costă de fapt vânzarea unui apartament în București în 2026",
    rezumat: "Schiță de articol: taxele notariale, certificatul energetic, cadastrul, comisionul și impozitul, cu exemple de calcul pe un apartament de 100.000 €.",
    continut: "Schiță în lucru: articolul va detalia toate costurile reale ale unei vânzări, cu exemple de calcul concrete.\n\n## Structura planificată\nTaxe notariale și tarif de carte funciară, certificat energetic, documentație cadastrală dacă lipsește, impozitul pe tranzacție și comisionul agenției, cu un exemplu cap-coadă pe un apartament de 100.000 €.",
    imagine_url: "img/demo/fatada-eleganta.png",
    status: "ciorna",
    publicat_la: null,
    actualizat_la: "2026-07-12"
  }
];
