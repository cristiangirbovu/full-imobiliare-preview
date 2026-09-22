// FULL IMOBILIARE — comun.js: vocabularul proprietății + componente partajate site ↔ admin.
// Tipuri de imobil, compartimentare, lista de dotări (cu bife, grupată după modelul imobiliare.ro),
// componenta de bife, managerul de fotografii (redimensionare în browser) și mici utilitare.
// Un singur loc de adevăr: admin.html, contact.html și proprietate.html citesc de aici.

const TIPURI_IMOBIL = [
  { cheie: "apartament", eticheta: "Apartament" },
  { cheie: "penthouse",  eticheta: "Penthouse" },
  { cheie: "casa",       eticheta: "Casă / vilă" },
  { cheie: "teren",      eticheta: "Teren" },
  { cheie: "comercial",  eticheta: "Spațiu comercial" },
  { cheie: "birou",      eticheta: "Birou" }
];

const COMPARTIMENTARI = [
  { cheie: "decomandat",     eticheta: "Decomandat" },
  { cheie: "semidecomandat", eticheta: "Semidecomandat" },
  { cheie: "comandat",       eticheta: "Comandat" },
  { cheie: "circular",       eticheta: "Circular" }
];

const CERTIFICATE_ENERGETICE = ["A", "B", "C", "D", "E", "F", "G"];

// Tipurile pentru care are sens un grup întreg; un element poate restrânge lista prin `tipuri` propriu.
const LOCUINTE = ["apartament", "penthouse", "casa"];
const CLADIRI = ["apartament", "penthouse", "casa", "comercial", "birou"];
const TOATE = TIPURI_IMOBIL.map(t => t.cheie);

const GRUPURI_DOTARI = [
  { cheie: "utilitati", titlu: "Utilități", tipuri: TOATE, elemente: [
    ["curent", "Curent electric"], ["apa", "Apă curentă"], ["canalizare", "Canalizare"], ["gaz", "Gaz"],
    ["catv", "CATV"], ["internet", "Internet"]
  ]},
  { cheie: "incalzire", titlu: "Încălzire și climatizare", tipuri: CLADIRI, elemente: [
    ["centrala_proprie", "Centrală proprie"], ["centrala_imobil", "Centrală de imobil"], ["termoficare", "Termoficare"],
    ["calorifere", "Calorifere"], ["incalzire_pardoseala", "Încălzire în pardoseală"], ["semineu", "Șemineu", LOCUINTE],
    ["aer_conditionat", "Aer condiționat"], ["ventilatie", "Ventilație mecanică", ["comercial", "birou", "penthouse"]]
  ]},
  { cheie: "finisaje", titlu: "Finisaje", tipuri: CLADIRI, elemente: [
    ["parchet", "Parchet"], ["gresie_faianta", "Gresie și faianță"], ["termopan", "Termopan"], ["usi_interior_lemn", "Uși interior lemn"],
    ["usa_metalica", "Ușă metalică"], ["renovat", "Renovat recent"], ["finisaje_premium", "Finisaje premium"]
  ]},
  { cheie: "interior", titlu: "Dotări interioare", tipuri: LOCUINTE, elemente: [
    ["mobilat", "Mobilat"], ["utilat", "Utilat"], ["masina_spalat", "Mașină de spălat"], ["masina_vase", "Mașină de spălat vase"],
    ["frigider", "Frigider"], ["aragaz_plita", "Aragaz / plită"], ["cuptor", "Cuptor"], ["hota", "Hotă"], ["tv", "Televizor"],
    ["dressing", "Dressing"], ["debara", "Debara"], ["smart_home", "Smart home"]
  ]},
  { cheie: "imobil", titlu: "Imobil și exterior", tipuri: CLADIRI, elemente: [
    ["balcon", "Balcon", ["apartament", "penthouse"]], ["terasa", "Terasă"], ["logie", "Logie", ["apartament", "penthouse"]],
    ["lift", "Lift", ["apartament", "penthouse", "comercial", "birou"]], ["parcare", "Loc de parcare"], ["parcare_subterana", "Parcare subterană"],
    ["garaj", "Garaj", LOCUINTE], ["boxa", "Boxă", ["apartament", "penthouse"]], ["curte", "Curte", LOCUINTE], ["gradina", "Grădină", LOCUINTE],
    ["piscina", "Piscină", LOCUINTE], ["foisor", "Foișor", ["casa"]], ["acces_dizabilitati", "Acces persoane cu dizabilități"]
  ]},
  { cheie: "siguranta", titlu: "Siguranță", tipuri: CLADIRI, elemente: [
    ["interfon", "Interfon"], ["videointerfon", "Videointerfon"], ["alarma", "Sistem de alarmă"], ["supraveghere_video", "Supraveghere video"],
    ["paza", "Pază"], ["usa_acces_securizat", "Acces securizat în imobil", ["apartament", "penthouse", "birou"]]
  ]},
  { cheie: "vedere", titlu: "Vedere", tipuri: ["apartament", "penthouse"], elemente: [
    ["vedere_strada", "Stradă"], ["vedere_curte", "Curte interioară"], ["vedere_parc", "Parc"], ["vedere_lac", "Lac"], ["vedere_panoramica", "Panoramică"]
  ]},
  { cheie: "teren", titlu: "Caracteristici teren", tipuri: ["teren"], elemente: [
    ["intravilan", "Intravilan"], ["extravilan", "Extravilan"], ["construibil", "Construibil"], ["deschidere_strada", "Deschidere la stradă"],
    ["drum_asfaltat", "Drum asfaltat"], ["utilitati_la_limita", "Utilități la limita proprietății"], ["imprejmuit", "Împrejmuit"],
    ["puz_pug", "PUZ / PUG aprobat"], ["certificat_urbanism", "Certificat de urbanism"]
  ]},
  { cheie: "comercial", titlu: "Spațiu comercial și birou", tipuri: ["comercial", "birou"], elemente: [
    ["vitrina", "Vitrină la stradă", ["comercial"]], ["acces_stradal", "Acces direct din stradă"], ["grup_sanitar", "Grup sanitar propriu"],
    ["spatiu_depozitare", "Spațiu de depozitare"], ["open_space", "Open space"], ["compartimentat", "Compartimentat"],
    ["acces_tir", "Acces TIR", ["comercial"]], ["rampa", "Rampă de încărcare", ["comercial"]], ["receptie", "Recepție", ["birou"]]
  ]}
];

