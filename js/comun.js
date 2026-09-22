// FULL IMOBILIARE — comun.js: vocabularul proprietății + componente partajate site ↔ admin.
// Tipuri de imobil, compartimentare, lista de dotări (cu bife, grupată după modelul imobiliare.ro),
// componenta de bife, managerul de fotografii (redimensionare în browser) și mici utilitare.
// Un singur loc de adevăr: admin.html, contact.html și proprietate.html citesc de aici.

// Lista aprobată de clientă (document „Câmpuri proprietate și lista de dotări", completat 22.09.2026).
const TIPURI_IMOBIL = [
  { cheie: "apartament",       eticheta: "Apartament",        titlu: "Apartament" },
  { cheie: "penthouse",        eticheta: "Penthouse",         titlu: "Penthouse" },
  { cheie: "casa",             eticheta: "Casă / vilă",       titlu: "Casă" },
  { cheie: "teren_intravilan", eticheta: "Teren intravilan",  titlu: "Teren intravilan" },
  { cheie: "teren_extravilan", eticheta: "Teren extravilan",  titlu: "Teren extravilan" },
  { cheie: "teren_agricol",    eticheta: "Teren agricol",     titlu: "Teren agricol" },
  { cheie: "comercial",        eticheta: "Spațiu comercial",  titlu: "Spațiu comercial" },
  { cheie: "birou",            eticheta: "Spațiu de birouri", titlu: "Spațiu de birouri" },
  { cheie: "hala",             eticheta: "Hale/Depozite",     titlu: "Hală/Depozit" }
];
// Cheile vechi din date (înainte de lista aprobată) se traduc la citire.
const TIPURI_VECHI = { teren: "teren_intravilan" };

const COMPARTIMENTARI = [
  { cheie: "decomandat",     eticheta: "Decomandat" },
  { cheie: "semidecomandat", eticheta: "Semidecomandat" },
  { cheie: "comandat",       eticheta: "Comandat" },
  { cheie: "circular",       eticheta: "Circular" }
];

const CERTIFICATE_ENERGETICE = ["A", "B", "C", "D", "E", "F", "G"];

// Etajul: S / D / P / 1..30 / M (cerința clientei); clădirea are „regim de înălțime" în notația standard (ex. D+P+1+M, S+P+8).
const ETAJE = [{ cheie: "S", eticheta: "Subsol" }, { cheie: "D", eticheta: "Demisol" }, { cheie: "P", eticheta: "Parter" }]
  .concat(Array.from({ length: 30 }, (_, i) => ({ cheie: String(i + 1), eticheta: `Etaj ${i + 1}` })))
  .concat([{ cheie: "M", eticheta: "Mansardă" }]);
function etichetaEtaj(v) { const e = ETAJE.find(x => x.cheie === String(v)); return e ? e.eticheta : (v === null || v === undefined ? "" : String(v)); }

// Statusurile depind de tranzacție: vânzare → vândut; închiriere → închiriat (până la o dată), cu „liber din" la cele disponibile.
const STATUSURI = {
  vanzare:    [{ cheie: "activ", eticheta: "Activ (vizibil pe site)" }, { cheie: "rezervat", eticheta: "Rezervat" }, { cheie: "vandut", eticheta: "Vândut (rămâne 30 de zile)" }],
  inchiriere: [{ cheie: "activ", eticheta: "Disponibil (vizibil pe site)" }, { cheie: "rezervat", eticheta: "Rezervat" }, { cheie: "inchiriat", eticheta: "Închiriat (până la o dată)" }]
};

// Grupuri de tipuri pentru dotări
const LOCUINTE = ["apartament", "penthouse", "casa"];
const TERENURI = ["teren_intravilan", "teren_extravilan", "teren_agricol"];
const COMERCIALE = ["comercial", "birou", "hala"];
const CLADIRI = LOCUINTE.concat(COMERCIALE);
const TOATE = TIPURI_IMOBIL.map(t => t.cheie);

