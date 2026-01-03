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
    profitOld, // fürs Debug/Verständnis ok
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
    real:  calcScenario(inputs, clamp(crReal, 0, 100)),
    best:  calcScenario(inputs, clamp(best, 0, 100)),
  };
}

let mode = "cr";

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
  btnPrint: document.getElementById("btnPrint"),
  validationNote: document.getElementById("validationNote"),

  argVisitors: document.getElementById("argVisitors"),
  argCrNow: document.getElementById("argCrNow"),
  argCrReal: document.getElementById("argCrReal"),
  argDeltaMonth: document.getElementById("argDeltaMonth"),
  argCost: document.getElementById("argCost"),
  argPayback: document.getElementById("argPayback"),
  argRoi: document.getElementById("argRoi"),

  argVisitors2: document.getElementById("argVisitors2"),
  argCrNow2: document.getElementById("argCrNow2"),
  argLeadsOld: document.getElementById("argLeadsOld"),
  argLeadsNew: document.getElementById("argLeadsNew"),
  argCrReal2: document.getElementById("argCrReal2"),

  argLeadsOld2: document.getElementById("argLeadsOld2"),
  argClose: document.getElementById("argClose"),
  argAov: document.getElementById("argAov"),
  argMargin: document.getElementById("argMargin"),

  argLeadsOld3: document.getElementById("argLeadsOld3"),
  argLeadsOld4: document.getElementById("argLeadsOld4"),
  argClose2: document.getElementById("argClose2"),
  argCustomersOld: document.getElementById("argCustomersOld"),
  argCustomersOld2: document.getElementById("argCustomersOld2"),
  argAov2: document.getElementById("argAov2"),
  argRevenueOld: document.getElementById("argRevenueOld"),
  argRevenueOld2: document.getElementById("argRevenueOld2"),
  argMargin2: document.getElementById("argMargin2"),
  argProfitOld: document.getElementById("argProfitOld"),

  argLeadsNew2: document.getElementById("argLeadsNew2"),
  argLeadsNew3: document.getElementById("argLeadsNew3"),
  argClose3: document.getElementById("argClose3"),
  argCustomersNew: document.getElementById("argCustomersNew"),
  argCustomersNew2: document.getElementById("argCustomersNew2"),
  argAov3: document.getElementById("argAov3"),
  argRevenueNew: document.getElementById("argRevenueNew"),
  argRevenueNew2: document.getElementById("argRevenueNew2"),
  argMargin3: document.getElementById("argMargin3"),
  argProfitNew: document.getElementById("argProfitNew"),

  argProfitNew2: document.getElementById("argProfitNew2"),
  argProfitOld2: document.getElementById("argProfitOld2"),
  argDeltaMonth2: document.getElementById("argDeltaMonth2"),
  argDeltaYear: document.getElementById("argDeltaYear"),
  argCost2: document.getElementById("argCost2"),
  argDeltaMonth3: document.getElementById("argDeltaMonth3"),
  argPayback2: document.getElementById("argPayback2"),
  argRoi2: document.getElementById("argRoi2"),

  argCrStatus: document.getElementById("argCrStatus"),
  argCrWorst: document.getElementById("argCrWorst"),
  argCrReal3: document.getElementById("argCrReal3"),
  argCrBest: document.getElementById("argCrBest"),
  argLeadsStatus: document.getElementById("argLeadsStatus"),
  argLeadsWorst: document.getElementById("argLeadsWorst"),
  argLeadsReal: document.getElementById("argLeadsReal"),
  argLeadsBest: document.getElementById("argLeadsBest"),
  argCustomersStatus: document.getElementById("argCustomersStatus"),
  argCustomersWorst: document.getElementById("argCustomersWorst"),
  argCustomersReal: document.getElementById("argCustomersReal"),
  argCustomersBest: document.getElementById("argCustomersBest"),
  argRevenueStatus: document.getElementById("argRevenueStatus"),
  argRevenueWorst: document.getElementById("argRevenueWorst"),
  argRevenueReal: document.getElementById("argRevenueReal"),
  argRevenueBest: document.getElementById("argRevenueBest"),
  argProfitStatus: document.getElementById("argProfitStatus"),
  argProfitWorst: document.getElementById("argProfitWorst"),
  argProfitReal: document.getElementById("argProfitReal"),
  argProfitBest: document.getElementById("argProfitBest"),
  argDeltaYearWorst: document.getElementById("argDeltaYearWorst"),
  argDeltaYearReal: document.getElementById("argDeltaYearReal"),
  argDeltaYearBest: document.getElementById("argDeltaYearBest"),
  argPaybackWorst: document.getElementById("argPaybackWorst"),
  argPaybackReal: document.getElementById("argPaybackReal"),
  argPaybackBest: document.getElementById("argPaybackBest"),
  argRoiWorst: document.getElementById("argRoiWorst"),
  argRoiReal: document.getElementById("argRoiReal"),
  argRoiBest: document.getElementById("argRoiBest"),

  argCrWorst2: document.getElementById("argCrWorst2"),
  argCrWorst3: document.getElementById("argCrWorst3"),
  argRoiWorst2: document.getElementById("argRoiWorst2"),
  argPaybackWorst2: document.getElementById("argPaybackWorst2"),
  argCrReal4: document.getElementById("argCrReal4"),
  argPaybackReal2: document.getElementById("argPaybackReal2"),
  argRoiReal2: document.getElementById("argRoiReal2"),
  argCrBest2: document.getElementById("argCrBest2"),
  argPaybackBest2: document.getElementById("argPaybackBest2"),
  argRoiBest2: document.getElementById("argRoiBest2"),

  argVisitors3: document.getElementById("argVisitors3"),
  argVisitors4: document.getElementById("argVisitors4"),
  argCrNow3: document.getElementById("argCrNow3"),
  argCrReal5: document.getElementById("argCrReal5"),
  argLostLeads: document.getElementById("argLostLeads"),
  argLostCustomers: document.getElementById("argLostCustomers"),
  argLostRevenue: document.getElementById("argLostRevenue"),
  argLostProfit: document.getElementById("argLostProfit"),

  argCost3: document.getElementById("argCost3"),
  argPhase1: document.getElementById("argPhase1"),
  argPhase2: document.getElementById("argPhase2"),
  argPhase3: document.getElementById("argPhase3"),
  argRateMonth: document.getElementById("argRateMonth"),
  argPayback3: document.getElementById("argPayback3"),

  argLeadsNew4: document.getElementById("argLeadsNew4"),
  argLeadsOld5: document.getElementById("argLeadsOld5"),
  argCloseNeg: document.getElementById("argCloseNeg"),
  argCustomersNew3: document.getElementById("argCustomersNew3"),
  argCustomersOld3: document.getElementById("argCustomersOld3"),
  argCustomersDiff: document.getElementById("argCustomersDiff"),

  argCrNow4: document.getElementById("argCrNow4"),
  argCrReal6: document.getElementById("argCrReal6"),
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