// Hartă cheie → etichetă, ca afișarea să nu depindă de grup.
const ETICHETE_DOTARI = (function () {
  const m = {};
  GRUPURI_DOTARI.forEach(g => g.elemente.forEach(e => { m[e[0]] = e[1]; }));
  return m;
})();

function etichetaTip(cheie) { const t = TIPURI_IMOBIL.find(x => x.cheie === cheie); return t ? t.eticheta : cheie; }
function etichetaCompartimentare(cheie) { const c = COMPARTIMENTARI.find(x => x.cheie === cheie); return c ? c.eticheta : cheie; }
function etichetaDotare(cheie) { return ETICHETE_DOTARI[cheie] || cheie; }   // cheile vechi/necunoscute se afișează ca atare

// Grupurile și elementele valabile pentru un tip de imobil.
function grupuriPentruTip(tip) {
  return GRUPURI_DOTARI
    .filter(g => g.tipuri.includes(tip))
    .map(g => ({ cheie: g.cheie, titlu: g.titlu, elemente: g.elemente.filter(e => !e[2] || e[2].includes(tip)) }))
    .filter(g => g.elemente.length);
}

// Pentru afișarea publică: dotările selectate, grupate în ordinea listei; necunoscutele intră la „Altele".
function grupeazaDotari(chei) {
  const set = new Set(chei || []);
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
  const tip = ({ casa: "Casă", comercial: "Spațiu comercial" })[p.tip] || etichetaTip(p.tip);
  const camere = p.camere ? ` cu ${p.camere} ${p.camere == 1 ? "cameră" : "camere"}` : "";
  const supraf = (p.tip === "teren" || p.tip === "comercial" || p.tip === "birou") && p.suprafata_mp ? ` de ${p.suprafata_mp} mp` : "";
  const unde = p.zona ? `, ${p.zona}` : "";
  const tranz = p.tranzactie === "inchiriere" ? " de închiriat" : "";
  return `${tip}${camere}${supraf}${tranz}${unde}`;
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
  sageata: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v15"/><path d="M6 13l6 6 6-6"/></svg>'
};

// Titlul de card: simplu, Tip imobil + zonă (cerința clientei). Titlul complet rămâne pe pagina proprietății.
function titluCard(a) {
  const tip = ({ casa: "Casă", comercial: "Spațiu comercial" })[a.tip] || etichetaTip(a.tip);
  return a.zona ? `${tip} în ${a.zona}` : tip;
}
// Adresa afișată sub titlu + linkul către Google Maps (adresa exactă dacă există, altfel zona + orașul).
function adresaAfisata(a) {
  return a.adresa_harta ? a.adresa_harta : [a.zona, a.oras].filter(Boolean).join(", ");
}
function linkHarta(a) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(adresaAfisata(a));
}
