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

// Pagina de servicii: cardul evidențiat primul (lățime totală), restul în ordinea setată din admin.
function randeazaServicii() {
  const el = document.getElementById("lista-servicii");
  if (!el) return;
  const lista = [...DATE_SERVICII].sort((x, y) => (x.evidentiat === y.evidentiat) ? x.ordine - y.ordine : (x.evidentiat ? -1 : 1));
  el.innerHTML = lista.map(s => `
    <div class="card-serviciu ${s.evidentiat ? "evidentiat" : ""}">
      <h3>${s.titlu}</h3><p>${s.descriere || ""}</p>
    </div>`).join("");
}

function formatPret(a) {
  const pret = a.pret_eur.toLocaleString("ro-RO");
  return a.tranzactie === "inchiriere" ? `${pret} € / lună` : `${pret} €`;
}

function insigne(a) {
  let html = `<span class="insigna ${a.tranzactie === "inchiriere" ? "inchiriere" : ""}">${a.tranzactie === "inchiriere" ? "De închiriat" : "De vânzare"}</span>`;
  if (a.status === "rezervat") html += `<span class="insigna rezervat">Rezervat</span>`;
  if (a.status === "vandut") html += `<span class="insigna vandut">Vândut</span>`;
  return html;
}

function cardAnunt(a, index) {
  const spec = [
    a.camere ? `${a.camere} camere` : null,
    a.suprafata_mp ? `${a.suprafata_mp} mp` : null,
    a.etaj !== null && a.etaj !== undefined ? `etaj ${a.etaj}/${a.etaje_total}` : (a.etaje_total ? `P+${a.etaje_total - 1}` : null)
  ].filter(Boolean).map(s => `<span>${s}</span>`).join("");
  return `<a class="card-anunt" style="--i:${index || 0}" href="proprietate.html?id=${a.id_intern}">
    <div class="card-foto"><img src="${a.poze[0]}" alt="${a.titlu}"><div class="insigne">${insigne(a)}</div></div>
    <div class="card-corp">
      <div class="card-pret">${formatPret(a)}${a.negociabil ? '<span class="negociabil">negociabil</span>' : ""}</div>
      <div class="card-titlu">${a.titlu}</div>
      <div class="card-zona">${a.oras} · ${a.zona}</div>
      <div class="card-specificatii">${spec}</div>
      <div class="card-id">REF: ${a.id_intern}</div>
    </div>
  </a>`;
}

// Acasă: cele mai recente 3 proprietăți active
function randeazaRecente(idElement) {
  const el = document.getElementById(idElement);
  if (!el) return;
  const recente = DATE_ANUNTURI.filter(a => a.status !== "vandut")
    .sort((x, y) => y.publicat_la.localeCompare(x.publicat_la)).slice(0, 3);
  el.innerHTML = recente.map(cardAnunt).join("");
}

// Proprietăți: filtre + sortare
function randeazaLista() {
  const el = document.getElementById("lista-anunturi");
  if (!el) return;
  const v = id => document.getElementById(id) ? document.getElementById(id).value : "";
  const tranzactie = v("f-tranzactie"), tip = v("f-tip"), camere = v("f-camere"),
        zona = v("f-zona"), pret = v("f-pret"), sortare = v("f-sortare");

  let lista = DATE_ANUNTURI.filter(a => {
    if (tranzactie && a.tranzactie !== tranzactie) return false;
    if (tip && a.tip !== tip) return false;
    if (camere && a.camere < parseInt(camere)) return false;
    if (zona && a.zona !== zona) return false;
    if (pret) {
      const [min, max] = pret.split("-").map(Number);
      if (a.pret_eur < min || (max && a.pret_eur > max)) return false;
    }
    return true;
  });

  if (sortare === "pret-crescator") lista.sort((x, y) => x.pret_eur - y.pret_eur);
  else if (sortare === "pret-descrescator") lista.sort((x, y) => y.pret_eur - x.pret_eur);
  else lista.sort((x, y) => y.publicat_la.localeCompare(x.publicat_la));

  document.getElementById("rezultate-info").textContent =
    lista.length === 1 ? "1 proprietate găsită" : `${lista.length} proprietăți găsite`;
  el.innerHTML = lista.length ? lista.map(cardAnunt).join("")
    : `<p style="color:var(--text-secundar)">Nicio proprietate nu corespunde filtrelor alese.</p>`;
}

function populeazaZone() {
  const sel = document.getElementById("f-zona");
  if (!sel) return;
  [...new Set(DATE_ANUNTURI.map(a => a.zona))].sort().forEach(z => {
    const o = document.createElement("option"); o.value = z; o.textContent = z; sel.appendChild(o);
  });
}