const GRUPURI_DOTARI = [
  { cheie: "utilitati", titlu: "Utilități", tipuri: TOATE, elemente: [
    ["curent", "Curent electric"], ["curent_trifazic", "Curent trifazic (380V)", ["casa"].concat(COMERCIALE, TERENURI)],
    ["apa", "Apă curentă"], ["canalizare", "Canalizare"], ["gaz", "Gaz"], ["catv", "CATV"], ["internet", "Internet"],
    ["generator", "Generator electric"], ["panouri_fotovoltaice", "Panouri fotovoltaice"], ["fosa_septica", "Fosă septică"], ["put", "Puț"]
  ]},
  { cheie: "incalzire", titlu: "Încălzire și climatizare", tipuri: CLADIRI, elemente: [
    ["centrala_proprie", "Centrală proprie"], ["centrala_imobil", "Centrală de imobil"], ["termoficare", "Termoficare"],
    ["calorifere", "Calorifere"], ["calorifere_electrice", "Calorifere electrice"], ["incalzire_pardoseala", "Încălzire în pardoseală"],
    ["soba", "Sobă", LOCUINTE], ["semineu", "Șemineu", LOCUINTE],
    ["aer_conditionat", "Aer condiționat"], ["ventilatie", "Ventilație mecanică", ["penthouse"].concat(COMERCIALE)],
    ["dezumidificator", "Dezumidificator"], ["purificator_aer", "Purificator de aer"]
  ]},
  { cheie: "finisaje", titlu: "Finisaje", tipuri: CLADIRI, elemente: [
    ["parchet_natur", "Parchet natur"], ["parchet_stratificat", "Parchet stratificat"], ["parchet_laminat", "Parchet laminat"], ["parchet_spc", "Parchet SPC (rezistent la apă)"],
    ["gresie_faianta", "Gresie și faianță"], ["termopan", "Termopan"], ["usi_noi", "Uși noi"], ["usi_interior_lemn", "Uși interior lemn"], ["usa_metalica", "Ușă metalică"],
    ["vinarom", "Vinarom"], ["lambriuri", "Lambriuri"], ["tapet", "Tapet"], ["renovat", "Renovat recent"], ["finisaje_premium", "Finisaje premium"]
  ]},
  { cheie: "interior", titlu: "Dotări interioare", tipuri: LOCUINTE, elemente: [
    ["mobilat", "Mobilat"], ["utilat", "Utilat"],
    ["masina_spalat", "Mașină de spălat rufe"], ["uscator_rufe", "Uscător de rufe"], ["masina_vase", "Mașină de spălat vase"],
    ["frigider", "Frigider"], ["aragaz_plita", "Aragaz / plită"], ["cuptor", "Cuptor"], ["cuptor_microunde", "Cuptor cu microunde"], ["cuptor_lemne", "Cuptor pe lemne"], ["hota", "Hotă"],
    ["cafetiera", "Cafetieră"], ["espressor", "Espressor"], ["prajitor_paine", "Prăjitor de pâine"], ["gratar_electric", "Grătar electric"], ["ustensile_bucatarie", "Ustensile de bucătărie"],
    ["tv", "Televizor"], ["smart_tv", "Smart TV"], ["fier_calcat", "Fier de călcat"], ["uscator_par", "Uscător de păr"],
    ["jacuzzi", "Jacuzzi"], ["cabina_dus", "Cabină de duș"], ["dressing", "Dressing"], ["debara", "Debara"], ["smart_home", "Smart home"]
  ]},
  { cheie: "mobilier", titlu: "Mobilier", tipuri: LOCUINTE, elemente: [
    ["canapea_piele", "Canapea din piele"], ["canapea_extensibila", "Canapea extensibilă"], ["fotolii", "Fotolii"], ["masa_cafea", "Masă de cafea"],
    ["masa", "Masă"], ["scaune", "Scaune"], ["pat_mijloc", "Pat de mijloc"], ["noptiere", "Noptiere"], ["sifonier", "Șifonier"]
  ]},
  { cheie: "imobil", titlu: "Imobil și exterior", tipuri: CLADIRI, elemente: [
    ["balcon", "Balcon", ["apartament", "penthouse"]], ["terasa", "Terasă"], ["logie", "Logie", ["apartament", "penthouse"]],
    ["lift", "Lift", ["apartament", "penthouse"].concat(COMERCIALE)],
    ["parcare_strada", "Parcare la stradă"], ["parcare_curte", "Parcare în curte"], ["parcare_plata", "Parcare cu plată"], ["parcare_subterana", "Parcare subterană"],
    ["garaj", "Garaj", LOCUINTE], ["boxa", "Boxă", ["apartament", "penthouse"]], ["curte", "Curte", LOCUINTE], ["gradina", "Grădină", LOCUINTE],
    ["piscina", "Piscină", LOCUINTE], ["foisor", "Foișor", ["casa"]], ["bar", "Bar", LOCUINTE], ["balansoar", "Balansoar", LOCUINTE], ["sezlonguri", "Șezlonguri", LOCUINTE],
    ["acces_dizabilitati", "Acces persoane cu dizabilități"]
  ]},
  { cheie: "siguranta", titlu: "Siguranță", tipuri: CLADIRI, elemente: [
    ["interfon", "Interfon"], ["videointerfon", "Videointerfon"], ["alarma", "Sistem de alarmă"], ["supraveghere_video", "Supraveghere video"],
    ["paza", "Pază"], ["usa_acces_securizat", "Acces securizat în imobil", ["apartament", "penthouse", "birou"]]
  ]},
  { cheie: "vedere", titlu: "Vedere", tipuri: ["apartament", "penthouse"], elemente: [
    ["vedere_strada", "Stradală"], ["vedere_curte", "Curte interioară"], ["vedere_parc", "Parc"], ["vedere_lac", "Lac"], ["vedere_panoramica", "Panoramică"]
  ]},
  { cheie: "teren", titlu: "Caracteristici teren", tipuri: TERENURI, elemente: [
    ["construibil", "Construibil"], ["deschidere_strada", "Deschidere la stradă"], ["drum_asfaltat", "Drum asfaltat"],
    ["utilitati_la_limita", "Utilități la limita proprietății"], ["imprejmuit", "Împrejmuit"],
    ["puz", "PUZ aprobat"], ["certificat_urbanism", "Certificat de urbanism"], ["autorizatie_construire", "Autorizație de construire"]
  ]},
  { cheie: "comercial", titlu: "Spațiu comercial, birouri, hale", tipuri: COMERCIALE, elemente: [
    ["vitrina", "Vitrină la stradă", ["comercial"]], ["acces_stradal", "Acces direct din stradă"], ["grup_sanitar", "Grup sanitar propriu"],
    ["spatiu_depozitare", "Spațiu de depozitare"], ["open_space", "Open space"], ["compartimentat", "Compartimentat"],
    ["acces_tir", "Acces TIR", ["comercial", "hala"]], ["rampa_tir", "Rampă TIR", ["comercial", "hala"]], ["receptie", "Recepție", ["birou"]]
  ]}
];
// Chei vechi → chei noi (date introduse înainte de lista aprobată)
const DOTARI_VECHI = { parchet: "parchet_laminat", parcare: "parcare_curte", rampa: "rampa_tir", puz_pug: "puz" };
// Hartă cheie → etichetă, ca afișarea să nu depindă de grup.
const ETICHETE_DOTARI = (function () {
  const m = {};
  GRUPURI_DOTARI.forEach(g => g.elemente.forEach(e => { m[e[0]] = e[1]; }));
  return m;
})();

