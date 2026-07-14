// FULL IMOBILIARE — app.js: randare anunțuri, filtre, sortare, pagină de detaliu.
// Sursa de date: localStorage (dacă adminul demo a modificat ceva), altfel ANUNTURI (date-demo.js).
// La integrare, această funcție se rescrie pe Supabase; restul interfeței rămâne neschimbat.
const DATE_ANUNTURI = (function () {
  try { const s = localStorage.getItem("fi_anunturi"); if (s) return JSON.parse(s); } catch (e) {}
  return ANUNTURI;
})();

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
  return `<a class="card-anunt" style="--i:${index || 0}" href="anunt.html?id=${a.id_intern}">
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

// Acasă: cele mai recente 3 anunțuri active
function randeazaRecente(idElement) {
  const el = document.getElementById(idElement);
  if (!el) return;
  const recente = DATE_ANUNTURI.filter(a => a.status !== "vandut")
    .sort((x, y) => y.publicat_la.localeCompare(x.publicat_la)).slice(0, 3);
  el.innerHTML = recente.map(cardAnunt).join("");
}

// Anunțuri: filtre + sortare
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
    lista.length === 1 ? "1 anunț găsit" : `${lista.length} anunțuri găsite`;
  el.innerHTML = lista.length ? lista.map(cardAnunt).join("")
    : `<p style="color:var(--text-secundar)">Niciun anunț nu corespunde filtrelor alese.</p>`;
}

function populeazaZone() {
  const sel = document.getElementById("f-zona");
  if (!sel) return;
  [...new Set(DATE_ANUNTURI.map(a => a.zona))].sort().forEach(z => {
    const o = document.createElement("option"); o.value = z; o.textContent = z; sel.appendChild(o);
  });
}

// Pagina de anunț
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
    rand("Tip proprietate", a.tip) + rand("Tranzacție", a.tranzactie) +
    rand("Suprafață utilă", a.suprafata_mp ? a.suprafata_mp + " mp" : null) +
    rand("Camere", a.camere) + rand("Băi", a.bai) +
    rand("Etaj", a.etaj !== null ? `${a.etaj} / ${a.etaje_total}` : null) +
    rand("An construcție", a.an_constructie) + rand("Compartimentare", a.compartimentare) +
    rand("Certificat energetic", a.certificat_energetic ? "Clasa " + a.certificat_energetic : null);
  document.getElementById("d-dotari").innerHTML =
    a.dotari.map(d => `<span class="dotare">${d}</span>`).join("");
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
  randeazaLista();
  randeazaDetaliu();
  document.querySelectorAll(".bara-filtre select").forEach(s => s.addEventListener("change", randeazaLista));

  // Apariție la scroll: IntersectionObserver (fără scroll listener); CSS-ul respectă prefers-reduced-motion.
  const observator = new IntersectionObserver(intrari => {
    intrari.forEach(i => {
      if (i.isIntersecting) { i.target.classList.add("vizibil"); observator.unobserve(i.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".aparitie").forEach(el => observator.observe(el));
});
