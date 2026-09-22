// FULL IMOBILIARE — admin.js (v3: Proprietăți / Solicitări / Blog / Servicii)
// Stratul de date: localStorage, cu EXACT aceeași formă ca schema Supabase (schema.sql).
// La integrare, funcțiile citeste/scrie se rescriu pe clientul Supabase; interfața rămâne neschimbată.
// Vocabularul (tipuri, compartimentări, dotări) și componentele partajate vin din comun.js.

const CHEIE_DATE = "fi_anunturi";
const CHEIE_ARTICOLE = "fi_articole";
const CHEIE_SERVICII = "fi_servicii";
const CHEIE_SOLICITARI = "fi_solicitari";
const CHEIE_SESIUNE = "fi_sesiune";
const CONT_DEMO = { email: "admin@fullimobiliare.ro", parola: "demo2026" };

// ===== Stratul de date (adaptoare demo) =====
function citeste(cheie, seed) {
  try { const s = localStorage.getItem(cheie); if (s) return JSON.parse(s); } catch (e) {}
  return JSON.parse(JSON.stringify(seed));
}
function scrie(cheie, lista) { localStorage.setItem(cheie, JSON.stringify(lista)); }   // aruncă la depășirea spațiului
function scrieSigur(cheie, lista) {
  try { scrie(cheie, lista); return true; }
  catch (e) { alert("Nu s-a putut salva: fotografiile depășesc spațiul disponibil în mediul de demonstrație. Elimină câteva fotografii și încearcă din nou."); return false; }
}

let anunturi = citeste(CHEIE_DATE, ANUNTURI);
let articole = citeste(CHEIE_ARTICOLE, typeof ARTICOLE !== "undefined" ? ARTICOLE : []);
let servicii = citeste(CHEIE_SERVICII, typeof SERVICII !== "undefined" ? SERVICII : []);
let solicitari = citeste(CHEIE_SOLICITARI, typeof SOLICITARI !== "undefined" ? SOLICITARI : []);
let refInEditare = null;
let solicitareSursa = null;        // id-ul solicitării din care se creează proprietatea (fluxul de aprobare)
let slugInEditare = null;
let serviciuInEditare = null;
const azi = () => new Date().toISOString().slice(0, 10);

// ===== Autentificare (demo, cu rezervă în memorie dacă stocarea e blocată) =====
let sesiuneInMemorie = false;
let utilizatorInMemorie = "";
function seteazaSesiune(email) {
  sesiuneInMemorie = true; utilizatorInMemorie = email;
  try { localStorage.setItem(CHEIE_SESIUNE, "1"); localStorage.setItem("fi_utilizator", email); } catch (e) {}
}
function stergeSesiune() {
  sesiuneInMemorie = false; utilizatorInMemorie = "";
  try { localStorage.removeItem(CHEIE_SESIUNE); localStorage.removeItem("fi_utilizator"); } catch (e) {}
}
function esteAutentificat() {
  if (sesiuneInMemorie) return true;
  try { return localStorage.getItem(CHEIE_SESIUNE) === "1"; } catch (e) { return false; }
}
function utilizatorCurent() {
  if (utilizatorInMemorie) return utilizatorInMemorie;
  try { return localStorage.getItem("fi_utilizator") || ""; } catch (e) { return ""; }
}

function arataEcran() {
  const logat = esteAutentificat();
  document.getElementById("ecran-login").hidden = logat;
  document.getElementById("ecran-admin").hidden = !logat;
  if (logat) {
    document.getElementById("admin-utilizator").textContent = utilizatorCurent();
    actualizeazaContoare();
    randeazaTabel();
  }
}

document.getElementById("formular-login").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("l-email").value.trim().toLowerCase();
  const parola = document.getElementById("l-parola").value.trim();
  if (email === CONT_DEMO.email && parola === CONT_DEMO.parola) {
    seteazaSesiune(email);
    document.getElementById("login-eroare").hidden = true;
    arataEcran();
  } else {
    document.getElementById("login-eroare").hidden = false;
  }
});

document.getElementById("buton-iesire").addEventListener("click", () => { stergeSesiune(); arataEcran(); });

// ===== Navigare (bara laterală) =====
const VEDERI = ["vedere-lista", "vedere-formular", "vedere-solicitari", "vedere-solicitare", "vedere-blog", "vedere-formular-articol", "vedere-servicii", "vedere-formular-serviciu"];
function arataVederea(id) {
  VEDERI.forEach(v => { const el = document.getElementById(v); if (el) el.hidden = (v !== id); });
  document.getElementById("nav-anunturi").classList.toggle("activ", id === "vedere-lista" || id === "vedere-formular");
  document.getElementById("nav-solicitari").classList.toggle("activ", id === "vedere-solicitari" || id === "vedere-solicitare");
  document.getElementById("nav-blog").classList.toggle("activ", id === "vedere-blog" || id === "vedere-formular-articol");
  document.getElementById("nav-servicii").classList.toggle("activ", id === "vedere-servicii" || id === "vedere-formular-serviciu");
  window.scrollTo({ top: 0 });
}
document.getElementById("nav-anunturi").addEventListener("click", () => { arataVederea("vedere-lista"); randeazaTabel(); });
document.getElementById("nav-solicitari").addEventListener("click", () => { arataVederea("vedere-solicitari"); randeazaTabelSolicitari(); });
document.getElementById("nav-blog").addEventListener("click", () => { arataVederea("vedere-blog"); randeazaTabelBlog(); });
document.getElementById("nav-servicii").addEventListener("click", () => { arataVederea("vedere-servicii"); randeazaTabelServicii(); });

