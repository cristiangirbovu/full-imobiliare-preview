// FULL IMOBILIARE — admin.js (v2: bară laterală + Anunțuri / Blog / Servicii)
// Stratul de date: localStorage, cu EXACT aceeași formă ca schema Supabase (schema.sql).
// La integrare, funcțiile api* se rescriu pe clientul Supabase; interfața rămâne neschimbată.

const CHEIE_DATE = "fi_anunturi";
const CHEIE_ARTICOLE = "fi_articole";
const CHEIE_SERVICII = "fi_servicii";
const CHEIE_SESIUNE = "fi_sesiune";
const CONT_DEMO = { email: "admin@fullimobiliare.ro", parola: "demo2026" };

// ===== Stratul de date (adaptoare demo) =====
function citeste(cheie, seed) {
  try { const s = localStorage.getItem(cheie); if (s) return JSON.parse(s); } catch (e) {}
  return JSON.parse(JSON.stringify(seed));
}
function scrie(cheie, lista) { try { localStorage.setItem(cheie, JSON.stringify(lista)); } catch (e) {} }

let anunturi = citeste(CHEIE_DATE, ANUNTURI);
let articole = citeste(CHEIE_ARTICOLE, typeof ARTICOLE !== "undefined" ? ARTICOLE : []);
let servicii = citeste(CHEIE_SERVICII, typeof SERVICII !== "undefined" ? SERVICII : []);
let refInEditare = null;
let slugInEditare = null;
let serviciuInEditare = null;

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
const VEDERI = ["vedere-lista", "vedere-formular", "vedere-blog", "vedere-formular-articol", "vedere-servicii", "vedere-formular-serviciu"];
function arataVederea(id) {
  VEDERI.forEach(v => { const el = document.getElementById(v); if (el) el.hidden = (v !== id); });
  document.getElementById("nav-anunturi").classList.toggle("activ", id.startsWith("vedere-lista") || id === "vedere-formular");
  document.getElementById("nav-blog").classList.toggle("activ", id === "vedere-blog" || id === "vedere-formular-articol");
  document.getElementById("nav-servicii").classList.toggle("activ", id === "vedere-servicii" || id === "vedere-formular-serviciu");
  window.scrollTo({ top: 0 });
}
document.getElementById("nav-anunturi").addEventListener("click", () => { arataVederea("vedere-lista"); randeazaTabel(); });
document.getElementById("nav-blog").addEventListener("click", () => { arataVederea("vedere-blog"); randeazaTabelBlog(); });
document.getElementById("nav-servicii").addEventListener("click", () => { arataVederea("vedere-servicii"); randeazaTabelServicii(); });

function actualizeazaContoare() {
  document.getElementById("numar-anunturi").textContent = anunturi.length;
  document.getElementById("numar-articole").textContent = articole.length;
  document.getElementById("numar-servicii").textContent = servicii.length;
}

// ===== Ștergere cu dialog unificat =====
const dialogSterge = document.getElementById("dialog-sterge");
let tintaStergere = null;   // { tip: "anunt" | "articol" | "serviciu", id }
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
    scrie(CHEIE_DATE, anunturi); randeazaTabel();
  } else if (tintaStergere.tip === "articol") {
    articole = articole.filter(x => x.slug !== tintaStergere.id);
    scrie(CHEIE_ARTICOLE, articole); randeazaTabelBlog();
  } else if (tintaStergere.tip === "serviciu") {
    servicii = servicii.filter(x => x.id !== tintaStergere.id);
    scrie(CHEIE_SERVICII, servicii); randeazaTabelServicii();
  }
  tintaStergere = null;
  actualizeazaContoare();
  dialogSterge.close();
});

