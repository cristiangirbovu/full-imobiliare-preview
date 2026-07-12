// FULL IMOBILIARE — date demo (v0)
// Structura oglindește exact schema Supabase (schema.sql). La integrare, acest fișier
// se înlocuiește cu apeluri către Supabase; interfața (app.js) rămâne neschimbată.
const ANUNTURI = [
  {
    id_intern: "FI-1001", titlu: "Apartament cu 3 camere, bloc nou, vedere panoramică",
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
    id_intern: "FI-1002", titlu: "Apartament cu 2 camere, renovat complet, Floreasca",
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
    id_intern: "FI-1003", titlu: "Penthouse cu 4 camere și terasă de 40 mp",
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
    id_intern: "FI-1004", titlu: "Apartament cu 2 camere de închiriat, ansamblu cu canal",
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
    id_intern: "FI-1005", titlu: "Casă cu 4 camere și teren 500 mp, Corbeanca",
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
    id_intern: "FI-1006", titlu: "Apartament cu 3 camere, vândut în 18 zile",
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