function actualizeazaContoare() {
  document.getElementById("numar-anunturi").textContent = anunturi.length;
  document.getElementById("numar-articole").textContent = articole.length;
  document.getElementById("numar-servicii").textContent = servicii.length;
  const noi = solicitari.filter(s => s.status === "noua").length;
  const el = document.getElementById("numar-solicitari");
  el.textContent = noi || "";
  el.classList.toggle("alerta", noi > 0);
}

// ===== Ștergere cu dialog unificat =====
const dialogSterge = document.getElementById("dialog-sterge");
let tintaStergere = null;   // { tip: "anunt" | "articol" | "serviciu" | "solicitare", id }
function cereStergerea(tip, id, text) {
  tintaStergere = { tip, id };
  document.getElementById("dialog-sterge-text").textContent = text;
  dialogSterge.showModal();
}
document.getElementById("dialog-nu").addEventListener("click", () => { tintaStergere = null; dialogSterge.close(); });
document.getElementById("dialog-da").addEventListener("click", () => {
  if (!tintaStergere) { dialogSterge.close(); return; }
  if (tintaStergere.tip === "anunt") {
    anunturi = anunturi.filter(x => x.id_intern !== tintaStergere.id);
    scrieSigur(CHEIE_DATE, anunturi); randeazaTabel();
  } else if (tintaStergere.tip === "articol") {
    articole = articole.filter(x => x.slug !== tintaStergere.id);
    scrieSigur(CHEIE_ARTICOLE, articole); randeazaTabelBlog();
  } else if (tintaStergere.tip === "serviciu") {
    servicii = servicii.filter(x => x.id !== tintaStergere.id);
    scrieSigur(CHEIE_SERVICII, servicii); randeazaTabelServicii();
  } else if (tintaStergere.tip === "solicitare") {
    solicitari = solicitari.filter(x => x.id !== tintaStergere.id);
    scrieSigur(CHEIE_SOLICITARI, solicitari);
    arataVederea("vedere-solicitari"); randeazaTabelSolicitari();
  }
  tintaStergere = null;
  actualizeazaContoare();
  dialogSterge.close();
});

// ============================================================
// PROPRIETĂȚI
// ============================================================
function formatPretAdmin(a) {
  const pret = (a.pret_eur || 0).toLocaleString("ro-RO");
  return a.tranzactie === "inchiriere" ? `${pret} € / lună` : `${pret} €`;
}

function randeazaTabel() {
  const cauta = (document.getElementById("admin-cauta").value || "").toLowerCase();
  const filtruStatus = document.getElementById("admin-filtru-status").value;
  let lista = anunturi.filter(a => {
    if (filtruStatus && a.status !== filtruStatus) return false;
    if (cauta && !(`${a.titlu} ${a.zona} ${a.id_intern}`.toLowerCase().includes(cauta))) return false;
    return true;
  }).sort((x, y) => (y.publicat_la || "").localeCompare(x.publicat_la || ""));

  document.getElementById("admin-contor").textContent = `${lista.length} din ${anunturi.length} proprietăți`;
  document.getElementById("admin-tbody").innerHTML = lista.map(a => `
    <tr>
      <td class="tabel-ref">${a.id_intern}</td>
      <td><img class="tabel-foto" src="${(a.poze && a.poze[0]) || ""}" alt=""></td>
      <td class="tabel-titlu">${escapeHtml(a.titlu)}<div class="tabel-descriere">${a.tranzactie === "inchiriere" ? "Închiriere" : "Vânzare"} · ${etichetaTip(a.tip)}</div></td>
      <td>${escapeHtml(a.oras)}, ${escapeHtml(a.zona)}</td>
      <td class="tabel-pret">${formatPretAdmin(a)}</td>
      <td>
        <select class="select-status st-${a.status}" data-ref="${a.id_intern}" aria-label="Status ${a.id_intern}">
          <option value="activ" ${a.status === "activ" ? "selected" : ""}>Activ</option>
          <option value="rezervat" ${a.status === "rezervat" ? "selected" : ""}>Rezervat</option>
          <option value="vandut" ${a.status === "vandut" ? "selected" : ""}>Vândut</option>
        </select>
      </td>
      <td>${a.publicat_la || "-"}</td>
      <td class="col-actiuni">
        <a class="actiune" href="proprietate.html?id=${a.id_intern}" target="_blank" rel="noopener">Vezi</a>
        <button class="actiune" data-editeaza="${a.id_intern}" type="button">Editează</button>
        <button class="actiune sterge" data-sterge="${a.id_intern}" type="button">Șterge</button>
      </td>
    </tr>`).join("");

  document.querySelectorAll(".select-status").forEach(sel => sel.addEventListener("change", e => {
    const a = anunturi.find(x => x.id_intern === e.target.dataset.ref);
    a.status = e.target.value;
    a.vandut_la = a.status === "vandut" ? azi() : null;
    a.actualizat_la = azi();
    scrieSigur(CHEIE_DATE, anunturi);
    randeazaTabel();
  }));
  document.querySelectorAll("[data-editeaza]").forEach(b => b.addEventListener("click", () => deschideFormular(b.dataset.editeaza)));
  document.querySelectorAll("[data-sterge]").forEach(b => b.addEventListener("click", () => {
    const a = anunturi.find(x => x.id_intern === b.dataset.sterge);
    cereStergerea("anunt", a.id_intern, `${a.id_intern} · ${a.titlu}. Proprietatea dispare definitiv din listă și de pe site.`);
  }));
}