// ============================================================
// ANUNȚURI
// ============================================================
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

  document.getElementById("admin-contor").textContent = `${lista.length} din ${anunturi.length} anunțuri`;
  document.getElementById("admin-tbody").innerHTML = lista.map(a => `
    <tr>
      <td class="tabel-ref">${a.id_intern}</td>
      <td><img class="tabel-foto" src="${(a.poze && a.poze[0]) || ""}" alt=""></td>
      <td class="tabel-titlu">${a.titlu}<div class="tabel-descriere">${a.tranzactie === "inchiriere" ? "Închiriere" : "Vânzare"} · ${a.tip}</div></td>
      <td>${a.oras}, ${a.zona}</td>
      <td class="tabel-pret">${formatPretAdmin(a)}</td>
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

  document.querySelectorAll(".select-status").forEach(sel => sel.addEventListener("change", e => {
    const a = anunturi.find(x => x.id_intern === e.target.dataset.ref);
    a.status = e.target.value;
    a.vandut_la = a.status === "vandut" ? new Date().toISOString().slice(0, 10) : null;
    a.actualizat_la = new Date().toISOString().slice(0, 10);
    scrie(CHEIE_DATE, anunturi);
    randeazaTabel();
  }));
  document.querySelectorAll("[data-editeaza]").forEach(b => b.addEventListener("click", () => deschideFormular(b.dataset.editeaza)));
  document.querySelectorAll("[data-sterge]").forEach(b => b.addEventListener("click", () => {
    const a = anunturi.find(x => x.id_intern === b.dataset.sterge);
    cereStergerea("anunt", a.id_intern, `${a.id_intern} · ${a.titlu}. Anunțul dispare definitiv din listă și de pe site.`);
  }));
}

document.getElementById("admin-cauta").addEventListener("input", randeazaTabel);
document.getElementById("admin-filtru-status").addEventListener("change", randeazaTabel);

document.getElementById("buton-reset").addEventListener("click", () => {
  try { localStorage.removeItem(CHEIE_DATE); localStorage.removeItem(CHEIE_ARTICOLE); localStorage.removeItem(CHEIE_SERVICII); } catch (e) {}
  anunturi = citeste(CHEIE_DATE, ANUNTURI);
  articole = citeste(CHEIE_ARTICOLE, typeof ARTICOLE !== "undefined" ? ARTICOLE : []);
  servicii = citeste(CHEIE_SERVICII, typeof SERVICII !== "undefined" ? SERVICII : []);
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
  v("f-adresa", a ? (a.adresa_harta || "") : "");
  v("f-status", a ? a.status : "activ"); v("f-suprafata", a ? a.suprafata_mp : "");
  v("f-camere", a ? a.camere : ""); v("f-bai", a ? a.bai : "");
  v("f-etaj", a ? a.etaj : ""); v("f-etaje", a ? a.etaje_total : "");
  v("f-an", a ? a.an_constructie : ""); v("f-compartimentare", a ? (a.compartimentare || "") : "");
  v("f-certificat", a ? (a.certificat_energetic || "") : "");
  v("f-dotari", a ? (a.dotari || []).join(", ") : "");
  v("f-descriere", a ? a.descriere : ""); v("f-poze", a ? (a.poze || []).join("\n") : "");
  v("f-agent", a ? a.agent_nume : ""); v("f-agent-tel", a ? a.agent_telefon : "");
  previzualizeazaPoze();
  arataVederea("vedere-formular");
}

function inchideFormular() { arataVederea("vedere-lista"); randeazaTabel(); }

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
  a.oras = text("f-oras"); a.zona = text("f-zona"); a.adresa_harta = text("f-adresa") || null;
  a.status = text("f-status");
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
  scrie(CHEIE_DATE, anunturi);
  actualizeazaContoare();
  inchideFormular();
});

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
      <td class="tabel-titlu">${a.titlu}</td>
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
  const azi = new Date().toISOString().slice(0, 10);
  const a = slugInEditare ? articole.find(x => x.slug === slugInEditare) : {};
  a.titlu = document.getElementById("fa-titlu").value.trim();
  if (!slugInEditare) a.slug = genereazaSlug(a.titlu);
  a.imagine_url = document.getElementById("fa-imagine").value.trim() || null;
  a.rezumat = document.getElementById("fa-rezumat").value.trim();
  a.continut = document.getElementById("fa-continut").value;
  const statusNou = document.getElementById("fa-status").value;
  if (statusNou === "publicat" && a.status !== "publicat") a.publicat_la = azi;
  if (statusNou === "ciorna") a.publicat_la = null;
  a.status = statusNou;
  a.actualizat_la = azi;
  if (!slugInEditare) articole.unshift(a);
  scrie(CHEIE_ARTICOLE, articole);
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
      <td class="tabel-titlu">${s.titlu}<div class="tabel-descriere">${s.descriere || ""}</div></td>
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
    scrie(CHEIE_SERVICII, servicii);
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
  const azi = new Date().toISOString().slice(0, 10);
  const s = serviciuInEditare ? servicii.find(x => x.id === serviciuInEditare)
    : { id: servicii.reduce((m, x) => Math.max(m, x.id), 0) + 1, ordine: servicii.reduce((m, x) => Math.max(m, x.ordine), 0) + 1 };
  s.titlu = document.getElementById("fs-titlu").value.trim();
  s.descriere = document.getElementById("fs-descriere").value.trim();
  s.evidentiat = document.getElementById("fs-evidentiat").checked;
  s.actualizat_la = azi;
  if (!serviciuInEditare) servicii.push(s);
  scrie(CHEIE_SERVICII, servicii);
  actualizeazaContoare();
  inchideFormularServiciu();
});

arataEcran();
