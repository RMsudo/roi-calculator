// ---------- helpers ----------
const fmtEUR = (n) => {
  if (!isFinite(n)) return "–";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(n);
};

const fmtNum = (n, d = 0) => {
  if (!isFinite(n)) return "–";
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: d,
    maximumFractionDigits: d
  }).format(n);
};

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

function calcScenario({ visitors, crNow, close, aov, margin, cost }, crNew) {
  const leadsOld = visitors * (crNow / 100);
  const leadsNew = visitors * (crNew / 100);

  const customersOld = leadsOld * (close / 100);
  const customersNew = leadsNew * (close / 100);

  const revenueOld = customersOld * aov;
  const revenueNew = customersNew * aov;

  const profitOld = revenueOld * (margin / 100);
  const profitNew = revenueNew * (margin / 100);

  const deltaProfitMonth = profitNew - profitOld;
  const deltaProfitYear = deltaProfitMonth * 12;

  const roi = (cost > 0) ? ((deltaProfitYear - cost) / cost) * 100 : NaN;
  const payback = (deltaProfitMonth > 0) ? (cost / deltaProfitMonth) : Infinity;

  return {
    crNew, leadsNew, customersNew, revenueNew, profitNew,
    deltaProfitMonth, deltaProfitYear, roi, payback
  };
}

function buildScenarios(inputs, crReal) {
  const crAlt = inputs.crNow;

  const worst = Math.max(crAlt * 1.5, crAlt + 0.1);
  const best = Math.max(3.0, crAlt * 3);

  return {
    status: calcScenario(inputs, crAlt),
    worst: calcScenario(inputs, clamp(worst, 0, 100)),
    real: calcScenario(inputs, clamp(crReal, 0, 100)),
    best: calcScenario(inputs, clamp(best, 0, 100)),
  };
}

// ---------- UI state ----------
let mode = "cr"; // "cr" or "leads"

const els = {
  cost: document.getElementById("cost"),
  visitors: document.getElementById("visitors"),
  leads: document.getElementById("leads"),
  crNow: document.getElementById("crNow"),
  crTarget: document.getElementById("crTarget"),
  close: document.getElementById("close"),
  margin: document.getElementById("margin"),
  aov: document.getElementById("aov"),

  modeCR: document.getElementById("modeCR"),
  modeLeads: document.getElementById("modeLeads"),
  leadsRow: document.getElementById("leadsRow"),
  crRow: document.getElementById("crRow"),
  crFromLeads: document.getElementById("crFromLeads"),

  summaryText: document.getElementById("summaryText"),
  kpiROI: document.getElementById("kpiROI"),
  kpiPayback: document.getElementById("kpiPayback"),
  kpiYear: document.getElementById("kpiYear"),
  tblBody: document.getElementById("tblBody"),
  btnCopy: document.getElementById("btnCopy"),
  validationNote: document.getElementById("validationNote"),
};

function getInputs() {
  const cost = Number(els.cost.value || 0);
  const visitors = Number(els.visitors.value || 0);
  const close = Number(els.close.value || 0);
  const aov = Number(els.aov.value || 0);
  const margin = Number(els.margin.value || 0);

  let crNow = Number(els.crNow.value || 0);

  if (mode === "leads") {
    const leads = Number(els.leads.value || 0);
    crNow = (visitors > 0) ? (leads / visitors) * 100 : 0;
    els.crFromLeads.textContent = fmtNum(crNow, 2) + "%";
  }

  return {
    cost: Math.max(cost, 0),
    visitors: Math.max(visitors, 0),
    crNow: clamp(crNow, 0, 100),
    close: clamp(close, 0, 100),
    aov: Math.max(aov, 0),
    margin: clamp(margin, 0, 100),
  };
}

function validate(inputs) {
  const notes = [];

  if (inputs.visitors === 0) notes.push("Besucher/Monat = 0 → keine Leads möglich, Ergebnisse werden 0.");
  if (inputs.cost === 0) notes.push("Kosten = 0 → ROI ist mathematisch nicht sinnvoll (Division durch 0).");
  if (inputs.close < 5) notes.push("Abschlussquote wirkt sehr niedrig (<5%). Prüfe den Wert.");
  if (inputs.close > 70) notes.push("Abschlussquote >70% ist selten. Prüfe, ob du dich vertippt hast.");
  if (inputs.crNow > 20) notes.push("Conversion Rate >20% ist ungewöhnlich. Prüfe die Einheit (Prozent).");

  if (notes.length) {
    els.validationNote.style.display = "block";
    els.validationNote.textContent = notes.join(" ");
  } else {
    els.validationNote.style.display = "none";
    els.validationNote.textContent = "";
  }
}