document.getElementById("admin-cauta").addEventListener("input", randeazaTabel);
document.getElementById("admin-filtru-status").addEventListener("change", randeazaTabel);

document.getElementById("buton-reset").addEventListener("click", () => {
  try { [CHEIE_DATE, CHEIE_ARTICOLE, CHEIE_SERVICII, CHEIE_SOLICITARI].forEach(c => localStorage.removeItem(c)); } catch (e) {}
  anunturi = citeste(CHEIE_DATE, ANUNTURI);
  articole = citeste(CHEIE_ARTICOLE, typeof ARTICOLE !== "undefined" ? ARTICOLE : []);
  servicii = citeste(CHEIE_SERVICII, typeof SERVICII !== "undefined" ? SERVICII : []);
  solicitari = citeste(CHEIE_SOLICITARI, typeof SOLICITARI !== "undefined" ? SOLICITARI : []);
  actualizeazaContoare();
  randeazaTabel();
});

function refNou() {
  const maxim = anunturi.reduce((m, a) => {
    const n = parseInt((a.id_intern || "").replace(/\D/g, ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 1000);
  return `FI-${maxim + 1}`;
}

// Componentele editorului: bifele de dotări (urmăresc tipul) și managerul de fotografii.
const bifeEditor = document.getElementById("f-dotari");
const tipEditor = document.getElementById("f-tip");
tipEditor.addEventListener("change", () => randeazaBife(bifeEditor, tipEditor.value, citesteBife(bifeEditor)));
const pozeEditor = ManagerPoze(document.getElementById("f-poze"), { url: true });
const eticheteEditor = document.getElementById("f-etichete");
function randeazaEtichete(selectate) {
  const set = new Set(selectate || []);
  eticheteEditor.innerHTML = ETICHETE_OFERTA.map(e => `<label class="bifa"><input type="checkbox" value="${e.cheie}" ${set.has(e.cheie) ? "checked" : ""}> ${e.eticheta}</label>`).join("");
}

// Completează editorul dintr-un obiect cu forma proprietății (existentă sau propusă de un proprietar).
function completeazaEditor(a) {
  const v = (id, val) => { document.getElementById(id).value = (val === null || val === undefined) ? "" : val; };
  v("f-titlu", a ? a.titlu : ""); v("f-tranzactie", a ? a.tranzactie : "vanzare");
  v("f-tip", a ? a.tip : "apartament"); v("f-pret", a ? a.pret_eur : "");
  document.getElementById("f-negociabil").checked = a ? !!a.negociabil : false;
  v("f-oras", a ? a.oras : "București"); v("f-zona", a ? a.zona : "");
  v("f-adresa", a ? (a.adresa_harta || "") : "");
  v("f-status", a && a.status ? a.status : "activ"); v("f-suprafata", a ? a.suprafata_mp : "");
  v("f-camere", a ? a.camere : ""); v("f-bai", a ? a.bai : "");
  v("f-etaj", a ? a.etaj : ""); v("f-etaje", a ? a.etaje_total : "");
  v("f-an", a ? a.an_constructie : ""); v("f-compartimentare", a ? (a.compartimentare || "") : "");
  v("f-certificat", a ? (a.certificat_energetic || "") : "");
  v("f-dotari-altele", a ? (a.dotari_altele || "") : "");
  v("f-descriere", a ? (a.descriere || "") : "");
  v("f-agent", a ? (a.agent_nume || "") : ""); v("f-agent-tel", a ? (a.agent_telefon || "") : "");
  randeazaBife(bifeEditor, tipEditor.value, a ? (a.dotari || []) : []);
  randeazaEtichete(a ? (a.etichete || []) : []);
  pozeEditor.seteaza(a ? (a.poze || []) : []);
}

function deschideFormular(ref) {
  refInEditare = ref || null;
  solicitareSursa = null;
  const a = ref ? anunturi.find(x => x.id_intern === ref) : null;
  document.getElementById("formular-titlu").textContent = a ? "Editare proprietate" : "Proprietate nouă";
  document.getElementById("formular-ref").textContent = a ? `REF ${a.id_intern}` : `REF alocat automat: ${refNou()}`;
  document.getElementById("formular-sursa").hidden = true;
  document.getElementById("buton-salveaza").textContent = "Salvează proprietatea";
  completeazaEditor(a);
  arataVederea("vedere-formular");
}

// Fluxul de aprobare: editorul se deschide precompletat din solicitarea proprietarului.
function deschideFormularDinSolicitare(s) {
  refInEditare = null;
  solicitareSursa = s.id;
  const p = s.proprietate || {};
  const propus = Object.assign({}, p, {
    titlu: titluPropus(p), adresa_harta: [p.adresa, p.zona, p.oras].filter(Boolean).join(", "), status: "activ",
    descriere: p.descriere || "", agent_nume: "", agent_telefon: ""
  });
  document.getElementById("formular-titlu").textContent = "Publicare din solicitare";
  document.getElementById("formular-ref").textContent = `Solicitarea ${s.id} · ${s.contact.nume} · REF alocat automat: ${refNou()}`;
  const sursa = document.getElementById("formular-sursa");
  sursa.textContent = `La salvare, solicitarea ${s.id} se marchează ca aprobată și proprietatea apare pe site cu statusul ales.`;
  sursa.hidden = false;
  document.getElementById("buton-salveaza").textContent = "Aprobă și publică";
  completeazaEditor(propus);
  arataVederea("vedere-formular");
}

function inchideFormular() {
  if (solicitareSursa) { const id = solicitareSursa; solicitareSursa = null; deschideSolicitare(id); return; }
  arataVederea("vedere-lista"); randeazaTabel();
}

document.getElementById("buton-nou").addEventListener("click", () => deschideFormular(null));
document.getElementById("buton-inapoi").addEventListener("click", inchideFormular);
document.getElementById("buton-renunta").addEventListener("click", inchideFormular);

document.getElementById("formular-anunt").addEventListener("submit", e => {
  e.preventDefault();
  const numar = id => { const x = document.getElementById(id).value; return x === "" ? null : parseInt(x, 10); };
  const text = id => document.getElementById(id).value.trim();

  const a = refInEditare ? anunturi.find(x => x.id_intern === refInEditare) : { id_intern: refNou(), publicat_la: azi() };
  a.titlu = text("f-titlu"); a.tranzactie = text("f-tranzactie"); a.tip = text("f-tip");
  a.pret_eur = numar("f-pret"); a.negociabil = document.getElementById("f-negociabil").checked;
  a.oras = text("f-oras"); a.zona = text("f-zona"); a.adresa_harta = text("f-adresa") || null;
  a.status = text("f-status");
  a.vandut_la = a.status === "vandut" ? (a.vandut_la || azi()) : null;
  a.suprafata_mp = numar("f-suprafata"); a.camere = numar("f-camere"); a.bai = numar("f-bai");
  a.etaj = numar("f-etaj"); a.etaje_total = numar("f-etaje"); a.an_constructie = numar("f-an");
  a.compartimentare = text("f-compartimentare") || null;
  a.certificat_energetic = text("f-certificat") || null;
  a.dotari = citesteBife(bifeEditor);
  a.dotari_altele = text("f-dotari-altele");
  a.etichete = citesteBife(eticheteEditor);
  a.descriere = text("f-descriere");
  a.poze = pozeEditor.poze;
  a.agent_nume = text("f-agent") || null; a.agent_telefon = text("f-agent-tel") || null;
  a.actualizat_la = azi();

  const listaNoua = refInEditare ? anunturi : [a, ...anunturi];
  if (!scrieSigur(CHEIE_DATE, listaNoua)) return;
  anunturi = listaNoua;

  if (solicitareSursa) {
    const s = solicitari.find(x => x.id === solicitareSursa);
    if (s) { s.status = "aprobata"; s.ref_proprietate = a.id_intern; s.tratat_la = azi(); scrieSigur(CHEIE_SOLICITARI, solicitari); }
    solicitareSursa = null;
    actualizeazaContoare();
    arataVederea("vedere-lista"); randeazaTabel();
    return;
  }
  actualizeazaContoare();
  inchideFormular();
});

// ============================================================
// SOLICITĂRI (din formularele publice)
// ============================================================
const STATUS_SOLICITARE = { noua: "Nouă", aprobata: "Aprobată", tratata: "Tratată", respinsa: "Respinsă" };
function dataOra(iso) { if (!iso) return "-"; const [d, t] = iso.split("T"); return t ? `${d} ${t.slice(0, 5)}` : d; }
function rezumatSolicitare(s) {
  if (s.rol === "proprietar") {
    const p = s.proprietate || {};
    return `${titluPropus(p)} · ${(p.pret_eur || 0).toLocaleString("ro-RO")} €${p.tranzactie === "inchiriere" ? "/lună" : ""} · ${(p.poze || []).length} foto`;
  }
  const c = s.cautare || {};
  return `${c.tranzactie === "inchiriere" ? "Închiriere" : "Cumpărare"} · ${etichetaTip(c.tip)}${c.camere_min ? `, min. ${c.camere_min} camere` : ""}${c.buget_max_eur ? ` · buget ${c.buget_max_eur.toLocaleString("ro-RO")} €` : ""}${c.zone ? ` · ${c.zone}` : ""}`;
}

function randeazaTabelSolicitari() {
  const rol = document.getElementById("solicitari-filtru-rol").value;
  const status = document.getElementById("solicitari-filtru-status").value;
  const lista = solicitari.filter(s => (!rol || s.rol === rol) && (!status || s.status === status))
    .sort((x, y) => (y.creat_la || "").localeCompare(x.creat_la || ""));
  const noi = solicitari.filter(s => s.status === "noua").length;
  document.getElementById("solicitari-contor").textContent = `${lista.length} afișate · ${noi} noi din ${solicitari.length} în total`;
  document.getElementById("solicitari-tbody").innerHTML = lista.length ? lista.map(s => `
    <tr>
      <td class="tabel-ref">${s.id}</td>
      <td style="white-space:nowrap">${dataOra(s.creat_la)}</td>
      <td><span class="insigna-admin ${s.rol === "proprietar" ? "evidentiat" : "ciorna"}">${s.rol === "proprietar" ? "Listare" : "Căutare"}</span></td>
      <td class="tabel-titlu">${escapeHtml(s.contact.nume)}<div class="tabel-descriere">${escapeHtml(s.contact.telefon)}${s.contact.email ? " · " + escapeHtml(s.contact.email) : ""}</div></td>
      <td class="tabel-descriere" style="min-width:260px; max-width:380px">${escapeHtml(rezumatSolicitare(s))}</td>
      <td><span class="insigna-admin sol-${s.status}">${STATUS_SOLICITARE[s.status] || s.status}</span></td>
      <td class="col-actiuni">
        <button class="actiune" data-solicitare="${s.id}" type="button">Deschide</button>
        ${s.rol === "proprietar" && s.status === "noua" ? `<button class="actiune" data-aproba="${s.id}" type="button">Aprobă și publică</button>` : ""}
      </td>
    </tr>`).join("")
    : `<tr><td colspan="7" style="color:var(--text-secundar); padding:26px 16px">Nicio solicitare pentru filtrele alese.</td></tr>`;
  document.querySelectorAll("[data-solicitare]").forEach(b => b.addEventListener("click", () => deschideSolicitare(b.dataset.solicitare)));
  document.querySelectorAll("[data-aproba]").forEach(b => b.addEventListener("click", () => deschideFormularDinSolicitare(solicitari.find(x => x.id === b.dataset.aproba))));
}
document.getElementById("solicitari-filtru-rol").addEventListener("change", randeazaTabelSolicitari);
document.getElementById("solicitari-filtru-status").addEventListener("change", randeazaTabelSolicitari);

function randCaract(eticheta, valoare) {
  return (valoare === null || valoare === undefined || valoare === "") ? "" : `<tr><td>${eticheta}</td><td><b>${escapeHtml(valoare)}</b></td></tr>`;
}

function deschideSolicitare(id) {
  const s = solicitari.find(x => x.id === id);
  if (!s) { arataVederea("vedere-solicitari"); randeazaTabelSolicitari(); return; }
  document.getElementById("solicitare-titlu").textContent = `${s.rol === "proprietar" ? "Solicitare de listare" : "Solicitare de căutare"} ${s.id}`;
  document.getElementById("solicitare-meta").textContent = `Primită ${dataOra(s.creat_la)} din pagina de Contact`;

  const contact = `
    <div class="panou sectiune-formular">
      <h3>Persoana de contact</h3>
      <table class="tabel-spec">
        ${randCaract("Nume", s.contact.nume)}${randCaract("Telefon", s.contact.telefon)}${randCaract("Email", s.contact.email)}
      </table>
    </div>`;

  let continut = contact;
  if (s.rol === "proprietar") {
    const p = s.proprietate || {};
    const grupuri = grupeazaDotari(p.dotari || []);
    continut += `
    <div class="panou sectiune-formular">
      <h3>Proprietatea propusă</h3>
      <table class="tabel-spec">
        ${randCaract("Dorește", p.tranzactie === "inchiriere" ? "Închiriere" : "Vânzare")}
        ${randCaract("Tip", etichetaTip(p.tip))}
        ${randCaract("Localizare", [p.oras, p.zona].filter(Boolean).join(", "))}
        ${randCaract("Strada", p.adresa)}
        ${randCaract("Preț dorit", p.pret_eur ? `${p.pret_eur.toLocaleString("ro-RO")} €${p.tranzactie === "inchiriere" ? " / lună" : ""}${p.negociabil ? " (negociabil)" : ""}` : null)}
      </table>
    </div>
    <div class="panou sectiune-formular">
      <h3>Caracteristici</h3>
      <table class="tabel-spec">
        ${randCaract("Suprafață", p.suprafata_mp ? p.suprafata_mp + " mp" : null)}${randCaract("Camere", p.camere)}${randCaract("Băi", p.bai)}
        ${randCaract("Etaj", p.etaj !== null && p.etaj !== undefined ? `${p.etaj}${p.etaje_total ? " / " + p.etaje_total : ""}` : null)}
        ${randCaract("An construcție", p.an_constructie)}${randCaract("Compartimentare", p.compartimentare ? etichetaCompartimentare(p.compartimentare) : null)}
        ${randCaract("Certificat energetic", p.certificat_energetic ? "Clasa " + p.certificat_energetic : null)}
      </table>
    </div>
    <div class="panou sectiune-formular">
      <h3>Dotări</h3>
      ${grupuri.length ? grupuri.map(g => `<div class="dotari-grup"><h4>${g.titlu}</h4><div class="dotari-lista">${g.elemente.map(d => `<span class="dotare">${escapeHtml(d)}</span>`).join("")}</div></div>`).join("") : '<p class="nota-camp">Nicio dotare bifată.</p>'}
      ${p.dotari_altele ? `<p class="nota-camp" style="margin-top:12px"><b>Altele:</b> ${escapeHtml(p.dotari_altele)}</p>` : ""}
    </div>
    <div class="panou sectiune-formular">
      <h3>Descrierea proprietarului</h3>
      <p style="font-size:14.5px; color:var(--text-secundar); white-space:pre-line">${p.descriere ? escapeHtml(p.descriere) : "Fără descriere."}</p>
    </div>
    <div class="panou sectiune-formular">
      <h3>Fotografii (${(p.poze || []).length})</h3>
      ${(p.poze || []).length ? `<div class="poze-grila">${p.poze.map((u, i) => `<div class="poza-item"><img src="${u}" alt="Fotografie ${i + 1}"></div>`).join("")}</div>` : '<p class="nota-camp">Proprietarul nu a trimis fotografii.</p>'}
    </div>`;
  } else {
    const c = s.cautare || {};
    continut += `
    <div class="panou sectiune-formular">
      <h3>Ce caută</h3>
      <table class="tabel-spec">
        ${randCaract("Dorește să", c.tranzactie === "inchiriere" ? "Închirieze" : "Cumpere")}
        ${randCaract("Tip", etichetaTip(c.tip))}${randCaract("Zone preferate", c.zone)}
        ${randCaract("Camere minim", c.camere_min)}${randCaract("Buget maxim", c.buget_max_eur ? c.buget_max_eur.toLocaleString("ro-RO") + " €" : null)}
      </table>
    </div>
    <div class="panou sectiune-formular">
      <h3>Detalii</h3>
      <p style="font-size:14.5px; color:var(--text-secundar); white-space:pre-line">${c.mesaj ? escapeHtml(c.mesaj) : "Fără detalii suplimentare."}</p>
    </div>`;
  }
  document.getElementById("solicitare-continut").innerHTML = continut;

  // Panoul de acțiuni
  let actiuni = `<div class="panou"><h3>Status</h3><p><span class="insigna-admin sol-${s.status}">${STATUS_SOLICITARE[s.status] || s.status}</span></p>`;
  if (s.ref_proprietate) actiuni += `<p class="nota-camp">Publicată ca <a href="proprietate.html?id=${s.ref_proprietate}" target="_blank" rel="noopener" style="font-weight:700; color:var(--accent-inchis)">${s.ref_proprietate}</a> pe ${s.tratat_la || ""}.</p>`;
  actiuni += `<div class="rail-actiuni">`;
  if (s.rol === "proprietar") {
    if (s.status !== "aprobata") actiuni += `<button class="buton-principal" type="button" data-act="aproba">Aprobă și publică</button>`;
    if (s.status === "noua") actiuni += `<button class="buton-secundar" type="button" data-act="respinge">Respinge</button>`;
  } else {
    if (s.status === "noua") actiuni += `<button class="buton-principal" type="button" data-act="trateaza">Marchează ca tratată</button>`;
  }
  if (s.status !== "noua") actiuni += `<button class="buton-secundar" type="button" data-act="redeschide">Marchează ca nouă</button>`;
  actiuni += `<button class="buton-pericol" type="button" data-act="sterge">Șterge solicitarea</button></div></div>`;
  actiuni += `<div class="panou"><h3>Contact rapid</h3><div class="rail-actiuni" style="margin-top:0; padding-top:0; border:0">
      <a class="buton-secundar" style="text-align:center" href="tel:${encodeURIComponent(s.contact.telefon || "")}">Sună: ${escapeHtml(s.contact.telefon || "-")}</a>
      ${s.contact.email ? `<a class="buton-secundar" style="text-align:center" href="mailto:${encodeURIComponent(s.contact.email)}">Scrie email</a>` : ""}
    </div></div>`;
  const zonaActiuni = document.getElementById("solicitare-actiuni");
  zonaActiuni.innerHTML = actiuni;
  zonaActiuni.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => {
    const act = b.dataset.act;
    if (act === "aproba") { deschideFormularDinSolicitare(s); return; }
    if (act === "respinge") { s.status = "respinsa"; s.tratat_la = azi(); }
    if (act === "trateaza") { s.status = "tratata"; s.tratat_la = azi(); }
    if (act === "redeschide") { s.status = "noua"; s.tratat_la = null; }
    if (act === "sterge") { cereStergerea("solicitare", s.id, `Solicitarea ${s.id} de la ${s.contact.nume} dispare definitiv.`); return; }
    scrieSigur(CHEIE_SOLICITARI, solicitari);
    actualizeazaContoare();
    deschideSolicitare(s.id);
  }));
  arataVederea("vedere-solicitare");
}
document.getElementById("buton-solicitare-inapoi").addEventListener("click", () => { arataVederea("vedere-solicitari"); randeazaTabelSolicitari(); });

// ============================================================
// BLOG
// ============================================================
function genereazaSlug(titlu) {
  const harta = { "ă": "a", "â": "a", "î": "i", "ș": "s", "ş": "s", "ț": "t", "ţ": "t" };
  let s = titlu.toLowerCase().replace(/[ăâîșşțţ]/g, c => harta[c] || c)
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);
  let unic = s, n = 2;
  while (articole.some(a => a.slug === unic && a.slug !== slugInEditare)) { unic = `${s}-${n}`; n++; }
  return unic;
}