function tipNormalizat(cheie) { return TIPURI_VECHI[cheie] || cheie; }
function etichetaTip(cheie) { const t = TIPURI_IMOBIL.find(x => x.cheie === tipNormalizat(cheie)); return t ? t.eticheta : cheie; }
function etichetaTipTitlu(cheie) { const t = TIPURI_IMOBIL.find(x => x.cheie === tipNormalizat(cheie)); return t ? t.titlu : cheie; }
function esteTeren(tip) { return TERENURI.includes(tipNormalizat(tip)); }
function normalizeazaDotari(chei) { return (chei || []).map(c => DOTARI_VECHI[c] || c); }
// Umple un <select> cu tipurile de proprietate (o singură listă pentru hero, filtre, admin, formularul proprietarului).
function optiuniTip(prima) {
  return (prima !== undefined ? `<option value="">${prima}</option>` : "") + TIPURI_IMOBIL.map(t => `<option value="${t.cheie}">${t.eticheta}</option>`).join("");
}
function optiuniEtaj(prima) {
  return (prima !== undefined ? `<option value="">${prima}</option>` : "") + ETAJE.map(e => `<option value="${e.cheie}">${e.eticheta}</option>`).join("");
}
function optiuniStatus(tranzactie) {
  return STATUSURI[tranzactie === "inchiriere" ? "inchiriere" : "vanzare"].map(s => `<option value="${s.cheie}">${s.eticheta}</option>`).join("");
}
function dataRO(iso) { if (!iso) return ""; const p = String(iso).slice(0, 10).split("-"); return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : iso; }
function etichetaCompartimentare(cheie) { const c = COMPARTIMENTARI.find(x => x.cheie === cheie); return c ? c.eticheta : cheie; }
function etichetaDotare(cheie) { return ETICHETE_DOTARI[cheie] || cheie; }   // cheile vechi/necunoscute se afișează ca atare

