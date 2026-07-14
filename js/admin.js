// FULL IMOBILIARE — admin.js (v0, mediu de demonstrație)
// Stratul de date: localStorage, cu EXACT aceeași formă ca schema Supabase (schema.sql).
// La integrare, funcțiile api* se rescriu pe clientul Supabase; interfața rămâne neschimbată.

const CHEIE_DATE = "fi_anunturi";
const CHEIE_SESIUNE = "fi_sesiune";
const CONT_DEMO = { email: "admin@fullimobiliare.ro", parola: "demo2026" };

// ===== Stratul de date (adaptor demo) =====
function apiListeaza() {
  try { const s = localStorage.getItem(CHEIE_DATE); if (s) return JSON.parse(s); } catch (e) {}
  return JSON.parse(JSON.stringify(ANUNTURI));
}
function apiScrie(lista) { localStorage.setItem(CHEIE_DATE, JSON.stringify(lista)); }
function apiReseteaza() { localStorage.removeItem(CHEIE_DATE); }

let anunturi = apiListeaza();
let refInEditare = null;   // null = anunț nou

// ===== Autentificare (demo) =====
function esteAutentificat() { return localStorage.getItem(CHEIE_SESIUNE) === "1"; }

function arataEcran() {
  const logat = esteAutentificat();
  document.getElementById("ecran-login").hidden = logat;
  document.getElementById("ecran-admin").hidden = !logat;
  if (logat) {
    document.getElementById("admin-utilizator").textContent = localStorage.getItem("fi_utilizator") || "";
    randeazaTabel();
  }
}

document.getElementById("formular-login").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("l-email").value.trim().toLowerCase();
  const parola = document.getElementById("l-parola").value;
  if (email === CONT_DEMO.email && parola === CONT_DEMO.parola) {
    localStorage.setItem(CHEIE_SESIUNE, "1");
    localStorage.setItem("fi_utilizator", email);
    document.getElementById("login-eroare").hidden = true;
    arataEcran();
  } else {
    document.getElementById("login-eroare").hidden = false;
  }
});

document.getElementById("buton-iesire").addEventListener("click", () => {
  localStorage.removeItem(CHEIE_SESIUNE);
  localStorage.removeItem("fi_utilizator");
  arataEcran();
});

// ===== Tabelul =====
function formatPretAdmin(a) {
  const pret = a.pret_eur.toLocaleString("ro-RO");
  return a.tranzactie === "inchiriere" ? `${pret} € / lună` : `${pret} €`;
}

function randeazaTabel() {
  const cauta = (document.getElementById("admin-cauta").value || "").toLowerCase();
  const filtruStatus = document.getElementById("admin-filtru-status").value;
  let lista = anunturi.filter(a => {
    if (filtruStatus && a.status !== filtruStatus) return false;
    if (cauta && !(`${a.titlu} ${a.zona} ${a.id_intern}`.toLowerCase().includes(cauta))) return false;
    return true;
  }).sort((x, y) => y.publicat_la.localeCompare(x.publicat_la));

  document.getElementById("admin-contor").textContent =
    `${lista.length} din ${anunturi.length} anunțuri`;

  document.getElementById("admin-tbody").innerHTML = lista.map(a => `
    <tr>
      <td class="tabel-ref">${a.id_intern}</td>
      <td><img class="tabel-foto" src="${(a.poze && a.poze[0]) || ""}" alt=""></td>
      <td class="tabel-titlu">${a.titlu}</td>
      <td>${a.oras}, ${a.zona}</td>
      <td class="tabel-pret">${formatPretAdmin(a)}</td>
      <td>${a.tranzactie === "inchiriere" ? "Închiriere" : "Vânzare"}</td>
      <td>
        <select class="select-status st-${a.status}" data-ref="${a.id_intern}" aria-label="Status ${a.id_intern}">
          <option value="activ" ${a.status === "activ" ? "selected" : ""}>Activ</option>
          <option value="rezervat" ${a.status === "rezervat" ? "selected" : ""}>Rezervat</option>
          <option value="vandut" ${a.status === "vandut" ? "selected" : ""}>Vândut</option>
        </select>
      </td>
      <td>${a.publicat_la}</td>
      <td class="col-actiuni">
        <button class="actiune" data-editeaza="${a.id_intern}" type="button">Editează</button>
        <button class="actiune sterge" data-sterge="${a.id_intern}" type="button">Șterge</button>
      </td>
    </tr>`).join("");

  // Status inline
  document.querySelectorAll(".select-status").forEach(sel => sel.addEventListener("change", e => {
    const a = anunturi.find(x => x.id_intern === e.target.dataset.ref);
    a.status = e.target.value;
    a.vandut_la = a.status === "vandut" ? new Date().toISOString().slice(0, 10) : null;
    a.actualizat_la = new Date().toISOString().slice(0, 10);
    apiScrie(anunturi);
    randeazaTabel();
  }));
  // Editare + ștergere
  document.querySelectorAll("[data-editeaza]").forEach(b => b.addEventListener("click", () => deschideFormular(b.dataset.editeaza)));
  document.querySelectorAll("[data-sterge]").forEach(b => b.addEventListener("click", () => cereStergere(b.dataset.sterge)));
}

document.getElementById("admin-cauta").addEventListener("input", randeazaTabel);
document.getElementById("admin-filtru-status").addEventListener("change", randeazaTabel);

document.getElementById("buton-reset").addEventListener("click", () => {
  apiReseteaza();
  anunturi = apiListeaza();
  randeazaTabel();
});