function randeazaTabelBlog() {
  const lista = [...articole].sort((x, y) => (y.publicat_la || y.actualizat_la || "").localeCompare(x.publicat_la || x.actualizat_la || ""));
  const publicate = lista.filter(a => a.status === "publicat").length;
  document.getElementById("blog-contor").textContent =
    `${lista.length} articole (${publicate} publicate, ${lista.length - publicate} ciorne)`;
  document.getElementById("blog-tbody").innerHTML = lista.map(a => `
    <tr>
      <td><img class="tabel-foto" src="${a.imagine_url || ""}" alt=""></td>
      <td class="tabel-titlu">${escapeHtml(a.titlu)}</td>
      <td><span class="insigna-admin ${a.status === "publicat" ? "publicat" : "ciorna"}">${a.status === "publicat" ? "Publicat" : "Ciornă"}</span></td>
      <td>${a.publicat_la || "-"}</td>
      <td class="col-actiuni">
        ${a.status === "publicat" ? `<a class="actiune" href="articol.html?slug=${a.slug}" target="_blank" rel="noopener">Vezi</a>` : ""}
        <button class="actiune" data-articol-editeaza="${a.slug}" type="button">Editează</button>
        <button class="actiune sterge" data-articol-sterge="${a.slug}" type="button">Șterge</button>
      </td>
    </tr>`).join("");
  document.querySelectorAll("[data-articol-editeaza]").forEach(b => b.addEventListener("click", () => deschideFormularArticol(b.dataset.articolEditeaza)));
  document.querySelectorAll("[data-articol-sterge]").forEach(b => b.addEventListener("click", () => {
    const a = articole.find(x => x.slug === b.dataset.articolSterge);
    cereStergerea("articol", a.slug, `Articolul „${a.titlu}" dispare definitiv, inclusiv de pe site dacă e publicat.`);
  }));
}