// Grupurile și elementele valabile pentru un tip de imobil.
function grupuriPentruTip(tip) {
  return GRUPURI_DOTARI
    .filter(g => g.tipuri.includes(tipNormalizat(tip)))
    .map(g => ({ cheie: g.cheie, titlu: g.titlu, elemente: g.elemente.filter(e => !e[2] || e[2].includes(tipNormalizat(tip))) }))
    .filter(g => g.elemente.length);
}

// Pentru afișarea publică: dotările selectate, grupate în ordinea listei; necunoscutele intră la „Altele".
function grupeazaDotari(chei) {
  const set = new Set(normalizeazaDotari(chei));
  const rezultat = [];
  GRUPURI_DOTARI.forEach(g => {
    const el = g.elemente.filter(e => set.has(e[0])).map(e => e[1]);
    if (el.length) rezultat.push({ titlu: g.titlu, elemente: el });
    g.elemente.forEach(e => set.delete(e[0]));
  });
  if (set.size) rezultat.push({ titlu: "Altele", elemente: [...set] });
  return rezultat;
}

// Componenta de bife: randează grupurile pentru `tip` în `container`, păstrând selecția curentă.
function randeazaBife(container, tip, selectate) {
  const set = new Set(selectate || []);
  const grupuri = grupuriPentruTip(tip);
  const prefix = container.id || "bifa";
  container.innerHTML = grupuri.length ? grupuri.map(g => `
    <div class="bife-grup">
      <h4>${g.titlu}</h4>
      <div class="bife">${g.elemente.map(e => `
        <label class="bifa"><input type="checkbox" name="${prefix}" value="${e[0]}" ${set.has(e[0]) ? "checked" : ""}> ${e[1]}</label>`).join("")}
      </div>
    </div>`).join("")
    : `<p class="bife-gol">Alege tipul de proprietate pentru a vedea dotările.</p>`;
}
function citesteBife(container) {
  return [...container.querySelectorAll('input[type="checkbox"]:checked')].map(i => i.value);
}

// ===== Fotografii: redimensionare în browser înainte de salvare =====
// Ieșirea e JPEG ≤ latura maximă dată; la integrare, același blob merge în Supabase Storage.
const POZE_LATURA_MAX = 1400;
const POZE_CALITATE = 0.82;
const POZE_MAXIM = 12;

function redimensioneazaImagine(fisier) {
  return new Promise((rezolva, respinge) => {
    if (!fisier.type || !fisier.type.startsWith("image/")) { respinge(new Error("Fișierul nu este o imagine.")); return; }
    const url = URL.createObjectURL(fisier);
    const img = new Image();
    img.onload = () => {
      const raport = Math.min(1, POZE_LATURA_MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * raport);
      c.height = Math.round(img.naturalHeight * raport);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      rezolva(c.toDataURL("image/jpeg", POZE_CALITATE));
    };
    img.onerror = () => { URL.revokeObjectURL(url); respinge(new Error("Imaginea nu a putut fi citită.")); };
    img.src = url;
  });
}