function render() {
  const inputs = getInputs();
  validate(inputs);

  const crReal = Number(els.crTarget.value || 2.0);
  const S = buildScenarios(inputs, crReal);

  // KPIs based on realistic scenario
  const r = S.real;
  const roiText = isFinite(r.roi) ? (fmtNum(r.roi, 0) + "%") : "–";
  const paybackText = (r.payback === Infinity) ? "nicht" : fmtNum(r.payback, 1);
  const yearText = fmtEUR(r.deltaProfitYear);

  els.kpiROI.textContent = roiText;
  els.kpiPayback.textContent = paybackText;
  els.kpiYear.textContent = yearText;

  // Summary text
  const summary =
    `Bei ${fmtNum(inputs.visitors, 0)} Besuchern/Monat und aktuell ${fmtNum(inputs.crNow, 2)}% Conversion Rate ` +
    `ergibt sich im realistischen Szenario (${fmtNum(r.crNew, 2)}%) ein zusätzlicher Gewinn von ` +
    `${fmtEUR(r.deltaProfitMonth)}/Monat. ` +
    `Die Investition von ${fmtEUR(inputs.cost)} amortisiert sich ` +
    (r.payback === Infinity ? `nicht (Zusatzgewinn ≤ 0). ` : `nach ca. ${fmtNum(r.payback, 1)} Monaten. `) +
    `ROI im ersten Jahr: ${roiText}.`;

  els.summaryText.textContent = summary;
  els.btnCopy.dataset.summary = summary;

  // Table
  const rows = [
    ["Conversion Rate", `${fmtNum(S.status.crNew, 2)}%`, `${fmtNum(S.worst.crNew, 2)}%`, `${fmtNum(S.real.crNew, 2)}%`, `${fmtNum(S.best.crNew, 2)}%`],
    ["Anfragen / Monat", fmtNum(S.status.leadsNew, 0), fmtNum(S.worst.leadsNew, 0), fmtNum(S.real.leadsNew, 0), fmtNum(S.best.leadsNew, 0)],
    ["Kunden / Monat", fmtNum(S.status.customersNew, 1), fmtNum(S.worst.customersNew, 1), fmtNum(S.real.customersNew, 1), fmtNum(S.best.customersNew, 1)],
    ["Umsatz / Monat", fmtEUR(S.status.revenueNew), fmtEUR(S.worst.revenueNew), fmtEUR(S.real.revenueNew), fmtEUR(S.best.revenueNew)],
    ["Gewinn / Monat", fmtEUR(S.status.profitNew), fmtEUR(S.worst.profitNew), fmtEUR(S.real.profitNew), fmtEUR(S.best.profitNew)],
    ["Zusatzgewinn / Monat", "–", fmtEUR(S.worst.deltaProfitMonth), fmtEUR(S.real.deltaProfitMonth), fmtEUR(S.best.deltaProfitMonth)],
    ["Zusatzgewinn / Jahr", "–", fmtEUR(S.worst.deltaProfitYear), fmtEUR(S.real.deltaProfitYear), fmtEUR(S.best.deltaProfitYear)],
    ["ROI (Jahr 1)", "–",
      isFinite(S.worst.roi) ? fmtNum(S.worst.roi, 0) + "%" : "–",
      isFinite(S.real.roi) ? fmtNum(S.real.roi, 0) + "%" : "–",
      isFinite(S.best.roi) ? fmtNum(S.best.roi, 0) + "%" : "–"
    ],
    ["Amortisation (Monate)", "–",
      (S.worst.payback === Infinity) ? "nicht" : fmtNum(S.worst.payback, 1),
      (S.real.payback === Infinity) ? "nicht" : fmtNum(S.real.payback, 1),
      (S.best.payback === Infinity) ? "nicht" : fmtNum(S.best.payback, 1)
    ],
  ];

  els.tblBody.innerHTML = rows.map(r => `
    <tr>
      <td class="metric">${r[0]}</td>
      <td>${r[1]}</td>
      <td>${r[2]}</td>
      <td><b>${r[3]}</b></td>
      <td>${r[4]}</td>
    </tr>
  `).join("");
}

function setMode(next) {
  mode = next;

  if (mode === "cr") {
    els.modeCR.classList.add("active");
    els.modeLeads.classList.remove("active");
    els.crRow.style.display = "block";
    els.leadsRow.style.display = "none";
  } else {
    els.modeLeads.classList.add("active");
    els.modeCR.classList.remove("active");
    els.crRow.style.display = "none";
    els.leadsRow.style.display = "block";
  }

  render();
}

els.modeCR.addEventListener("click", () => setMode("cr"));
els.modeLeads.addEventListener("click", () => setMode("leads"));

// Re-render on input changes
["input", "change"].forEach(evt => {
  [els.cost, els.visitors, els.leads, els.crNow, els.crTarget, els.close, els.margin, els.aov].forEach(el => {
    el.addEventListener(evt, render);
  });
});

// Copy summary
els.btnCopy.addEventListener("click", async () => {
  const text = els.btnCopy.dataset.summary || "";
  try {
    await navigator.clipboard.writeText(text);
    els.btnCopy.textContent = "Kopiert ✅";
    setTimeout(() => els.btnCopy.textContent = "Zusammenfassung kopieren", 1200);
  } catch (e) {
    alert("Kopieren hat nicht geklappt. Markiere den Text manuell.");
  }
});

// first render
render();