function deschideFormularArticol(slug) {
  slugInEditare = slug || null;
  const a = slug ? articole.find(x => x.slug === slug) : null;
  document.getElementById("articol-formular-titlu").textContent = a ? "Editare articol" : "Articol nou";
  document.getElementById("articol-formular-slug").textContent = a ? `Adresă: articol.html?slug=${a.slug}` : "Adresa articolului se generează automat din titlu";
  document.getElementById("fa-titlu").value = a ? a.titlu : "";
  document.getElementById("fa-imagine").value = a ? (a.imagine_url || "") : "";
  document.getElementById("fa-status").value = a ? a.status : "ciorna";
  document.getElementById("fa-rezumat").value = a ? (a.rezumat || "") : "";
  document.getElementById("fa-continut").value = a ? (a.continut || "") : "";
  previzualizeazaImagineArticol();
  arataVederea("vedere-formular-articol");
}

function inchideFormularArticol() { arataVederea("vedere-blog"); randeazaTabelBlog(); }

function previzualizeazaImagineArticol() {
  const u = document.getElementById("fa-imagine").value.trim();
  document.getElementById("fa-imagine-previzualizare").innerHTML =
    u ? `<img src="${u}" alt="" onerror="this.style.opacity=.25">` : "";
}
document.getElementById("fa-imagine").addEventListener("input", previzualizeazaImagineArticol);

