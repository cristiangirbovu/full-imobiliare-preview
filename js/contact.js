// FULL IMOBILIARE — contact.js: cele două solicitări predefinite (proprietar / căutător).
// O solicitare de proprietar NU devine proprietate publică: ajunge în admin, la „Solicitări",
// și e publicată doar după aprobare. În mediul de demonstrație solicitările se salvează în
// localStorage (cheia `fi_solicitari`, partajată cu admin.html); la integrare, `trimiteSolicitare`
// se rescrie pe Supabase (insert în `solicitari` + upload poze în Storage + email de notificare).
(function () {
  const CHEIE_SOLICITARI = "fi_solicitari";

  function citesteSolicitari() {
    try { const s = localStorage.getItem(CHEIE_SOLICITARI); if (s) return JSON.parse(s); } catch (e) {}
    return (typeof SOLICITARI !== "undefined") ? SOLICITARI : [];
  }
  function idNou(lista) {
    const max = lista.reduce((m, s) => Math.max(m, parseInt(String(s.id || "").replace("SL-", ""), 10) || 0), 1000);
    return "SL-" + (max + 1);
  }
  // Punctul unic de rescriere pe Supabase.
  function trimiteSolicitare(solicitare) {
    const lista = citesteSolicitari();
    solicitare.id = idNou(lista);
    lista.push(solicitare);
    localStorage.setItem(CHEIE_SOLICITARI, JSON.stringify(lista));   // aruncă QuotaExceededError dacă pozele sunt prea mari
    return solicitare.id;
  }

  const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
  const numar = id => { const v = val(id); return v === "" ? null : Number(v); };

  // ===== Comutatorul de rol =====
  const carduri = [...document.querySelectorAll(".rol-card")];
  const sectiuni = { proprietar: document.getElementById("sectiune-proprietar"), cautator: document.getElementById("sectiune-cautator") };
  function alegeRol(rol, actualizeazaUrl) {
    if (!sectiuni[rol]) rol = "proprietar";
    carduri.forEach(c => { const activ = c.dataset.rol === rol; c.classList.toggle("activ", activ); c.setAttribute("aria-selected", activ ? "true" : "false"); });
    Object.keys(sectiuni).forEach(k => { sectiuni[k].hidden = k !== rol; });
    if (actualizeazaUrl) { const u = new URL(location.href); u.searchParams.set("rol", rol); history.replaceState(null, "", u); }
  }
  carduri.forEach(c => c.addEventListener("click", () => alegeRol(c.dataset.rol, true)));
  alegeRol(new URLSearchParams(location.search).get("rol") || (location.hash === "#cautator" ? "cautator" : "proprietar"), false);

  // ===== Formularul proprietarului =====
  const fp = document.getElementById("formular-proprietar");
  const tipSel = document.getElementById("p-tip"), bife = document.getElementById("p-dotari");
  randeazaBife(bife, tipSel.value, []);
  tipSel.addEventListener("change", () => randeazaBife(bife, tipSel.value, citesteBife(bife)));
  const poze = ManagerPoze(document.getElementById("p-poze"));

  function arataSucces(panou, id, text) {
    const form = panou.querySelector("form");
    form.hidden = true;
    const s = document.createElement("div");
    s.className = "succes";
    s.innerHTML = `<h3>Solicitarea a fost trimisă. Mulțumim!</h3><p>${text}</p><span class="ref-solicitare">REFERINȚĂ ${id}</span>
      <p style="margin-top:14px; font-size:13.5px">Mediu de demonstrație: solicitarea a ajuns în panoul de administrare, secțiunea „Solicitări". La integrare, echipa primește și un email de notificare.</p>`;
    form.after(s);
    s.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  fp.addEventListener("submit", e => {
    e.preventDefault();
    const eroare = document.getElementById("p-eroare");
    eroare.hidden = true;
    const solicitare = {
      rol: "proprietar", status: "noua", creat_la: new Date().toISOString().slice(0, 19),
      contact: { nume: val("p-nume"), telefon: val("p-telefon"), email: val("p-email") },
      proprietate: {
        tranzactie: val("p-tranzactie"), tip: val("p-tip"), oras: val("p-oras"), zona: val("p-zona"), adresa: val("p-adresa"),
        pret_eur: numar("p-pret"), negociabil: document.getElementById("p-negociabil").checked,
        suprafata_mp: numar("p-suprafata"), camere: numar("p-camere"), bai: numar("p-bai"), etaj: numar("p-etaj"), etaje_total: numar("p-etaje"),
        an_constructie: numar("p-an"), compartimentare: val("p-compartimentare"), certificat_energetic: val("p-certificat"),
        dotari: citesteBife(bife), dotari_altele: val("p-dotari-altele"), descriere: val("p-descriere"), poze: poze.poze
      }
    };
    try {
      const id = trimiteSolicitare(solicitare);
      arataSucces(sectiuni.proprietar, id, "Un consultant Full Imobiliare te sună în cel mai scurt timp pentru a verifica detaliile. Proprietatea se publică doar după această discuție.");
    } catch (err) {
      eroare.textContent = "Fotografiile depășesc spațiul disponibil în mediul de demonstrație. Elimină câteva și încearcă din nou.";
      eroare.hidden = false;
    }
  });

  // ===== Formularul căutătorului =====
  const fc = document.getElementById("formular-cautator");
  // Venit de pe o proprietate („Programează o vizionare"): preumplem mesajul cu referința.
  const refViz = new URLSearchParams(location.search).get("ref");
  if (refViz && /^FI-\d+$/.test(refViz)) {
    const mesaj = document.getElementById("c-mesaj");
    if (mesaj && !mesaj.value) mesaj.value = `Aș dori să programez o vizionare pentru proprietatea ${refViz}.`;
  }
  fc.addEventListener("submit", e => {
    e.preventDefault();
    const solicitare = {
      rol: "cautator", status: "noua", creat_la: new Date().toISOString().slice(0, 19),
      contact: { nume: val("c-nume"), telefon: val("c-telefon"), email: val("c-email") },
      cautare: { tranzactie: val("c-tranzactie"), tip: val("c-tip"), zone: val("c-zone"), camere_min: numar("c-camere"), buget_max_eur: numar("c-buget"), mesaj: val("c-mesaj") }
    };
    const id = trimiteSolicitare(solicitare);
    arataSucces(sectiuni.cautator, id, "Un consultant Full Imobiliare te contactează cu primele propuneri potrivite căutării tale.");
  });
})();