// ===== Ștergere cu dialog =====
let refDeSters = null;
const dialogSterge = document.getElementById("dialog-sterge");
function cereStergere(ref) {
  refDeSters = ref;
  const a = anunturi.find(x => x.id_intern === ref);
  document.getElementById("dialog-sterge-text").textContent =
    `${a.id_intern} · ${a.titlu}. Anunțul dispare definitiv din listă și de pe site.`;
  dialogSterge.showModal();
}
document.getElementById("dialog-nu").addEventListener("click", () => dialogSterge.close());
document.getElementById("dialog-da").addEventListener("click", () => {
  anunturi = anunturi.filter(x => x.id_intern !== refDeSters);
  apiScrie(anunturi);
  dialogSterge.close();
  randeazaTabel();
});

// ===== Formularul =====
function refNou() {
  const maxim = anunturi.reduce((m, a) => {
    const n = parseInt((a.id_intern || "").replace(/\D/g, ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 1000);
  return `FI-${maxim + 1}`;
}

function deschideFormular(ref) {
  refInEditare = ref || null;
  const a = ref ? anunturi.find(x => x.id_intern === ref) : null;
  document.getElementById("formular-titlu").textContent = a ? "Editare anunț" : "Anunț nou";
  document.getElementById("formular-ref").textContent = a ? `REF ${a.id_intern}` : `REF alocat automat: ${refNou()}`;

  const v = (id, val) => { document.getElementById(id).value = (val === null || val === undefined) ? "" : val; };
  v("f-titlu", a ? a.titlu : ""); v("f-tranzactie", a ? a.tranzactie : "vanzare");
  v("f-tip", a ? a.tip : "apartament"); v("f-pret", a ? a.pret_eur : "");
  document.getElementById("f-negociabil").checked = a ? !!a.negociabil : false;
  v("f-oras", a ? a.oras : "București"); v("f-zona", a ? a.zona : "");
  v("f-status", a ? a.status : "activ"); v("f-suprafata", a ? a.suprafata_mp : "");
  v("f-camere", a ? a.camere : ""); v("f-bai", a ? a.bai : "");
  v("f-etaj", a ? a.etaj : ""); v("f-etaje", a ? a.etaje_total : "");
  v("f-an", a ? a.an_constructie : ""); v("f-compartimentare", a ? (a.compartimentare || "") : "");
  v("f-certificat", a ? (a.certificat_energetic || "") : "");
  v("f-dotari", a ? (a.dotari || []).join(", ") : "");
  v("f-descriere", a ? a.descriere : ""); v("f-poze", a ? (a.poze || []).join("\n") : "");
  v("f-agent", a ? a.agent_nume : ""); v("f-agent-tel", a ? a.agent_telefon : "");
  previzualizeazaPoze();

  document.getElementById("vedere-lista").hidden = true;
  document.getElementById("vedere-formular").hidden = false;
  window.scrollTo({ top: 0 });
}

function inchideFormular() {
  document.getElementById("vedere-formular").hidden = true;
  document.getElementById("vedere-lista").hidden = false;
  randeazaTabel();
}

document.getElementById("buton-nou").addEventListener("click", () => deschideFormular(null));
document.getElementById("buton-inapoi").addEventListener("click", inchideFormular);
document.getElementById("buton-renunta").addEventListener("click", inchideFormular);

function previzualizeazaPoze() {
  const linii = document.getElementById("f-poze").value.split("\n").map(l => l.trim()).filter(Boolean);
  document.getElementById("poze-previzualizare").innerHTML =
    linii.slice(0, 15).map(u => `<img src="${u}" alt="" onerror="this.style.opacity=.25">`).join("");
}
document.getElementById("f-poze").addEventListener("input", previzualizeazaPoze);

document.getElementById("formular-anunt").addEventListener("submit", e => {
  e.preventDefault();
  const numar = id => { const x = document.getElementById(id).value; return x === "" ? null : parseInt(x, 10); };
  const text = id => document.getElementById(id).value.trim();
  const azi = new Date().toISOString().slice(0, 10);

  const a = refInEditare ? anunturi.find(x => x.id_intern === refInEditare) : { id_intern: refNou(), publicat_la: azi };
  a.titlu = text("f-titlu"); a.tranzactie = text("f-tranzactie"); a.tip = text("f-tip");
  a.pret_eur = numar("f-pret"); a.negociabil = document.getElementById("f-negociabil").checked;
  a.oras = text("f-oras"); a.zona = text("f-zona"); a.status = text("f-status");
  a.vandut_la = a.status === "vandut" ? (a.vandut_la || azi) : null;
  a.suprafata_mp = numar("f-suprafata"); a.camere = numar("f-camere"); a.bai = numar("f-bai");
  a.etaj = numar("f-etaj"); a.etaje_total = numar("f-etaje"); a.an_constructie = numar("f-an");
  a.compartimentare = text("f-compartimentare") || null;
  a.certificat_energetic = text("f-certificat") || null;
  a.dotari = text("f-dotari") ? text("f-dotari").split(",").map(d => d.trim()).filter(Boolean) : [];
  a.descriere = text("f-descriere");
  a.poze = text("f-poze") ? text("f-poze").split("\n").map(l => l.trim()).filter(Boolean) : [];
  a.agent_nume = text("f-agent") || null; a.agent_telefon = text("f-agent-tel") || null;
  a.actualizat_la = azi;

  if (!refInEditare) anunturi.unshift(a);
  apiScrie(anunturi);
  inchideFormular();
});

arataEcran();