document.getElementById("buton-articol-nou").addEventListener("click", () => deschideFormularArticol(null));
document.getElementById("buton-articol-inapoi").addEventListener("click", inchideFormularArticol);
document.getElementById("buton-articol-renunta").addEventListener("click", inchideFormularArticol);

document.getElementById("formular-articol").addEventListener("submit", e => {
  e.preventDefault();
  const a = slugInEditare ? articole.find(x => x.slug === slugInEditare) : {};
  a.titlu = document.getElementById("fa-titlu").value.trim();
  if (!slugInEditare) a.slug = genereazaSlug(a.titlu);
  a.imagine_url = document.getElementById("fa-imagine").value.trim() || null;
  a.rezumat = document.getElementById("fa-rezumat").value.trim();
  a.continut = document.getElementById("fa-continut").value;
  const statusNou = document.getElementById("fa-status").value;
  if (statusNou === "publicat" && a.status !== "publicat") a.publicat_la = azi();
  if (statusNou === "ciorna") a.publicat_la = null;
  a.status = statusNou;
  a.actualizat_la = azi();
  if (!slugInEditare) articole.unshift(a);
  scrieSigur(CHEIE_ARTICOLE, articole);
  actualizeazaContoare();
  inchideFormularArticol();
});

// ============================================================
// SERVICII
// ============================================================
function serviciiOrdonate() {
  return [...servicii].sort((x, y) => x.ordine - y.ordine);
}

