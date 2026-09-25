// FULL IMOBILIARE — app.js: randare proprietăți, filtre, sortare, pagină de detaliu, blog, servicii.
// Sursa de date: localStorage (dacă adminul demo a modificat ceva), altfel ANUNTURI (date-demo.js).
// La integrare, această funcție se rescrie pe Supabase; restul interfeței rămâne neschimbat.
const DATE_ANUNTURI = (function () {
  try { const s = localStorage.getItem("fi_anunturi"); if (s) return JSON.parse(s); } catch (e) {}
  return ANUNTURI;
})();
const DATE_ARTICOLE = (function () {
  try { const s = localStorage.getItem("fi_articole"); if (s) return JSON.parse(s); } catch (e) {}
  return (typeof ARTICOLE !== "undefined") ? ARTICOLE : [];
})();
const DATE_SERVICII = (function () {
  try { const s = localStorage.getItem("fi_servicii"); if (s) return JSON.parse(s); } catch (e) {}
  return (typeof SERVICII !== "undefined") ? SERVICII : [];
})();

// Serviciile ordonate cum apar public: cel evidențiat primul, apoi după `ordine` (setată din admin).
function serviciiPublice() {
  return [...DATE_SERVICII].sort((x, y) => (x.evidentiat === y.evidentiat) ? x.ordine - y.ordine : (x.evidentiat ? -1 : 1));
}
function slugServiciu(s) { return s.slug || ("serviciu-" + s.id); }
function urlServiciu(s) { return `serviciu.html?s=${encodeURIComponent(slugServiciu(s))}`; }

function introServicii() {
  try { const s = localStorage.getItem("fi_intro_servicii"); if (s) return s; } catch (e) {}
  return (typeof INTRO_SERVICII !== "undefined") ? INTRO_SERVICII : "";
}
// Pagina de servicii: banda albastră cu mesajul agenției (cerința clientei), apoi cardurile; fiecare duce la pagina lui.
function randeazaServicii() {
  const banda = document.getElementById("banda-servicii");
  if (banda) banda.innerHTML = `<div class="taietura" aria-hidden="true"></div><p>${escapeHtml(introServicii())}</p>`;
  const el = document.getElementById("lista-servicii");
  if (!el) return;
  el.innerHTML = serviciiPublice().map(s => `
    <a class="card-serviciu ${s.evidentiat ? "evidentiat filigran" : ""}" href="${urlServiciu(s)}">
      <h3>${escapeHtml(s.titlu)}</h3><p>${escapeHtml(s.descriere || "")}</p>
      <span class="card-serviciu-link">Află mai multe →</span>
    </a>`).join("");
}