function setText(el, text) {
  if (el) el.textContent = text;
}

function render() {
  const inputs = getInputs();
  validate(inputs);

  const crReal = Number(els.crTarget.value || 2.0);
  const S = buildScenarios(inputs, crReal);

  const r = S.real;

  const roiText = isFinite(r.roi) ? (fmtNum(r.roi, 0) + "%") : "–";
  const paybackText = (r.payback === Infinity) ? "nicht amortisierbar" : (fmtNum(r.payback, 1) + " Monate");
  const yearText = fmtEUR(r.deltaProfitYear);

  els.kpiROI.textContent = roiText;
  // ROI-Farbe setzen
  els.kpiROI.classList.remove("val-good","val-warn","val-bad","val-neutral");

  if (!isFinite(r.roi)) {
    els.kpiROI.classList.add("val-neutral");
  } else if (r.roi >= 100) {
    els.kpiROI.classList.add("val-good");     // ab 100% grün
  } else if (r.roi >= 0) {
    els.kpiROI.classList.add("val-warn");     // 0–99% orange
  } else {
    els.kpiROI.classList.add("val-bad");      // negativ rot
  }
  els.kpiPayback.textContent = paybackText;
  els.kpiYear.textContent = yearText;

  const summary =
    `Bei ${fmtNum(inputs.visitors, 0)} Besuchern/Monat und aktuell ${fmtNum(inputs.crNow, 2)}% Conversion Rate ` +
    `ergibt sich im realistischen Szenario (${fmtNum(r.crNew, 2)}%) ein zusätzlicher Gewinn von ` +
    `${fmtEUR(r.deltaProfitMonth)}/Monat. ` +
    `Investition: ${fmtEUR(inputs.cost)}. ` +
    (r.payback === Infinity ? `Amortisation: nicht (Zusatzgewinn ≤ 0). ` : `Amortisation: ca. ${fmtNum(r.payback, 1)} Monate. `) +
    `ROI im ersten Jahr: ${roiText}.`;

  els.summaryText.textContent = summary;
  els.btnCopy.dataset.summary = summary;

  const roiNum = isFinite(r.roi) ? fmtNum(r.roi, 0) : "–";
  const paybackShort = (r.payback === Infinity) ? "nicht" : fmtNum(r.payback, 1);

  const status = S.status;
  const worst = S.worst;
  const real = S.real;
  const best = S.best;

  const lostLeads = Math.max(real.leadsNew - status.leadsNew, 0);
  const lostCustomers = Math.max(real.customersNew - status.customersNew, 0);
  const lostRevenue = Math.max(real.revenueNew - status.revenueNew, 0);
  const lostProfit = Math.max(real.profitNew - status.profitOld, 0);

  const phase1 = inputs.cost * 0.5;
  const phase2 = inputs.cost * 0.3;
  const phase3 = inputs.cost * 0.2;
  const rateMonth = inputs.cost / 24;

  const paybackWorst = (worst.payback === Infinity) ? "–" : fmtNum(worst.payback, 1);
  const paybackReal = (real.payback === Infinity) ? "–" : fmtNum(real.payback, 1);
  const paybackBest = (best.payback === Infinity) ? "–" : fmtNum(best.payback, 1);

  setText(els.argVisitors, fmtNum(inputs.visitors, 0));
  setText(els.argCrNow, fmtNum(inputs.crNow, 2));
  setText(els.argCrReal, fmtNum(real.crNew, 2));
  setText(els.argDeltaMonth, fmtEUR(real.deltaProfitMonth));
  setText(els.argCost, fmtEUR(inputs.cost));
  setText(els.argPayback, paybackShort);
  setText(els.argRoi, roiNum);

  setText(els.argVisitors2, fmtNum(inputs.visitors, 0));
  setText(els.argCrNow2, fmtNum(inputs.crNow, 2));
  setText(els.argLeadsOld, fmtNum(status.leadsNew, 0));
  setText(els.argLeadsNew, fmtNum(real.leadsNew, 0));
  setText(els.argCrReal2, fmtNum(real.crNew, 2));

  setText(els.argLeadsOld2, fmtNum(status.leadsNew, 0));
  setText(els.argClose, fmtNum(inputs.close, 0));
  setText(els.argAov, fmtEUR(inputs.aov));
  setText(els.argMargin, fmtNum(inputs.margin, 0));

  setText(els.argLeadsOld3, fmtNum(status.leadsNew, 0));
  setText(els.argLeadsOld4, fmtNum(status.leadsNew, 0));
  setText(els.argClose2, fmtNum(inputs.close, 0));
  setText(els.argCustomersOld, fmtNum(status.customersNew, 0));
  setText(els.argCustomersOld2, fmtNum(status.customersNew, 0));
  setText(els.argAov2, fmtEUR(inputs.aov));
  setText(els.argRevenueOld, fmtEUR(status.revenueNew));
  setText(els.argRevenueOld2, fmtEUR(status.revenueNew));
  setText(els.argMargin2, fmtNum(inputs.margin, 0));
  setText(els.argProfitOld, fmtEUR(status.profitOld));

  setText(els.argLeadsNew2, fmtNum(real.leadsNew, 0));
  setText(els.argLeadsNew3, fmtNum(real.leadsNew, 0));
  setText(els.argClose3, fmtNum(inputs.close, 0));
  setText(els.argCustomersNew, fmtNum(real.customersNew, 0));
  setText(els.argCustomersNew2, fmtNum(real.customersNew, 0));
  setText(els.argAov3, fmtEUR(inputs.aov));
  setText(els.argRevenueNew, fmtEUR(real.revenueNew));
  setText(els.argRevenueNew2, fmtEUR(real.revenueNew));
  setText(els.argMargin3, fmtNum(inputs.margin, 0));
  setText(els.argProfitNew, fmtEUR(real.profitNew));

  setText(els.argProfitNew2, fmtEUR(real.profitNew));
  setText(els.argProfitOld2, fmtEUR(status.profitOld));
  setText(els.argDeltaMonth2, fmtEUR(real.deltaProfitMonth));
  setText(els.argDeltaYear, fmtEUR(real.deltaProfitYear));
  setText(els.argCost2, fmtEUR(inputs.cost));
  setText(els.argDeltaMonth3, fmtEUR(real.deltaProfitMonth));
  setText(els.argPayback2, paybackShort);
  setText(els.argRoi2, roiNum);

  setText(els.argCrStatus, fmtNum(status.crNew, 2));
  setText(els.argCrWorst, fmtNum(worst.crNew, 2));
  setText(els.argCrReal3, fmtNum(real.crNew, 2));
  setText(els.argCrBest, fmtNum(best.crNew, 2));
  setText(els.argLeadsStatus, fmtNum(status.leadsNew, 0));
  setText(els.argLeadsWorst, fmtNum(worst.leadsNew, 0));
  setText(els.argLeadsReal, fmtNum(real.leadsNew, 0));
  setText(els.argLeadsBest, fmtNum(best.leadsNew, 0));
  setText(els.argCustomersStatus, fmtNum(status.customersNew, 0));
  setText(els.argCustomersWorst, fmtNum(worst.customersNew, 0));
  setText(els.argCustomersReal, fmtNum(real.customersNew, 0));
  setText(els.argCustomersBest, fmtNum(best.customersNew, 0));
  setText(els.argRevenueStatus, fmtEUR(status.revenueNew));
  setText(els.argRevenueWorst, fmtEUR(worst.revenueNew));
  setText(els.argRevenueReal, fmtEUR(real.revenueNew));
  setText(els.argRevenueBest, fmtEUR(best.revenueNew));
  setText(els.argProfitStatus, fmtEUR(status.profitOld));
  setText(els.argProfitWorst, fmtEUR(worst.profitNew));
  setText(els.argProfitReal, fmtEUR(real.profitNew));
  setText(els.argProfitBest, fmtEUR(best.profitNew));
  setText(els.argDeltaYearWorst, fmtEUR(worst.deltaProfitYear));
  setText(els.argDeltaYearReal, fmtEUR(real.deltaProfitYear));
  setText(els.argDeltaYearBest, fmtEUR(best.deltaProfitYear));
  setText(els.argPaybackWorst, paybackWorst);
  setText(els.argPaybackReal, paybackReal);
  setText(els.argPaybackBest, paybackBest);
  setText(els.argRoiWorst, isFinite(worst.roi) ? fmtNum(worst.roi, 0) : "–");
  setText(els.argRoiReal, isFinite(real.roi) ? fmtNum(real.roi, 0) : "–");
  setText(els.argRoiBest, isFinite(best.roi) ? fmtNum(best.roi, 0) : "–");

  setText(els.argCrWorst2, fmtNum(worst.crNew, 2));
  setText(els.argCrWorst3, fmtNum(worst.crNew, 2));
  setText(els.argRoiWorst2, isFinite(worst.roi) ? fmtNum(worst.roi, 0) : "–");
  setText(els.argPaybackWorst2, paybackWorst);
  setText(els.argCrReal4, fmtNum(real.crNew, 2));
  setText(els.argPaybackReal2, paybackReal);
  setText(els.argRoiReal2, isFinite(real.roi) ? fmtNum(real.roi, 0) : "–");
  setText(els.argCrBest2, fmtNum(best.crNew, 2));
  setText(els.argPaybackBest2, paybackBest);
  setText(els.argRoiBest2, isFinite(best.roi) ? fmtNum(best.roi, 0) : "–");

  setText(els.argVisitors3, fmtNum(inputs.visitors, 0));
  setText(els.argVisitors4, fmtNum(inputs.visitors, 0));
  setText(els.argCrNow3, fmtNum(inputs.crNow, 2));
  setText(els.argCrReal5, fmtNum(real.crNew, 2));
  setText(els.argLostLeads, fmtNum(lostLeads, 0));
  setText(els.argLostCustomers, fmtNum(lostCustomers, 0));
  setText(els.argLostRevenue, fmtEUR(lostRevenue));
  setText(els.argLostProfit, fmtEUR(lostProfit));

  setText(els.argCost3, fmtEUR(inputs.cost));
  setText(els.argPhase1, fmtEUR(phase1));
  setText(els.argPhase2, fmtEUR(phase2));
  setText(els.argPhase3, fmtEUR(phase3));
  setText(els.argRateMonth, fmtEUR(rateMonth));
  setText(els.argPayback3, paybackShort);

  setText(els.argLeadsNew4, fmtNum(real.leadsNew, 0));
  setText(els.argLeadsOld5, fmtNum(status.leadsNew, 0));
  setText(els.argCloseNeg, fmtNum(100 - inputs.close, 0));
  setText(els.argCustomersNew3, fmtNum(real.customersNew, 0));
  setText(els.argCustomersOld3, fmtNum(status.customersNew, 0));
  setText(els.argCustomersDiff, fmtNum(real.customersNew - status.customersNew, 0));

  setText(els.argCrNow4, fmtNum(inputs.crNow, 2));
  setText(els.argCrReal6, fmtNum(real.crNew, 2));

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

["input", "change"].forEach(evt => {
  [els.cost, els.visitors, els.leads, els.crNow, els.crTarget, els.close, els.margin, els.aov].forEach(el => {
    el.addEventListener(evt, render);
  });
});

els.btnCopy.addEventListener("click", async () => {
  const text = els.btnCopy.dataset.summary || "";
  try {
    await navigator.clipboard.writeText(text);
    els.btnCopy.textContent = "Kopiert ✅";
    setTimeout(() => els.btnCopy.textContent = "Zusammenfassung kopieren", 1200);
  } catch {
    alert("Kopieren hat nicht geklappt. Markiere den Text manuell.");
  }
});

els.btnPrint.addEventListener("click", () => {
  window.print();
});

render();