function randeazaTabelServicii() {
  const lista = serviciiOrdonate();
  document.getElementById("servicii-contor").textContent =
    `${lista.length} servicii pe pagina publică`;
  document.getElementById("servicii-tbody").innerHTML = lista.map((s, i) => `
    <tr>
      <td class="tabel-ref">
        <button class="actiune" data-muta-sus="${s.id}" type="button" ${i === 0 ? "disabled" : ""} aria-label="Mută mai sus">↑</button>
        <button class="actiune" data-muta-jos="${s.id}" type="button" ${i === lista.length - 1 ? "disabled" : ""} aria-label="Mută mai jos">↓</button>
      </td>
      <td class="tabel-titlu">${escapeHtml(s.titlu)}<div class="tabel-descriere">${escapeHtml(s.descriere || "")}</div></td>
      <td>${s.evidentiat ? '<span class="insigna-admin evidentiat">Evidențiat</span>' : '<span class="insigna-admin ciorna">Card standard</span>'}</td>
      <td class="col-actiuni">
        <button class="actiune" data-serviciu-editeaza="${s.id}" type="button">Editează</button>
        <button class="actiune sterge" data-serviciu-sterge="${s.id}" type="button">Șterge</button>
      </td>
    </tr>`).join("");

  const muta = (id, directie) => {
    const lista = serviciiOrdonate();
    const i = lista.findIndex(x => x.id === id);
    const j = i + directie;
    if (j < 0 || j >= lista.length) return;
    const a = lista[i], b = lista[j];
    const t = a.ordine; a.ordine = b.ordine; b.ordine = t;
    scrieSigur(CHEIE_SERVICII, servicii);
    randeazaTabelServicii();
  };
  document.querySelectorAll("[data-muta-sus]").forEach(b => b.addEventListener("click", () => muta(parseInt(b.dataset.mutaSus, 10), -1)));
  document.querySelectorAll("[data-muta-jos]").forEach(b => b.addEventListener("click", () => muta(parseInt(b.dataset.mutaJos, 10), 1)));
  document.querySelectorAll("[data-serviciu-editeaza]").forEach(b => b.addEventListener("click", () => deschideFormularServiciu(parseInt(b.dataset.serviciuEditeaza, 10))));
  document.querySelectorAll("[data-serviciu-sterge]").forEach(b => b.addEventListener("click", () => {
    const s = servicii.find(x => x.id === parseInt(b.dataset.serviciuSterge, 10));
    cereStergerea("serviciu", s.id, `Serviciul „${s.titlu}" dispare de pe pagina publică de servicii.`);
  }));
}