// Pagina proprietății
function randeazaDetaliu() {
  const radacina = document.getElementById("detaliu-anunt");
  if (!radacina) return;
  const id = new URLSearchParams(location.search).get("id") || "FI-1001";
  const a = DATE_ANUNTURI.find(x => x.id_intern === id) || DATE_ANUNTURI[0];
  document.title = `${a.titlu} | Full Imobiliare`;

  document.getElementById("d-titlu").textContent = a.titlu;
  document.getElementById("d-meta").textContent =
    `${a.oras}, ${a.zona} · publicat ${a.publicat_la}`;
  const ref = document.getElementById("d-ref");
  if (ref) ref.textContent = `REF ${a.id_intern}`;
  document.getElementById("d-insigne").innerHTML = insigne(a);
  document.getElementById("d-pret").innerHTML =
    `${formatPret(a)}${a.negociabil ? ' <span style="font-size:13px;color:var(--text-secundar)">negociabil</span>' : ""}`;
  document.getElementById("d-foto").src = a.poze[0];
  document.getElementById("d-mini").innerHTML =
    a.poze.map(p => `<img src="${p}" onclick="schimbaFotoPrincipala('${p}')" alt="Miniatură ${a.titlu}">`).join("");
  document.getElementById("d-descriere").textContent = a.descriere;
  document.getElementById("d-agent").textContent = `${a.agent_nume} · ${a.agent_telefon}`;

  const rand = (eticheta, valoare) => valoare === null || valoare === undefined || valoare === "" ? "" :
    `<tr><td>${eticheta}</td><td><b>${valoare}</b></td></tr>`;
  document.getElementById("d-spec").innerHTML =
    rand("Tip proprietate", etichetaTip(a.tip)) + rand("Tranzacție", a.tranzactie === "inchiriere" ? "Închiriere" : "Vânzare") +
    rand(a.tip === "teren" ? "Suprafață teren" : "Suprafață utilă", a.suprafata_mp ? a.suprafata_mp + " mp" : null) +
    rand("Camere", a.camere) + rand("Băi", a.bai) +
    rand("Etaj", a.etaj !== null && a.etaj !== undefined ? `${a.etaj} / ${a.etaje_total}` : null) +
    rand("An construcție", a.an_constructie) + rand("Compartimentare", a.compartimentare ? etichetaCompartimentare(a.compartimentare) : null) +
    rand("Certificat energetic", a.certificat_energetic ? "Clasa " + a.certificat_energetic : null);
  // Dotările: bifele grupate pe categorii + textul liber „Altele" din admin.
  const grupuri = grupeazaDotari(a.dotari || []);
  if (a.dotari_altele) {
    const altele = grupuri.find(g => g.titlu === "Altele") || (grupuri.push({ titlu: "Altele", elemente: [] }), grupuri[grupuri.length - 1]);
    a.dotari_altele.split(",").map(s => s.trim()).filter(Boolean).forEach(s => altele.elemente.push(s));
  }
  document.getElementById("d-dotari").innerHTML = grupuri.length ? grupuri.map(g => `
    <div class="dotari-grup"><h4>${g.titlu}</h4><div class="dotari-lista">${g.elemente.map(d => `<span class="dotare">${escapeHtml(d)}</span>`).join("")}</div></div>`).join("")
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
  // Conținut: paragrafe separate prin linie goală; liniile care încep cu "## " devin subtitluri.
  document.getElementById("a-continut").innerHTML = (a.continut || "").split(/\n\s*\n/).map(bloc => {
    const b = bloc.trim();
    if (!b) return "";
    if (b.startsWith("## ")) {
      const linii = b.split("\n");
      const titlu = `<h2>${linii[0].slice(3)}</h2>`;
      const rest = linii.slice(1).join(" ").trim();
      return titlu + (rest ? `<p>${rest}</p>` : "");
    }
    return `<p>${b.replace(/\n/g, " ")}</p>`;
  }).join("");
}

// Schimbarea pozei principale: crossfade cu blur ca să mascheze tranziția între două imagini.
// Imaginea nouă se preîncarcă; blur-ul se ridică abia după ce e gata, deci nu există cadru gol.
function schimbaFotoPrincipala(src) {
  const foto = document.getElementById("d-foto");
  if (!foto || foto.src.endsWith(src)) return;
  foto.classList.add("se-schimba");
  const noua = new Image();
  noua.onload = () => {
    foto.src = src;
    requestAnimationFrame(() => requestAnimationFrame(() => foto.classList.remove("se-schimba")));
  };
  noua.src = src;
}

document.addEventListener("DOMContentLoaded", () => {
  randeazaRecente("anunturi-recente");
  populeazaZone();
  // Căutarea din hero ajunge aici prin GET (?tranzactie=&tip=): preumplem filtrele înainte de prima randare.
  const params = new URLSearchParams(location.search);
  [["tranzactie", "f-tranzactie"], ["tip", "f-tip"], ["zona", "f-zona"]].forEach(([p, id]) => {
    const el = document.getElementById(id), v = params.get(p);
    if (el && v && [...el.options].some(o => o.value === v)) el.value = v;
  });
  randeazaLista();
  randeazaDetaliu();
  randeazaBlog();
  randeazaArticol();
  randeazaServicii();
  document.querySelectorAll(".bara-filtre select").forEach(s => s.addEventListener("change", randeazaLista));

  // Apariție la scroll: IntersectionObserver (fără scroll listener); CSS-ul respectă prefers-reduced-motion.
  const observator = new IntersectionObserver(intrari => {
    intrari.forEach(i => {
      if (i.isIntersecting) { i.target.classList.add("vizibil"); observator.unobserve(i.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".aparitie").forEach(el => observator.observe(el));
});