// Managerul de fotografii: zonă de încărcare + grilă cu ordonare și ștergere. Ține lista în `stare.poze`.
// `radacina` primește markup-ul; opțional `optiuni.url = true` adaugă și câmpul „Adaugă din adresă URL" (admin).
function ManagerPoze(radacina, optiuni) {
  optiuni = optiuni || {};
  const stare = { poze: [] };
  const idFisier = radacina.id + "-fisier";
  radacina.innerHTML = `
    <div class="poze-incarcare" data-zona>
      <label class="buton-fisier" for="${idFisier}">Alege fotografiile</label>
      <input id="${idFisier}" type="file" accept="image/*" multiple>
      <p>Poți trage fotografiile aici. Până la ${POZE_MAXIM} imagini; prima este fotografia principală.</p>
      ${optiuni.url ? `<div style="display:flex; gap:8px; margin-top:12px; justify-content:center; flex-wrap:wrap"><input type="url" data-url placeholder="sau lipește adresa unei imagini (https://...)" style="flex:1 1 260px; max-width:460px"><button type="button" class="buton-secundar" data-adauga-url>Adaugă</button></div>` : ""}
      <p class="formular-eroare" data-eroare hidden></p>
    </div>
    <div class="poze-grila" data-grila></div>`;
  const zona = radacina.querySelector("[data-zona]"), grila = radacina.querySelector("[data-grila]"),
        intrare = radacina.querySelector('input[type="file"]'), eroare = radacina.querySelector("[data-eroare]");

  function arataEroare(text) { eroare.textContent = text; eroare.hidden = !text; }
  function randeaza() {
    grila.innerHTML = stare.poze.map((p, i) => `
      <div class="poza-item">
        <img src="${p}" alt="Fotografie ${i + 1}">
        ${i === 0 ? '<span class="poza-principala">Principală</span>' : ""}
        <div class="poza-actiuni">
          <span><button type="button" data-muta="-1" data-i="${i}" title="Mută la stânga" ${i === 0 ? "disabled" : ""}>←</button><button type="button" data-muta="1" data-i="${i}" title="Mută la dreapta" ${i === stare.poze.length - 1 ? "disabled" : ""}>→</button></span>
          <button type="button" data-sterge="${i}" title="Elimină">✕</button>
        </div>
      </div>`).join("");
    if (optiuni.laSchimbare) optiuni.laSchimbare(stare.poze);
  }
  async function adaugaFisiere(lista) {
    arataEroare("");
    const fisiere = [...lista].filter(f => f.type.startsWith("image/"));
    if (!fisiere.length) return;
    if (stare.poze.length + fisiere.length > POZE_MAXIM) { arataEroare(`Poți adăuga cel mult ${POZE_MAXIM} fotografii.`); fisiere.length = Math.max(0, POZE_MAXIM - stare.poze.length); }
    for (const f of fisiere) {
      try { stare.poze.push(await redimensioneazaImagine(f)); } catch (e) { arataEroare(e.message); }
    }
    randeaza();
  }
  intrare.addEventListener("change", () => { adaugaFisiere(intrare.files); intrare.value = ""; });
  zona.addEventListener("dragover", e => { e.preventDefault(); zona.classList.add("peste"); });
  zona.addEventListener("dragleave", () => zona.classList.remove("peste"));
  zona.addEventListener("drop", e => { e.preventDefault(); zona.classList.remove("peste"); adaugaFisiere(e.dataTransfer.files); });
  grila.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.sterge !== undefined) { stare.poze.splice(+b.dataset.sterge, 1); randeaza(); }
    else if (b.dataset.muta) { const i = +b.dataset.i, j = i + (+b.dataset.muta); [stare.poze[i], stare.poze[j]] = [stare.poze[j], stare.poze[i]]; randeaza(); }
  });
  if (optiuni.url) {
    const campUrl = radacina.querySelector("[data-url]");
    radacina.querySelector("[data-adauga-url]").addEventListener("click", () => {
      const u = campUrl.value.trim(); if (!u) return;
      if (stare.poze.length >= POZE_MAXIM) { arataEroare(`Poți adăuga cel mult ${POZE_MAXIM} fotografii.`); return; }
      stare.poze.push(u); campUrl.value = ""; randeaza();
    });
  }
  return {
    get poze() { return stare.poze.slice(); },
    seteaza(lista) { stare.poze = (lista || []).slice(); randeaza(); },
    goleste() { stare.poze = []; arataEroare(""); randeaza(); }
  };
}