function deschideFormularServiciu(id) {
  serviciuInEditare = id || null;
  const s = id ? servicii.find(x => x.id === id) : null;
  document.getElementById("serviciu-formular-titlu").textContent = s ? "Editare serviciu" : "Serviciu nou";
  document.getElementById("fs-titlu").value = s ? s.titlu : "";
  document.getElementById("fs-descriere").value = s ? (s.descriere || "") : "";
  document.getElementById("fs-evidentiat").checked = s ? !!s.evidentiat : false;
  arataVederea("vedere-formular-serviciu");
}

function inchideFormularServiciu() { arataVederea("vedere-servicii"); randeazaTabelServicii(); }

document.getElementById("buton-serviciu-nou").addEventListener("click", () => deschideFormularServiciu(null));
document.getElementById("buton-serviciu-inapoi").addEventListener("click", inchideFormularServiciu);
document.getElementById("buton-serviciu-renunta").addEventListener("click", inchideFormularServiciu);

document.getElementById("formular-serviciu").addEventListener("submit", e => {
  e.preventDefault();
  const s = serviciuInEditare ? servicii.find(x => x.id === serviciuInEditare)
    : { id: servicii.reduce((m, x) => Math.max(m, x.id), 0) + 1, ordine: servicii.reduce((m, x) => Math.max(m, x.ordine), 0) + 1 };
  s.titlu = document.getElementById("fs-titlu").value.trim();
  s.descriere = document.getElementById("fs-descriere").value.trim();
  s.evidentiat = document.getElementById("fs-evidentiat").checked;
  s.actualizat_la = azi();
  if (!serviciuInEditare) servicii.push(s);
  scrieSigur(CHEIE_SERVICII, servicii);
  actualizeazaContoare();
  inchideFormularServiciu();
});

arataEcran();
