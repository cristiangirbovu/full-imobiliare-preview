// FULL IMOBILIARE — date demo (v0)
// Structura oglindește exact schema Supabase (schema.sql). La integrare, acest fișier
// se înlocuiește cu apeluri către Supabase; interfața (app.js) rămâne neschimbată.
const ANUNTURI = [
  {
    id_intern: "FI-1001", adresa_harta: "Strada Avionului, București", titlu: "Apartament cu 3 camere, bloc nou, vedere panoramică",
    descriere: "Apartament luminos la etajul 4 dintr-un ansamblu finalizat în 2022, cu living generos, bucătărie open-space și două băi. Orientare sud-vest, loc de parcare subteran inclus.",
    tranzactie: "vanzare", tip: "apartament", pret_eur: 132000, negociabil: true,
    oras: "București", zona: "Aviației", suprafata_mp: 78, camere: 3, bai: 2,
    etaj: "4", regim_inaltime: "S+P+8", an_constructie: 2022, compartimentare: "decomandat",
    certificat_energetic: "A", dotari: ["parcare_subterana", "balcon", "centrala_proprie", "aer_conditionat", "termopan", "parchet_laminat", "lift", "videointerfon", "vedere_panoramica", "parcare_subterana"], dotari_altele: "",
    status: "activ", etichete: ["exclusivitate"], agent_nume: "Viorel D.", agent_telefon: "[DE COMPLETAT]", agent_email: "",
    poze: ["img/demo/living-modern.png", "img/demo/fatada-eleganta.png", "img/demo/lobby.png"],
    publicat_la: "2026-07-08"
  },
  {
    id_intern: "FI-1002", adresa_harta: "Strada Mihail Glinka, București", titlu: "Apartament cu 2 camere, renovat complet, Floreasca",
    descriere: "Apartament în bloc consolidat, renovat integral în 2025: instalații noi, bucătărie mobilată și utilată, parchet masiv. La 5 minute de parcul Verdi.",
    tranzactie: "vanzare", tip: "apartament", pret_eur: 115000, negociabil: false,
    oras: "București", zona: "Floreasca", suprafata_mp: 64, camere: 2, bai: 1,
    etaj: "2", regim_inaltime: "P+4", an_constructie: 1978, compartimentare: "semidecomandat",
    certificat_energetic: "B", dotari: ["renovat", "mobilat", "utilat", "boxa", "centrala_proprie", "termopan", "parchet_natur", "gresie_faianta", "interfon", "masina_spalat", "frigider", "aragaz_plita"], dotari_altele: "Parchet masiv, bloc consolidat",
    status: "activ", agent_nume: "Viorel D.", agent_telefon: "[DE COMPLETAT]", agent_email: "",
    poze: ["img/demo/interior-clasic.png", "img/demo/living-modern.png"],
    publicat_la: "2026-07-05"
  },
  {
    id_intern: "FI-1003", adresa_harta: "Bulevardul Barbu Văcărescu 154, București", titlu: "Penthouse cu 4 camere și terasă de 40 mp",
    descriere: "Penthouse pe două niveluri cu terasă perimetrală și vedere deschisă asupra orașului. Finisaje premium, două locuri de parcare, boxă.",
    tranzactie: "vanzare", tip: "penthouse", pret_eur: 295000, negociabil: true,
    oras: "București", zona: "Barbu Văcărescu", suprafata_mp: 156, camere: 4, bai: 3,
    etaj: "11", regim_inaltime: "S+P+12", an_constructie: 2020, compartimentare: "decomandat",
    certificat_energetic: "A", dotari: ["terasa", "parcare_subterana", "smart_home", "aer_conditionat", "lift", "finisaje_premium", "incalzire_pardoseala", "vedere_panoramica", "supraveghere_video"], dotari_altele: "Terasă perimetrală 40 mp, două locuri de parcare",
    status: "rezervat", etichete: ["nou", "exclusivitate"], agent_nume: "Georgeta V.", agent_telefon: "[DE COMPLETAT]", agent_email: "",
    poze: ["img/demo/penthouse.png", "img/demo/lobby.png"],
    publicat_la: "2026-06-28"
  },
  {
    id_intern: "FI-1004", adresa_harta: "Bulevardul Pipera, Voluntari", titlu: "Apartament cu 2 camere de închiriat, ansamblu cu canal",
    descriere: "Apartament mobilat și utilat modern, disponibil imediat, în ansamblu rezidențial liniștit cu spații verzi. Contract minim 12 luni.",
    tranzactie: "inchiriere", tip: "apartament", pret_eur: 650, negociabil: false,
    oras: "București", zona: "Pipera", suprafata_mp: 58, camere: 2, bai: 1,
    etaj: "3", regim_inaltime: "P+6", an_constructie: 2019, compartimentare: "decomandat",
    certificat_energetic: "A", dotari: ["mobilat", "utilat", "parcare_curte", "paza", "smart_tv", "masina_spalat", "canapea_extensibila", "pat_mijloc", "sifonier", "aer_conditionat", "centrala_proprie", "balcon", "lift", "supraveghere_video"], dotari_altele: "Disponibil imediat",
    status: "activ", liber_din: "2026-11-01", etichete: ["oferta"], agent_nume: "Georgeta V.", agent_telefon: "[DE COMPLETAT]", agent_email: "",
    poze: ["img/demo/ansamblu-canal.png", "img/demo/living-modern.png"],
    publicat_la: "2026-07-10"
  },
  {
    id_intern: "FI-1005", adresa_harta: "Strada Independenței, Corbeanca, Ilfov", titlu: "Casă cu 4 camere și teren 500 mp, Corbeanca",
    descriere: "Casă individuală P+1 cu living dublu, bucătărie închisă și grădină amenajată. Garaj și foișor. Toate utilitățile, acces asfaltat.",
    tranzactie: "vanzare", tip: "casa", pret_eur: 289000, negociabil: true,
    oras: "Ilfov", zona: "Corbeanca", suprafata_mp: 210, camere: 4, bai: 3,
    etaj: "", regim_inaltime: "P+1+M", an_constructie: 2017, compartimentare: "decomandat",
    certificat_energetic: "B", dotari: ["garaj", "gradina", "foisor", "curte", "centrala_proprie", "termopan", "parchet_stratificat", "alarma", "curent", "apa", "canalizare", "gaz", "put", "semineu", "sezlonguri"], dotari_altele: "Teren 500 mp, acces asfaltat",
    status: "activ", etichete: ["pret_redus"], agent_nume: "Viorel D.", agent_telefon: "[DE COMPLETAT]", agent_email: "",
    poze: ["img/demo/fatada-eleganta.png", "img/demo/interior-clasic.png"],
    publicat_la: "2026-07-01"
  },
  {
    id_intern: "FI-1006", adresa_harta: "Bulevardul Nicolae Grigorescu, București", titlu: "Apartament cu 3 camere, vândut în 18 zile",
    descriere: "Exemplu de anunț finalizat: rămâne afișat 30 de zile de la vânzare, ca dovadă de activitate (regulă agreată la kickoff).",
    tranzactie: "vanzare", tip: "apartament", pret_eur: 148000, negociabil: false,
    oras: "București", zona: "Titan", suprafata_mp: 82, camere: 3, bai: 2,
    etaj: "6", regim_inaltime: "P+10", an_constructie: 2015, compartimentare: "decomandat",
    certificat_energetic: "B", dotari: ["parcare_strada", "balcon", "aer_conditionat", "termoficare", "termopan"], dotari_altele: "Balcon închis",
    status: "vandut", agent_nume: "Georgeta V.", agent_telefon: "[DE COMPLETAT]", agent_email: "",
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

// Serviciile agenției (aceeași formă ca tabela `servicii` din schema.sql).
// `evidentiat: true` = cardul mare navy, afișat primul, pe toată lățimea.
// Textul de pe banda albastră (pagina Servicii + prima pagină). Cerința clientei (25.09.2026):
// nu se mai evidențiază consultanța juridică; aici stă mesajul general al agenției.
const INTRO_SERVICII = "La Full Imobiliare, credem că o tranzacție imobiliară nu se încheie atunci când găsești proprietatea potrivită sau clientul potrivit. De aceea, îți oferim consultanță juridică gratuită și acces la o serie de servicii de specialitate prin intermediul partenerilor noștri. Îți asigurăm o tranzacție mai sigură, mai rapidă, mai avantajoasă și mai eficientă.";

// Textele serviciilor 1-3 sunt cele primite de la clientă (25.09.2026), adaptate la adresarea cu „tu".
// Restul rămân provizorii, scrise de AMPLIO, până sosesc textele ei.
// Format `continut`: paragrafe separate prin linie goală; „## " = subtitlu; „- " = element de listă;
// „[buton:cautator] Text" sau „[buton:proprietar] Text" = buton către formularul corespunzător din Contact.
const SERVICII = [
  { id: 1, ordine: 1, evidentiat: false, slug: "consultanta-juridica-gratuita", titlu: "Consultanță juridică gratuită",
    descriere: "Verificarea actelor de proprietate, asistență la antecontract și contract, intermediere sigură între vânzător și cumpărător, fără costuri suplimentare pentru clienții agenției.",
    continut: "Orice tranzacție imobiliară începe cu actele. Înainte de vizionare, de negociere și de orice avans, verificăm istoricul proprietății, sarcinile din cartea funciară și situația coproprietarilor, ca să știi exact ce cumperi sau ce vinzi.\n\n## Ce include\n- verificarea actelor de proprietate și a extrasului de carte funciară\n- asistență la redactarea și semnarea antecontractului\n- pregătirea dosarului pentru notar\n- prezență la semnarea contractului și lămuriri pe fiecare clauză\n\n## De ce este gratuită\nPentru clienții agenției, consultanța juridică face parte din serviciu, nu este un extra. Așa lucrăm din 1993, pentru că o tranzacție sigură este singura tranzacție pe care merită să o intermediem." },
  { id: 2, ordine: 2, evidentiat: false, slug: "vanzari-cumparari-imobile", titlu: "Vânzări-Cumpărări imobile",
    descriere: "Prin experiența dobândită, transformăm procesul de vânzare-cumpărare într-o experiență clară, bine organizată și în deplină siguranță.",
    continut: "## Cumperi o proprietate?\nGăsim proprietatea potrivită. Te ghidăm pe tot parcursul procesului.\n\nÎnțelegem ce cauți, identificăm proprietățile potrivite și te însoțim de la vizionare până la finalizarea tranzacției.\n\nServiciile noastre includ:\n\n- identificarea și selecția proprietăților potrivite\n- programarea și organizarea vizionărilor\n- informații și consultanță privind proprietatea și tranzacția\n- prezentarea documentației disponibile\n- sprijin în formularea și negocierea ofertei\n- coordonarea etapelor tranzacției\n- sprijin pentru semnarea actelor notariale\n- asistență până la intrarea în posesie\n\nCumperi cu mai multă claritate. Decizi cu mai multă încredere.\n\n[buton:cautator] Trimite-ne cererea ta\n\n## Vinzi o proprietate?\nEvaluăm proprietatea. O poziționăm. O promovăm. Gestionăm tranzacția.\n\nO proprietate corect evaluată, bine prezentată și corect poziționată are șanse mai mari să ajungă la cumpărătorul potrivit. Ne ocupăm de fiecare etapă a procesului de vânzare și te ținem informat pe parcurs.\n\nServiciile noastre includ:\n\n- evaluarea proprietății și a pieței\n- verificarea tehnică și juridică\n- pregătirea proprietății pentru promovare\n- promovarea pe canalele relevante\n- organizarea și desfășurarea vizionărilor\n- comunicarea și gestionarea interesului potențialilor cumpărători\n- prezentarea și negocierea ofertelor\n- coordonarea documentației și a etapelor tranzacției\n- asistență juridică gratuită\n- asistență până la finalizarea vânzării\n\nTu deții proprietatea. Noi ne ocupăm de proces.\n\n[buton:proprietar] Trimite-ne proprietatea ta\n\n## Costul serviciilor\nPentru vânzarea și cumpărarea unui imobil, costul serviciului este cuprins între 2% și 3% din valoarea prețului de vânzare-cumpărare a imobilului, atât pentru vânzător, cât și pentru cumpărător.\n\nCostul serviciului este stabilit și comunicat înainte de începerea colaborării, în funcție de serviciile contractate. Se va achita numai în cazul încheierii unei tranzacții.\n\nToate taxele necesare obținerii documentelor de proprietate, impozitele și alte onorarii către terți profesioniști vor fi suportate de către partea obligată să le suporte sau partea interesată.\n\nServicii clare. Condiții transparente. Fără costuri ascunse." },
  { id: 3, ordine: 3, evidentiat: false, slug: "inchirieri-imobile", titlu: "Închirieri imobile",
    descriere: "Fie că ești proprietar și cauți un chiriaș de încredere, fie că ești în căutarea unei locuințe sau a unui spațiu potrivit, îți oferim sprijin profesionist până la predare-primire imobil.",
    continut: "## Servicii pentru chiriași\nSelecție. Vizionare. Negociere. Contract.\n\n- Identificăm proprietăți potrivite nevoilor și bugetului tău.\n- Selectăm și îți prezentăm doar ofertele relevante.\n- Programăm și coordonăm vizionările, simplu și eficient.\n- Te asistăm în negocierea chiriei și a condițiilor de închiriere.\n- Beneficiezi de consultanță juridică gratuită și sprijin pentru contract.\n- Coordonăm pașii finali și te asistăm până la semnarea contractului.\n\n[buton:cautator] Trimite-ne cererea ta\n\n## Servicii pentru proprietari\nPromovare. Vizionare. Negociere. Contract.\n\n- Promovăm proprietatea către potențialii chiriași potriviți.\n- Identificăm și selectăm chiriași în funcție de cerințele tale.\n- Organizăm și coordonăm vizionările, astfel încât tu să economisești timp.\n- Gestionăm discuțiile privind chiria și condițiile închirierii.\n- Beneficiezi de consultanță juridică gratuită și sprijin pentru contract.\n\n[buton:proprietar] Trimite-ne proprietatea ta\n\n## Costul serviciilor\nCostul serviciului este de 50% din valoarea unei chirii lunare, atât pentru proprietar, cât și pentru chiriaș.\n\nCostul se achită o singură dată, la încheierea contractului de închiriere.\n\nServicii clare. Condiții transparente. Fără costuri ascunse." },
  { id: 4, ordine: 4, evidentiat: false, slug: "evaluare-imobiliara", titlu: "Evaluare imobiliară",
    descriere: "Prețul corect din prima: analiză comparativă de piață pentru vânzare, cumpărare sau garanții bancare.",
    continut: "Un preț stabilit corect scurtează timpul de vânzare și evită negocierile inutile. Evaluăm proprietatea pe baza tranzacțiilor reale din zonă, nu a prețurilor cerute în anunțuri.\n\n## Când ai nevoie\nÎnainte de a lista o proprietate la vânzare, când vrei să cumperi și nu știi dacă prețul cerut este realist, la partaj sau moștenire, sau când banca îți cere o evaluare pentru credit.\n\n## Ce primești\nUn raport clar, cu proprietățile comparabile folosite, intervalul de preț recomandat și argumentele din spatele lui." },
  { id: 5, ordine: 5, evidentiat: false, slug: "consultanta-credit", titlu: "Consultanță credit",
    descriere: "Te ghidăm către finanțarea potrivită și pregătim dosarul împreună cu partenerii bancari.",
    continut: "Cumpărarea cu credit are pași și termene care pot bloca o tranzacție dacă nu sunt pregătiți din timp. Te ajutăm să afli de la început cât poți împrumuta și cu ce costuri, ca să cauți proprietăți în bugetul real.\n\n## Cum te ajutăm\nComparăm ofertele partenerilor bancari, îți explicăm diferențele dintre dobânzi fixe și variabile, pregătim lista de documente și ținem legătura cu banca până la aprobare, sincronizat cu antecontractul și cu data semnării la notar." },
  { id: 6, ordine: 6, evidentiat: false, slug: "administrare-proprietati", titlu: "Administrare proprietăți",
    descriere: "Ne ocupăm de chiriași, plăți și mentenanță, ca investiția ta să lucreze singură.",
    continut: "Dacă deții una sau mai multe locuințe închiriate, administrarea lor înseamnă timp: chiriași, încasări, întreținere, intervenții. Preluăm noi partea aceasta, iar tu primești raportul și venitul.\n\n## Ce include\n- relația cu chiriașii\n- urmărirea plăților și a cheltuielilor de întreținere\n- intervenții la defecțiuni, cu meseriași verificați\n- predări și preluări la schimbarea chiriașului\n- raport lunar către proprietar" },
  { id: 7, ordine: 7, evidentiat: false, slug: "asigurari", titlu: "Asigurări",
    descriere: "Asigurarea obligatorie și facultativă a locuinței, gestionate rapid, în același loc cu tranzacția.",
    continut: "Asigurarea locuinței este obligatorie prin lege și, de cele mai multe ori, cerută de bancă la credit. O rezolvăm în același loc cu tranzacția, ca să nu mai faci un drum în plus.\n\n## Ce include\nAsigurarea obligatorie (PAD) și asigurarea facultativă a locuinței și a bunurilor, cu explicarea diferențelor și a excluderilor, plus reînnoirea la termen." },
  { id: 8, ordine: 8, evidentiat: false, slug: "cadastru-si-intabulare", titlu: "Cadastru și intabulare",
    descriere: "Documentația cadastrală și înscrierea în cartea funciară, fără drumuri și fără termene pierdute.",
    continut: "Fără cadastru și intabulare, o proprietate nu poate fi vândută sau ipotecată. Ne ocupăm de toată documentația, de la măsurători până la înscrierea în cartea funciară.\n\n## Cum decurge\nVerificăm situația actuală în cartea funciară, comandăm măsurătorile cu un topograf autorizat, întocmim și depunem documentația la OCPI și urmărim dosarul până la eliberarea extrasului actualizat." },
  { id: 9, ordine: 9, evidentiat: false, slug: "certificate-energetice", titlu: "Certificate energetice",
    descriere: "Obligatorii la vânzare și închiriere: le obținem noi, direct pentru anunțul tău.",
    continut: "Certificatul de performanță energetică este obligatoriu la vânzare și la închiriere, iar clasa energetică trebuie să apară în anunț. Îl obținem prin auditori energetici autorizați, de obicei în câteva zile.\n\n## Ce trebuie să știi\nCertificatul este valabil 10 ani, se întocmește pe baza unei vizite la proprietate și a actelor imobilului, iar clasa obținută (de la A la G) apare automat pe pagina proprietății tale de pe site." },
  { id: 10, ordine: 10, evidentiat: false, slug: "consultanta-specifica", titlu: "Consultanță specifică",
    descriere: "Situații particulare (moșteniri, ieșiri din indiviziune, documentații atipice) analizate împreună cu juristul agenției.",
    continut: "Nu toate proprietățile au o situație simplă. Moșteniri nedezbătute, coproprietari care nu se înțeleg, construcții fără autorizație, acte lipsă: fiecare caz are o rezolvare, dar are nevoie de un plan.\n\n## Cum te ajutăm\nAnalizăm situația împreună cu juristul agenției, îți spunem deschis ce se poate rezolva și în cât timp, și te însoțim la notar, la primărie sau la OCPI până când proprietatea poate fi tranzacționată." }
];

// Solicitări venite din formularele publice (Contact): rol „proprietar" (vrea să listeze) sau „cautator" (caută).
// Nimic de aici nu apare public: o solicitare de proprietar devine proprietate DOAR după aprobarea din admin.
const SOLICITARI = [
  {
    id: "SL-1001", rol: "proprietar", status: "noua", creat_la: "2026-09-10T09:14:00",
    contact: { nume: "Andrei Popescu", telefon: "07XX XXX XXX", email: "andrei.popescu@example.com" },
    proprietate: {
      tranzactie: "vanzare", tip: "apartament", oras: "București", zona: "Drumul Taberei", adresa: "Strada Brașov",
      pret_eur: 98000, negociabil: true, suprafata_mp: 54, camere: 2, bai: 1, etaj: "3", regim_inaltime: "P+4",
      an_constructie: 1982, compartimentare: "semidecomandat", certificat_energetic: "C",
      dotari: ["centrala_proprie", "termopan", "parchet_laminat", "balcon", "interfon", "aer_conditionat"], dotari_altele: "Bloc reabilitat termic în 2019",
      descriere: "Apartament cu 2 camere la etajul 3 din 4, orientare sud, lângă parcul Drumul Taberei. Îl vând pentru că ne mutăm la casă. Liber la vânzare.",
      poze: ["img/demo/interior-clasic.png"]
    }
  },
  {
    id: "SL-1002", rol: "cautator", status: "noua", creat_la: "2026-09-11T08:40:00",
    contact: { nume: "Ioana Marin", telefon: "07XX XXX XXX", email: "ioana.marin@example.com" },
    cautare: { tranzactie: "vanzare", tip: "apartament", zone: "Aviației, Floreasca, Herăstrău", camere_min: 3, buget_max_eur: 180000,
      mesaj: "Căutăm un apartament cu 3 camere, bloc după 2010, cu loc de parcare. Suntem flexibili la etaj, dar nu la parter." }
  }
];