// Prima pagină: aceeași bandă albastră + primele trei servicii din ordinea setată în admin.
function randeazaServiciiAcasa() {
  const banda = document.getElementById("intro-servicii-acasa");
  if (!banda) return;
  banda.innerHTML = `<div class="taietura" aria-hidden="true"></div><p>${escapeHtml(introServicii())}</p>`;
  const lista = document.getElementById("servicii-acasa");
  if (lista) lista.innerHTML = serviciiPublice().slice(0, 3).map(s => `
    <a class="rand" href="${urlServiciu(s)}">
      <h3>${escapeHtml(s.titlu)}</h3><p>${escapeHtml(s.descriere || "")}</p>
    </a>`).join("");
}
// Meniul de sus: dropdown-ul „Servicii" se umple din aceleași date (deci urmează lista din admin).
function randeazaMeniuServicii() {
  const el = document.getElementById("nav-servicii");
  if (!el) return;
  const curent = new URLSearchParams(location.search).get("s");
  el.innerHTML = serviciiPublice().map(s => `<a href="${urlServiciu(s)}"${slugServiciu(s) === curent ? ' class="activ"' : ""}>${escapeHtml(s.titlu)}</a>`).join("")
    + `<a class="nav-dropdown-toate" href="servicii.html">Toate serviciile →</a>`;
  const grup = el.closest(".nav-grup"), sageata = grup.querySelector(".nav-sageata");
  const seteaza = deschis => { grup.classList.toggle("deschis", deschis); sageata.setAttribute("aria-expanded", deschis ? "true" : "false"); };
  sageata.addEventListener("click", e => { e.stopPropagation(); seteaza(!grup.classList.contains("deschis")); });
  // pe desktop se deschide și la hover (CSS); click în afară / Escape închid varianta deschisă prin buton
  document.addEventListener("click", e => { if (!e.target.closest(".nav-grup")) seteaza(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") seteaza(false); });
}

// Meniul mobil (hamburger): sub 860px navul devine panou vertical sub antet.
function initMeniuMobil() {
  const b = document.getElementById("meniu-buton"), nav = document.getElementById("meniu-principal");
  if (!b || !nav) return;
  b.addEventListener("click", () => {
    const deschis = nav.classList.toggle("deschis");
    b.classList.toggle("deschis", deschis);
    b.setAttribute("aria-expanded", deschis ? "true" : "false");
    document.body.classList.toggle("meniu-deschis", deschis);
  });
}

// Pagina unui serviciu (serviciu.html?s=slug)
function randeazaServiciu() {
  const radacina = document.getElementById("serviciu");
  if (!radacina) return;
  const slug = new URLSearchParams(location.search).get("s");
  const lista = serviciiPublice();
  const s = lista.find(x => slugServiciu(x) === slug) || lista[0];
  if (!s) { radacina.innerHTML = '<div class="container"><p>Serviciul nu a fost găsit.</p></div>'; return; }
  document.title = `${s.titlu} | Full Imobiliare`;
  document.getElementById("s-titlu").textContent = s.titlu;
  document.getElementById("s-descriere").textContent = s.descriere || "";
  document.getElementById("s-continut").innerHTML = formateazaContinut(s.continut || "");
  // Emailul: subiectul poartă numele serviciului (cerință clientă), corpul e un început de mesaj.
  const subiect = `Solicitare: ${s.titlu}`;
  const corp = `Bună ziua,\n\nVă scriu în legătură cu serviciul „${s.titlu}".\n\n[Descrieți pe scurt situația dumneavoastră]\n\nNume:\nTelefon:\n`;
  document.getElementById("s-email").href = `mailto:office@fullimobiliare.ro?subject=${encodeURIComponent(subiect)}&body=${encodeURIComponent(corp)}`;
  document.getElementById("s-whatsapp").href = `https://wa.me/40000000000?text=${encodeURIComponent("Bună ziua, mă interesează serviciul " + s.titlu + ".")}`;
  document.getElementById("s-altele").innerHTML = lista.filter(x => x.id !== s.id).map(x => `<a href="${urlServiciu(x)}">${escapeHtml(x.titlu)}</a>`).join("");
}

// Text lung (articole, servicii): paragrafe separate prin linie goală; „## " = subtitlu;
// blocurile de linii care încep cu „- " devin listă; „[buton:cautator|proprietar] Text" = buton către formularul din Contact.
const ROLURI_BUTON = { cautator: "Caută-ți casa împreună cu noi", proprietar: "Listează proprietatea cu noi" };
function formateazaContinut(text) {
  return (text || "").split(/\n\s*\n/).map(bloc => {
    const b = bloc.trim();
    if (!b) return "";
    const buton = b.match(/^\[buton:(cautator|proprietar)\]\s*(.+)$/);
    if (buton) return `<p class="continut-cta"><a class="buton alama" href="contact.html?rol=${buton[1]}">${escapeHtml(buton[2].trim())}</a></p>`;
    if (b.startsWith("## ")) {
      const linii = b.split("\n");
      const titlu = `<h2>${escapeHtml(linii[0].slice(3))}</h2>`;
      const rest = linii.slice(1).join(" ").trim();
      return titlu + (rest ? `<p>${escapeHtml(rest)}</p>` : "");
    }
    if (b.startsWith("- ")) {
      return `<ul class="lista-continut">${b.split("\n").map(l => l.replace(/^-\s*/, "").trim()).filter(Boolean).map(l => `<li>${ICONITE.cheiePozitiva}<span>${escapeHtml(l)}</span></li>`).join("")}</ul>`;
    }
    return `<p>${escapeHtml(b.replace(/\n/g, " "))}</p>`;
  }).join("");
}
function formatPret(a) {
  const pret = a.pret_eur.toLocaleString("ro-RO");
  return a.tranzactie === "inchiriere" ? `${pret} € / lună` : `${pret} €`;
}

function insigne(a) {
  let html = `<span class="insigna ${a.tranzactie === "inchiriere" ? "inchiriere" : ""}">${a.tranzactie === "inchiriere" ? "De închiriat" : "De vânzare"}</span>`;
  if (a.status === "rezervat") html += `<span class="insigna rezervat">Rezervat</span>`;
  if (a.status === "vandut") html += `<span class="insigna vandut">Vândut</span>`;
  if (a.status === "inchiriat") html += `<span class="insigna vandut">Închiriat${a.inchiriat_pana_la ? " până la " + dataRO(a.inchiriat_pana_la) : ""}</span>`;
  if (a.status === "activ" && a.tranzactie === "inchiriere" && a.liber_din && a.liber_din > aziISO()) html += `<span class="insigna liber">Liber din ${dataRO(a.liber_din)}</span>`;
  return html;
}

// Cardul de proprietate (model agreat 22.09.2026): fotografie cu marcaje + contor de poze + semne de carte,
// titlu simplu (tip + zonă), adresă cu link Google Maps, 3 detalii cu iconițe, prețul jos, distinct.
// Cardul e un <article>: fotografia și titlul sunt linkuri către pagină, adresa e link separat către hartă.
function panglici(a) {
  return (a.etichete || []).map(c => etichetaOferta(c)).filter(Boolean).map(e =>
    `<span class="panglica ${e.culoare}" title="${e.eticheta}"><span class="panglica-ico">${ICONITE[e.iconita] || ""}</span><span class="panglica-text">${e.eticheta}</span></span>`).join("");
}
function detaliiCard(a) {
  const d = [];
  if (a.camere) d.push({ ico: "pat", val: a.camere, unit: a.camere == 1 ? "cameră" : "camere" });
  if (a.bai) d.push({ ico: "dus", val: a.bai, unit: a.bai == 1 ? "baie" : "băi" });
  if (a.suprafata_mp) d.push({ ico: "suprafata", val: a.suprafata_mp, unit: "mp" });
  return d.map(x => `<span class="detaliu">${ICONITE[x.ico]}<b>${x.val}</b><small>${x.unit}</small></span>`).join("");
}
function cardAnunt(a, index) {
  const url = `proprietate.html?id=${a.id_intern}`;
  const nrPoze = (a.poze || []).length;
  return `<article class="card-anunt" style="--i:${index || 0}">
    <a class="card-foto" href="${url}" aria-label="${escapeHtml(titluCard(a))}">
      <img src="${(a.poze && a.poze[0]) || ""}" alt="${escapeHtml(a.titlu)}">
      <div class="insigne">${insigne(a)}</div>
      <div class="panglici">${panglici(a)}</div>
      ${nrPoze ? `<span class="contor-poze">${ICONITE.camera}${nrPoze}</span>` : ""}
    </a>
    <div class="card-corp">
      <h3 class="card-titlu"><a href="${url}">${escapeHtml(titluCard(a))}</a></h3>
      <a class="card-adresa" href="${linkHarta(a)}" target="_blank" rel="noopener" title="Deschide în Google Maps">${ICONITE.pin}<span>${escapeHtml(adresaAfisata(a))}</span></a>
      <div class="card-detalii">${detaliiCard(a)}</div>
      <div class="card-jos">
        <div class="card-pret">${formatPret(a)}${a.negociabil ? '<span class="negociabil">negociabil</span>' : ""}</div>
        <div class="card-id">REF ${a.id_intern}</div>
      </div>
    </div>
  </article>`;
}

// Acasă: cele mai recente 3 proprietăți active
function randeazaRecente(idElement) {
  const el = document.getElementById(idElement);
  if (!el) return;
  const recente = DATE_ANUNTURI.filter(a => a.status !== "vandut" && a.status !== "inchiriat")
    .sort((x, y) => y.publicat_la.localeCompare(x.publicat_la)).slice(0, 3);
  el.innerHTML = recente.map(cardAnunt).join("");
}

// ===== Proprietăți: filtrare (v2) =====
// Starea filtrelor trăiește în URL (?tranzactie=&tip=&camere=&pret_min=&pret_max=&zona=a,b&q=&sortare=),
// deci căutarea din hero, linkurile partajate și butonul Înapoi funcționează natural.
const SUGESTII_PRET = {
  vanzare: [["sub 100.000", 0, 100000], ["100-200 mii", 100000, 200000], ["200-300 mii", 200000, 300000], ["peste 300 mii", 300000, null]],
  inchiriere: [["sub 500", 0, 500], ["500-800", 500, 800], ["800-1.200", 800, 1200], ["peste 1.200", 1200, null]]
};
function normalizeaza(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function citesteFiltre() {
  const form = document.getElementById("filtre");
  const fd = new FormData(form);
  return {
    tranzactie: fd.get("tranzactie") || "", tip: fd.get("tip") || "", camere: fd.get("camere") || "",
    pret_min: fd.get("pret_min") || "", pret_max: fd.get("pret_max") || "",
    zone: fd.getAll("zona"), q: (fd.get("q") || "").trim(),
    sortare: document.getElementById("f-sortare").value
  };
}
function scrieFiltreInUrl(f) {
  const u = new URL(location.href);
  u.search = "";
  ["tranzactie", "tip", "camere", "pret_min", "pret_max", "q"].forEach(k => { if (f[k]) u.searchParams.set(k, f[k]); });
  if (f.zone.length) u.searchParams.set("zona", f.zone.join(","));
  if (f.sortare && f.sortare !== "recente") u.searchParams.set("sortare", f.sortare);
  history.replaceState(null, "", u);
}
function aplicaFiltreDinUrl() {
  const p = new URLSearchParams(location.search), form = document.getElementById("filtre");
  const bifeaza = (nume, val) => { const i = form.querySelector(`input[name="${nume}"][value="${CSS.escape(val)}"]`); if (i) i.checked = true; };
  ["tranzactie", "tip", "camere"].forEach(k => { if (p.get(k)) bifeaza(k, p.get(k)); });
  ["pret_min", "pret_max", "q"].forEach(k => { if (p.get(k)) form.elements[k].value = p.get(k); });
  (p.get("zona") || "").split(",").filter(Boolean).forEach(z => bifeaza("zona", z));
  if (p.get("sortare")) document.getElementById("f-sortare").value = p.get("sortare");
}

function populeazaZone() {
  const el = document.getElementById("chip-zone");
  if (!el) return;
  // Zonele existente în date, cu numărul de proprietăți; chip-uri multiple (checkbox).
  const contor = {};
  DATE_ANUNTURI.forEach(a => { if (a.zona) contor[a.zona] = (contor[a.zona] || 0) + 1; });
  el.innerHTML = Object.keys(contor).sort((x, y) => x.localeCompare(y, "ro")).map(z =>
    `<label class="chip"><input type="checkbox" name="zona" value="${escapeHtml(z)}"><span>${escapeHtml(z)} <small>${contor[z]}</small></span></label>`).join("");
}
function randeazaSugestiiPret(tranzactie) {
  const el = document.getElementById("pret-sugestii"), sufix = document.getElementById("pret-sufix");
  if (!el) return;
  const cheie = tranzactie || "vanzare";
  sufix.textContent = tranzactie === "inchiriere" ? " / lună" : "";
  el.innerHTML = SUGESTII_PRET[cheie].map(s => `<button type="button" class="chip-buton" data-min="${s[1]}" data-max="${s[2] === null ? "" : s[2]}">${s[0]}</button>`).join("");
  el.querySelectorAll(".chip-buton").forEach(b => b.addEventListener("click", () => {
    const form = document.getElementById("filtre");
    form.elements.pret_min.value = b.dataset.min || ""; form.elements.pret_max.value = b.dataset.max;
    randeazaLista();
  }));
}

function randeazaLista() {
  const el = document.getElementById("lista-anunturi");
  if (!el) return;
  const f = citesteFiltre();
  const q = normalizeaza(f.q);
  let lista = DATE_ANUNTURI.filter(a => {
    if (f.tranzactie && a.tranzactie !== f.tranzactie) return false;
    if (f.tip && tipNormalizat(a.tip) !== f.tip) return false;
    if (f.camere && !(a.camere >= parseInt(f.camere, 10))) return false;
    if (f.zone.length && !f.zone.includes(a.zona)) return false;
    if (f.pret_min && a.pret_eur < Number(f.pret_min)) return false;
    if (f.pret_max && a.pret_eur > Number(f.pret_max)) return false;
    if (q && !normalizeaza(`${a.titlu} ${a.zona} ${a.oras} ${a.adresa_harta || ""} ${a.id_intern}`).includes(q)) return false;
    return true;
  });
  if (f.sortare === "pret-crescator") lista.sort((x, y) => x.pret_eur - y.pret_eur);
  else if (f.sortare === "pret-descrescator") lista.sort((x, y) => y.pret_eur - x.pret_eur);
  else if (f.sortare === "suprafata") lista.sort((x, y) => (y.suprafata_mp || 0) - (x.suprafata_mp || 0));
  else lista.sort((x, y) => (y.publicat_la || "").localeCompare(x.publicat_la || ""));

  document.getElementById("rezultate-info").textContent =
    lista.length === 1 ? "1 proprietate găsită" : `${lista.length} proprietăți găsite`;
  el.innerHTML = lista.length ? lista.map(cardAnunt).join("")
    : `<div class="stare-goala">
        <h3>Nu am găsit nimic cu filtrele alese</h3>
        <p>Încearcă să elimini un filtru sau lărgește intervalul de preț. Sau spune-ne ce cauți: multe proprietăți ajung la clienții noștri înainte să apară pe site.</p>
        <div class="stare-goala-actiuni"><button type="button" class="buton contur" data-reset>Resetează filtrele</button><a class="buton alama" href="contact.html?rol=cautator">Spune-ne ce cauți</a></div>
      </div>`;
  el.querySelectorAll("[data-reset]").forEach(b => b.addEventListener("click", reseteazaFiltre));
  randeazaFiltreActive(f);
  scrieFiltreInUrl(f);
}

// Etichetele cu filtrele active (fiecare cu ✕) + contorul de pe butonul „Filtre" (mobil)
function randeazaFiltreActive(f) {
  const el = document.getElementById("filtre-active"), numar = document.getElementById("filtre-numar");
  const etichete = [];
  if (f.tranzactie) etichete.push({ k: "tranzactie", text: f.tranzactie === "inchiriere" ? "De închiriat" : "De vânzare" });
  if (f.tip) etichete.push({ k: "tip", text: etichetaTip(f.tip) });
  if (f.camere) etichete.push({ k: "camere", text: `${f.camere}+ camere` });
  if (f.pret_min || f.pret_max) etichete.push({ k: "pret", text: `${f.pret_min ? Number(f.pret_min).toLocaleString("ro-RO") : "0"} – ${f.pret_max ? Number(f.pret_max).toLocaleString("ro-RO") : "∞"} €` });
  f.zone.forEach(z => etichete.push({ k: "zona", v: z, text: z }));
  if (f.q) etichete.push({ k: "q", text: `„${f.q}"` });
  el.hidden = !etichete.length;
  el.innerHTML = etichete.map(e => `<button type="button" class="eticheta-activa" data-k="${e.k}" data-v="${escapeHtml(e.v || "")}">${escapeHtml(e.text)}<span aria-hidden="true">✕</span></button>`).join("")
    + (etichete.length ? `<button type="button" class="reset-filtre" data-reset>Resetează tot</button>` : "");
  el.querySelectorAll(".eticheta-activa").forEach(b => b.addEventListener("click", () => scoateFiltru(b.dataset.k, b.dataset.v)));
  el.querySelectorAll("[data-reset]").forEach(b => b.addEventListener("click", reseteazaFiltre));
  // pe mobil contorul exclude tranzacția și căutarea (sunt mereu vizibile)
  const inPanou = etichete.filter(e => e.k !== "tranzactie" && e.k !== "q").length;
  numar.textContent = inPanou; numar.hidden = !inPanou;
}
function scoateFiltru(k, v) {
  const form = document.getElementById("filtre");
  if (k === "pret") { form.elements.pret_min.value = ""; form.elements.pret_max.value = ""; }
  else if (k === "q") form.elements.q.value = "";
  else if (k === "zona") { const i = form.querySelector(`input[name="zona"][value="${CSS.escape(v)}"]`); if (i) i.checked = false; }
  else { const i = form.querySelector(`input[name="${k}"][value=""]`); if (i) i.checked = true; }
  randeazaLista();
}
function reseteazaFiltre() {
  const form = document.getElementById("filtre");
  form.reset();
  form.querySelectorAll('input[name="zona"]').forEach(i => { i.checked = false; });
  document.getElementById("f-sortare").value = "recente";
  randeazaSugestiiPret("");
  randeazaLista();
}
function populeazaTipuri() {
  // Hero (select), filtre (chip-uri), formularul proprietarului/căutătorului (select): aceeași listă din comun.js
  document.querySelectorAll("select[data-tipuri]").forEach(sel => { sel.innerHTML = optiuniTip(sel.dataset.tipuri); });
  const chip = document.getElementById("chip-tip");
  if (chip) chip.innerHTML = `<label class="chip"><input type="radio" name="tip" value="" checked><span>Orice tip</span></label>` +
    TIPURI_IMOBIL.map(t => `<label class="chip"><input type="radio" name="tip" value="${t.cheie}"><span>${t.eticheta}</span></label>`).join("");
}
function initFiltre() {
  populeazaTipuri();
  const form = document.getElementById("filtre");
  if (!form) return;
  populeazaZone();
  aplicaFiltreDinUrl();
  randeazaSugestiiPret(citesteFiltre().tranzactie);
  form.addEventListener("submit", e => e.preventDefault());
  form.addEventListener("change", e => {
    if (e.target.name === "tranzactie") randeazaSugestiiPret(e.target.value);
    randeazaLista();
  });
  let temporizator;
  form.addEventListener("input", e => {
    if (!["q", "pret_min", "pret_max"].includes(e.target.name)) return;
    clearTimeout(temporizator); temporizator = setTimeout(randeazaLista, 220);
  });
  document.getElementById("f-sortare").addEventListener("change", randeazaLista);
  const comutator = document.getElementById("filtre-comutator"), detalii = document.getElementById("filtre-detalii");
  comutator.addEventListener("click", () => {
    const deschis = detalii.classList.toggle("deschis");
    comutator.setAttribute("aria-expanded", deschis ? "true" : "false");
  });
  // Dacă vine din URL cu filtre din panou, pe mobil îl deschidem ca utilizatorul să vadă ce e activ.
  const f = citesteFiltre();
  if (f.tip || f.camere || f.pret_min || f.pret_max || f.zone.length) { detalii.classList.add("deschis"); comutator.setAttribute("aria-expanded", "true"); }
  randeazaLista();
}
// Pagina proprietății
function randeazaDetaliu() {
  const radacina = document.getElementById("detaliu-anunt");
  if (!radacina) return;
  const id = new URLSearchParams(location.search).get("id") || "FI-1001";
  const a = DATE_ANUNTURI.find(x => x.id_intern === id) || DATE_ANUNTURI[0];
  document.title = `${a.titlu} | Full Imobiliare`;

  document.getElementById("d-titlu").textContent = a.titlu;
  document.getElementById("d-meta").innerHTML =
    `<a class="adresa-link" href="${linkHarta(a)}" target="_blank" rel="noopener" title="Deschide în Google Maps">${ICONITE.pin}<span>${escapeHtml(adresaAfisata(a))}</span></a><span class="meta-sep">·</span><span>publicat ${dataFrumoasa(a.publicat_la)}</span>`;
  const ref = document.getElementById("d-ref");
  if (ref) ref.textContent = `REF ${a.id_intern}`;
  document.getElementById("d-insigne").innerHTML = insigne(a);
  document.getElementById("d-pret").innerHTML =
    `${formatPret(a)}${a.negociabil ? ' <span style="font-size:13px;color:var(--text-secundar)">negociabil</span>' : ""}`;
  document.getElementById("d-eticheta").textContent = titluCard(a);
  randeazaGalerie(a);
  randeazaPuncteForte(a);
  document.getElementById("d-descriere").textContent = a.descriere;
  document.getElementById("d-agent").innerHTML = [
    a.agent_nume ? escapeHtml(a.agent_nume) : "",
    a.agent_telefon ? `<a href="tel:${escapeHtml(String(a.agent_telefon).replace(/\s+/g, ""))}">${escapeHtml(a.agent_telefon)}</a>` : "",
    a.agent_email ? `<a href="mailto:${escapeHtml(a.agent_email)}">${escapeHtml(a.agent_email)}</a>` : ""
  ].filter(Boolean).join(" · ");
  const viz = document.getElementById("d-vizionare");
  if (viz) viz.href = `contact.html?rol=cautator&ref=${encodeURIComponent(a.id_intern)}`;
  pregatesteDistribuire(a);

  const rand = (eticheta, valoare) => valoare === null || valoare === undefined || valoare === "" ? "" :
    `<tr><td>${eticheta}</td><td><b>${valoare}</b></td></tr>`;
  document.getElementById("d-spec").innerHTML =
    rand("Tip proprietate", etichetaTip(a.tip)) + rand("Tranzacție", a.tranzactie === "inchiriere" ? "Închiriere" : "Vânzare") +
    rand(esteTeren(a.tip) ? "Suprafață teren" : "Suprafață utilă", a.suprafata_mp ? a.suprafata_mp + " mp" : null) +
    rand("Camere", a.camere) + rand("Băi", a.bai) +
    rand("Etaj", a.etaj !== null && a.etaj !== undefined && a.etaj !== "" ? etichetaEtaj(a.etaj) + (a.regim_inaltime ? ` (clădire ${a.regim_inaltime})` : "") : null) +
    rand("Regim de înălțime", (a.etaj === null || a.etaj === undefined || a.etaj === "") && a.regim_inaltime ? a.regim_inaltime : null) +
    rand("Disponibil", a.status === "activ" && a.tranzactie === "inchiriere" && a.liber_din && a.liber_din > aziISO() ? "din " + dataRO(a.liber_din) : null) +
    rand("Închiriat", a.status === "inchiriat" && a.inchiriat_pana_la ? "până la " + dataRO(a.inchiriat_pana_la) : null) +
    rand("An construcție", a.an_constructie) + rand("Compartimentare", a.compartimentare ? etichetaCompartimentare(a.compartimentare) : null) +
    rand("Certificat energetic", a.certificat_energetic ? "Clasa " + a.certificat_energetic : null);
  // Dotările: bifele grupate pe categorii + textul liber „Altele" din admin.
  const grupuri = grupeazaDotari(a.dotari || []);
  if (a.dotari_altele) {
    const altele = grupuri.find(g => g.titlu === "Altele") || (grupuri.push({ titlu: "Altele", elemente: [] }), grupuri[grupuri.length - 1]);
    a.dotari_altele.split(",").map(s => s.trim()).filter(Boolean).forEach(s => altele.elemente.push(s));
  }
  document.getElementById("d-dotari").innerHTML = grupuri.length ? grupuri.map(g => `
    <div class="dotari-grup"><h4>${g.titlu}</h4><div class="dotari-lista">${g.elemente.map(d => `<span class="dotare">${ICONITE.bifa}${escapeHtml(d)}</span>`).join("")}</div></div>`).join("")
    : `<p style="color:var(--text-secundar); font-size:14.5px">Dotările se comunică la vizionare.</p>`;

  // Harta cu pin: embed Google Maps fără cheie API, pe baza adresei text din anunț.
  const harta = document.getElementById("d-harta");
  if (harta) {
    if (a.adresa_harta) {
      harta.classList.remove("harta-slot");
      harta.innerHTML = `<iframe title="Hartă: ${a.adresa_harta}" src="https://www.google.com/maps?q=${encodeURIComponent(a.adresa_harta)}&output=embed&hl=ro" style="width:100%; height:320px; border:0; border-radius:var(--raza); display:block" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><p style="margin-top:8px; font-size:13px; color:var(--text-secundar)">${a.adresa_harta}</p>`;
    } else {
      harta.textContent = "Localizarea exactă este disponibilă la cerere.";
    }
  }
}

// ===== Blog =====
function dataFrumoasa(iso) {
  if (!iso) return "";
  const luni = ["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"];
  const p = iso.split("-");
  return `${parseInt(p[2], 10)} ${luni[parseInt(p[1], 10) - 1]} ${p[0]}`;
}

function randeazaBlog() {
  const el = document.getElementById("lista-articole");
  if (!el) return;
  const publicate = DATE_ARTICOLE.filter(a => a.status === "publicat")
    .sort((x, y) => (y.publicat_la || "").localeCompare(x.publicat_la || ""));
  el.innerHTML = publicate.length ? publicate.map(a => `
    <a class="card-articol" href="articol.html?slug=${a.slug}">
      <img src="${a.imagine_url || ""}" alt="">
      <div class="corp"><h3>${a.titlu}</h3><div class="data">${dataFrumoasa(a.publicat_la)}</div></div>
    </a>`).join("")
    : `<p style="color:var(--text-secundar)">Primele articole apar în curând.</p>`;
}

function randeazaArticol() {
  const radacina = document.getElementById("articol");
  if (!radacina) return;
  const slug = new URLSearchParams(location.search).get("slug");
  const a = DATE_ARTICOLE.find(x => x.slug === slug && x.status === "publicat")
    || DATE_ARTICOLE.filter(x => x.status === "publicat")[0];
  if (!a) { radacina.innerHTML = "<p>Articolul nu a fost găsit.</p>"; return; }
  document.title = `${a.titlu} | Full Imobiliare`;
  document.getElementById("a-titlu").textContent = a.titlu;
  document.getElementById("a-data").textContent = dataFrumoasa(a.publicat_la);
  const img = document.getElementById("a-imagine");
  if (a.imagine_url) { img.src = a.imagine_url; img.alt = a.titlu; } else { img.remove(); }
  document.getElementById("a-continut").innerHTML = formateazaContinut(a.continut);
}

// ===== Galerie mozaic + vizualizare pe tot ecranul =====
let pozeGalerie = [];
let indexLightbox = 0;
function randeazaGalerie(a) {
  const g = document.getElementById("d-galerie");
  if (!g) return;
  pozeGalerie = (a.poze || []).filter(Boolean);
  const n = pozeGalerie.length;
  if (!n) { g.innerHTML = `<div class="galerie-gol">Fotografiile sunt în curs de pregătire.</div>`; return; }
  g.className = "galerie " + (n >= 3 ? "trei" : n === 2 ? "doua" : "una");
  g.innerHTML = pozeGalerie.slice(0, 3).map((p, i) => `
    <button type="button" class="galerie-poza" data-i="${i}" aria-label="Fotografia ${i + 1} din ${n}"><img src="${p}" alt="${escapeHtml(a.titlu)}, fotografia ${i + 1}" ${i ? 'loading="lazy"' : ""}></button>`).join("")
    + `<button type="button" class="galerie-toate" data-i="0">${ICONITE.camera}Vezi toate cele ${n} ${n === 1 ? "fotografie" : "fotografii"}</button>`;
  g.querySelectorAll("[data-i]").forEach(b => b.addEventListener("click", () => deschideLightbox(+b.dataset.i)));
}
function deschideLightbox(i) {
  const lb = document.getElementById("lightbox");
  if (!lb || !pozeGalerie.length) return;
  indexLightbox = i;
  arataFotoLightbox();
  lb.showModal();
}
function arataFotoLightbox() {
  const img = document.getElementById("lb-img");
  img.src = pozeGalerie[indexLightbox];
  document.getElementById("lb-contor").textContent = `${indexLightbox + 1} / ${pozeGalerie.length}`;
}
function mutaLightbox(pas) {
  indexLightbox = (indexLightbox + pas + pozeGalerie.length) % pozeGalerie.length;
  arataFotoLightbox();
}
(function initLightbox() {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  document.getElementById("lb-prev").addEventListener("click", () => mutaLightbox(-1));
  document.getElementById("lb-next").addEventListener("click", () => mutaLightbox(1));
  document.getElementById("lb-inchide").addEventListener("click", () => lb.close());
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });   // click pe fundal închide
  lb.addEventListener("keydown", e => { if (e.key === "ArrowLeft") mutaLightbox(-1); if (e.key === "ArrowRight") mutaLightbox(1); });
})();

// ===== Puncte forte: 3-4 argumente pozitive deduse din date, în ordinea impactului =====
function randeazaPuncteForte(a) {
  const panou = document.getElementById("d-puncte-forte"), lista = document.getElementById("d-puncte-lista");
  if (!panou) return;
  const d = new Set(normalizeazaDotari(a.dotari));
  const anCurent = new Date().getFullYear();
  const p = [];
  if (a.an_constructie && anCurent - a.an_constructie <= 6) p.push(`Construcție nouă, din ${a.an_constructie}`);
  else if (d.has("renovat")) p.push("Renovat recent, gata de mutat");
  if (a.certificat_energetic === "A" || a.certificat_energetic === "B") p.push(`Eficiență energetică ridicată, clasa ${a.certificat_energetic}: facturi mici`);
  if (d.has("vedere_panoramica")) p.push("Vedere panoramică asupra orașului");
  else if (d.has("vedere_parc") || d.has("vedere_lac")) p.push(`Vedere spre ${d.has("vedere_parc") ? "parc" : "lac"}, liniște la fereastră`);
  if (d.has("terasa") || d.has("balcon") || d.has("gradina") || d.has("curte")) p.push(d.has("gradina") ? "Grădină pentru diminețile cu cafea afară" : d.has("terasa") ? "Terasă generoasă, spațiu de respirat" : d.has("curte") ? "Curte proprie" : "Balcon pentru dimineți cu cafea");
  if (d.has("parcare_subterana") || d.has("garaj") || d.has("parcare_curte") || d.has("parcare_strada")) p.push(d.has("garaj") ? "Garaj propriu" : d.has("parcare_subterana") ? "Loc de parcare subteran, fără griji iarna" : d.has("parcare_curte") ? "Parcare în curte" : "Parcare la stradă");
  if (d.has("mobilat") && d.has("utilat")) p.push("Mobilat și utilat: te muți imediat");
  if (a.compartimentare === "decomandat") p.push("Decomandat: intimitate pentru fiecare cameră");
  if (esteTeren(a.tip) && d.has("construibil")) p.push(a.tip === "teren_intravilan" ? "Intravilan construibil" + (d.has("utilitati_la_limita") ? ", cu utilități la limită" : "") : "Teren construibil");
  if (esteTeren(a.tip) && d.has("autorizatie_construire")) p.push("Are autorizație de construire");
  if (d.has("smart_home")) p.push("Sistem smart home integrat");
  if (a.negociabil) p.push("Preț negociabil");
  const alese = p.slice(0, 4);
  panou.hidden = alese.length < 2;
  lista.innerHTML = alese.map(x => `<li>${ICONITE.cheiePozitiva}<span>${escapeHtml(x)}</span></li>`).join("");
}

// ===== Distribuie / Printează =====
function pregatesteDistribuire(a) {
  const buton = document.getElementById("buton-distribuie"), meniu = document.getElementById("share-meniu");
  if (!buton || !meniu) return;
  const url = location.href, titlu = `${a.titlu} | Full Imobiliare`;
  const text = `${titluCard(a)}, ${formatPret(a)} · REF ${a.id_intern}`;
  meniu.querySelector('[data-share="whatsapp"]').href = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
  meniu.querySelector('[data-share="facebook"]').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  meniu.querySelector('[data-share="email"]').href = `mailto:?subject=${encodeURIComponent(titlu)}&body=${encodeURIComponent(text + "\n" + url)}`;
  const inchide = () => { meniu.hidden = true; buton.setAttribute("aria-expanded", "false"); };
  buton.addEventListener("click", async () => {
    // Pe telefon: fereastra nativă de distribuire; pe desktop: meniul cu opțiuni.
    if (navigator.share && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
      try { await navigator.share({ title: titlu, text, url }); } catch (e) {}
      return;
    }
    meniu.hidden = !meniu.hidden;
    buton.setAttribute("aria-expanded", meniu.hidden ? "false" : "true");
  });
  meniu.querySelector('[data-share="copiaza"]').addEventListener("click", async b => {
    const el = b.currentTarget;
    try { await navigator.clipboard.writeText(url); el.textContent = "Link copiat ✓"; } catch (e) { el.textContent = url; }
    setTimeout(() => { el.textContent = "Copiază linkul"; inchide(); }, 1400);
  });
  document.addEventListener("click", e => { if (!e.target.closest(".share-invelis")) inchide(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") inchide(); });
  const print = document.getElementById("buton-printeaza");
  if (print) print.addEventListener("click", () => window.print());
}
document.addEventListener("DOMContentLoaded", () => {
  randeazaRecente("anunturi-recente");
  initFiltre();
  randeazaDetaliu();
  randeazaBlog();
  randeazaArticol();
  randeazaServicii();
  randeazaServiciiAcasa();
  randeazaServiciu();
  randeazaMeniuServicii();
  initMeniuMobil();

  // Apariție la scroll: IntersectionObserver (fără scroll listener); CSS-ul respectă prefers-reduced-motion.
  const observator = new IntersectionObserver(intrari => {
    intrari.forEach(i => {
      if (i.isIntersecting) { i.target.classList.add("vizibil"); observator.unobserve(i.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".aparitie").forEach(el => observator.observe(el));
});