// ===== Utilitare =====
function escapeHtml(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

// Titlu propus pentru o proprietate, din câmpurile ei (agentul îl poate rescrie în admin).
function titluPropus(p) {
  const tip = etichetaTipTitlu(p.tip);
  const camere = p.camere && !esteTeren(p.tip) ? ` cu ${p.camere} ${p.camere == 1 ? "cameră" : "camere"}` : "";
  const supraf = (esteTeren(p.tip) || COMERCIALE.includes(tipNormalizat(p.tip))) && p.suprafata_mp ? ` de ${p.suprafata_mp} mp` : "";
  const unde = [p.oras, p.zona].filter(Boolean).join(", ");
  const tranz = p.tranzactie === "inchiriere" ? " de închiriat" : "";
  return `${tip}${camere}${supraf}${tranz}${unde ? " în " + unde : ""}`;
}

function aziISO() { return new Date().toISOString().slice(0, 10); }

// ===== Cardul de proprietate (modelul agreat 22.09.2026, referință modern.realhomes.io) =====
// Semnele de carte („bookmark"-uri) afișate ca panglici pe fotografie. Lista finală vine de la clientă;
// se schimbă DOAR aici (cheie, etichetă, culoare, iconiță), restul codului le preia.
const ETICHETE_OFERTA = [
  { cheie: "nou",           eticheta: "Nou",           culoare: "navy",  iconita: "stea" },
  { cheie: "exclusivitate", eticheta: "Exclusiv",      culoare: "alama", iconita: "cheie" },
  { cheie: "oferta",        eticheta: "Ofertă",        culoare: "verde", iconita: "flacara" },
  { cheie: "pret_redus",    eticheta: "Redus",         culoare: "rosu",  iconita: "sageata" }
];
function etichetaOferta(cheie) { return ETICHETE_OFERTA.find(e => e.cheie === cheie); }

// Iconițe de linie, 24x24, desenate pe currentColor (fără bibliotecă externă).
const ICONITE = {
  pat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/><path d="M3 15h18"/><path d="M5 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"/><path d="M13 9V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/><path d="M3 18v2M21 18v2"/></svg>',
  dus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V6a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v1"/><path d="M8 8h8"/><path d="M12 8a5 5 0 0 1 5 5"/><path d="M15 16v1M17.5 15.5l.5.9M12.5 15.5l-.5.9M15 19v1.5M18.5 18.5l.6 1M11.5 18.5l-.6 1"/></svg>',
  suprafata: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="5" width="14" height="14"/><path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM17 17h4v4h-4z" fill="currentColor" stroke="none"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3"/></svg>',
  stea: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z"/></svg>',
  cheie: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M9 2.5a5.5 5.5 0 0 1 4.6 8.5l7 7-2 2-1.6-1.6-1.6 1.6-2-2 1.6-1.6-1.2-1.2-1.6 1.6-2-2 1.6-1.6-1.4-1.4A5.5 5.5 0 1 1 9 2.5zm0 3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/></svg>',
  flacara: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5c.6 3.4 3.2 4.7 4.6 7.3 1.6 3-.1 6.8-3.2 8.2.9-1.6.6-3.4-.6-4.4-.4 2-1.8 2.4-2.4 3.7-.6 1.2-.2 2.3.3 3.2C7.6 19.6 5.5 16.6 6 13.2c.5-3.2 3.4-4.2 4-7.3.6 1.1.7 2.3.4 3.4 1.7-1.4 2.2-4.2 1.6-6.8z"/></svg>',
  cheiePozitiva: '<svg viewBox="355 155 315 645" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M425,358.995A105,105 0 1,1 495,358.995L495,405L670,405L670,465 L495,465L495,525L615,525L615,585 L495,585L495,800 L425,800 ZM460,215a45,45 0 1,1 0,90a45,45 0 1,1 0,-90Z"/></svg>',
  bifa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  sageata: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v15"/><path d="M6 13l6 6 6-6"/></svg>'
};

// Titlul de card: simplu, Tip imobil + zonă (cerința clientei). Titlul complet rămâne pe pagina proprietății.
function titluCard(a) {
  // Cerința clientei: tip + oraș + zonă (ex. „Apartament în București, Tineretului")
  const unde = [a.oras, a.zona].filter(Boolean).join(", ");
  return unde ? `${etichetaTipTitlu(a.tip)} în ${unde}` : etichetaTipTitlu(a.tip);
}
// Adresa afișată sub titlu + linkul către Google Maps (adresa exactă dacă există, altfel zona + orașul).
function adresaAfisata(a) {
  return a.adresa_harta ? a.adresa_harta : [a.zona, a.oras].filter(Boolean).join(", ");
}
function linkHarta(a) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(adresaAfisata(a));
}
