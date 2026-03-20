const elements = {
  search: document.getElementById("search"),
  sportsStatus: document.getElementById("sportsStatus"),
  igamingStatus: document.getElementById("igamingStatus"),
  region: document.getElementById("region"),
  fanaticsSportsbook: document.getElementById("fanaticsSportsbook"),
  taxMax: document.getElementById("taxMax"),
  taxMaxLabel: document.getElementById("taxMaxLabel"),
  taxFilterMeta: document.getElementById("taxFilterMeta"),
  excludeLimited: document.getElementById("excludeLimited"),
  hideUnattractive: document.getElementById("hideUnattractive"),
  showPerformanceLayer: document.getElementById("showPerformanceLayer"),
  lensMode: document.getElementById("lensMode"),
  execView: document.getElementById("execView"),
  rows: document.getElementById("stateRows"),
  statesCount: document.getElementById("statesCount"),
  statesMeta: document.getElementById("statesMeta"),
  onlineCount: document.getElementById("onlineCount"),
  onlineMeta: document.getElementById("onlineMeta"),
  igamingCount: document.getElementById("igamingCount"),
  igamingMeta: document.getElementById("igamingMeta"),
  liveShareStats: document.getElementById("liveShareStats"),
  derivedStats: document.getElementById("derivedStats"),
  activeFilterText: document.getElementById("activeFilterText"),
  activeFilterChips: document.getElementById("activeFilterChips"),
  presetNarrative: document.getElementById("presetNarrative"),
  presetButtons: document.querySelectorAll("[data-preset]"),
  resetBtn: document.getElementById("resetBtn"),
  copyBtn: document.getElementById("copyBtn"),
  copyToast: document.getElementById("copyToast"),
  tableSummaryRow: document.getElementById("tableSummaryRow"),
  budgetInput: document.getElementById("budgetInput"),
  budgetObjective: document.getElementById("budgetObjective"),
  runScenarioBtn: document.getElementById("runScenarioBtn"),
  scenarioSummary: document.getElementById("scenarioSummary"),
  scenarioList: document.getElementById("scenarioList"),
  lastUpdatedDate: document.getElementById("lastUpdatedDate")
};

const defaults = { search: "", sportsStatus: "all", igamingStatus: "all", region: "all", fanaticsSportsbook: "all", taxMax: 60, excludeLimited: false, hideUnattractive: false };
let activePreset = "none";
let lastRows = [];

function getFilters() {
  return {
    search: elements.search.value,
    sportsStatus: elements.sportsStatus.value,
    igamingStatus: elements.igamingStatus.value,
    region: elements.region.value,
    fanaticsSportsbook: elements.fanaticsSportsbook.value,
    taxMax: Number(elements.taxMax.value),
    excludeLimited: elements.excludeLimited.checked,
    hideUnattractive: elements.hideUnattractive.checked
  };
}

function isStructurallyUnattractive(row) {
  return (row.sports === "limited" || row.riskFlags.includes("Monopoly competitor")) && (row.tax ?? 0) > 40;
}

function priorityScore(row, lens) {
  const tierScore = { T1: 35, T2: 24, T3: 14 }[row.handleTier] ?? 2;
  const taxScore = row.tax === null ? 0 : Math.max(0, 18 - row.tax * 0.35);
  const liveScore = row.fanaticsSportsbook ? 18 : row.sports === "legal" && row.online ? 12 : 2;
  const igamingScore = row.igaming ? 20 : row.igamingStatus === "pending" ? 10 : 4;
  const ecoScore = row.ecosystemFit === "Core ecosystem" ? 12 : row.ecosystemFit === "Moderate ecosystem" ? 7 : 3;
  const growthBump = lens === "growth" ? row.fanaticsHeadroom * 1.8 : 0;
  return Math.round(tierScore + taxScore + liveScore + igamingScore + ecoScore + growthBump);
}

function runFilter(rows, f) {
  return rows.filter((r) => {
    if (f.search && r.state !== f.search) return false;
    if (f.sportsStatus !== "all" && r.sports !== f.sportsStatus) return false;
    if (f.igamingStatus === "yes" && !r.igaming) return false;
    if (f.igamingStatus === "no" && r.igaming) return false;
    if (f.region !== "all" && r.region !== f.region) return false;
    if (f.fanaticsSportsbook !== "all" && Boolean(r.fanaticsSportsbook) !== (f.fanaticsSportsbook === "yes")) return false;
    if (r.tax !== null && r.tax > f.taxMax) return false;
    if (f.excludeLimited && r.sports === "limited") return false;
    if (f.hideUnattractive && isStructurallyUnattractive(r)) return false;
    return true;
  }).map((r) => ({ ...r, score: priorityScore(r, elements.lensMode.value) })).sort((a, b) => b.score - a.score || b.addressableHandleB - a.addressableHandleB);
}

function renderRows(rows) {
  const showPerf = elements.showPerformanceLayer.checked;
  document.querySelectorAll(".perf-col").forEach((c) => c.style.display = showPerf ? "table-cell" : "none");

  if (!rows.length) {
    elements.rows.innerHTML = `<tr><td colspan="14" class="empty">No states matched.</td></tr>`;
    return;
  }
  elements.rows.innerHTML = rows.map((r) => `
    <tr>
      <td>${r.state}</td><td>${r.region}</td><td>${r.handleTier || "N/A"}</td><td>${r.addressableHandleB.toFixed(1)}</td>
      <td>${r.fanaticsShareToday}% / +${r.fanaticsHeadroom}%</td><td><strong>${r.score}</strong></td><td>${r.ecosystemFit}</td>
      <td class="perf-col" style="display:${showPerf ? "table-cell" : "none"}">${r.paybackBand}</td>
      <td class="perf-col" style="display:${showPerf ? "table-cell" : "none"}">${r.cacPressure}</td>
      <td>${r.sports}</td><td>${r.igaming ? "Yes" : r.igamingStatus === "pending" ? "Pending" : "No"}</td><td>${r.tax === null ? "N/A" : `${r.tax}%`}</td><td>${r.measurementReadiness}</td>
      <td>${r.riskFlags.length ? r.riskFlags.join(" • ") : "—"}</td>
    </tr>`).join("");
}

function renderKpis(rows) {
  const totalHandle = stateData.reduce((s, r) => s + r.addressableHandleB, 0);
  const inViewHandle = rows.reduce((s, r) => s + r.addressableHandleB, 0);
  const live = rows.filter((r) => r.fanaticsSportsbook).length;
  const legalOnline = rows.filter((r) => r.sports === "legal" && r.online).length;
  const favorable = rows.filter((r) => (r.tax ?? 99) <= 20 && ["Low", "Medium"].includes(r.cacPressure));
  const dualCommerce = rows.filter((r) => (r.igaming || r.igamingStatus === "pending") && r.ecosystemFit === "Core ecosystem").length;

  elements.statesCount.textContent = `${((inViewHandle / (totalHandle || 1)) * 100).toFixed(1)}%`;
  elements.statesMeta.textContent = `${inViewHandle.toFixed(1)}B addressable handle in current slice.`;
  elements.onlineCount.textContent = `${live} / ${legalOnline || 0}`;
  elements.onlineMeta.textContent = `Live footprint vs legal-online markets in current view.`;
  elements.igamingCount.textContent = `${favorable.length} / ${rows.length}`;
  elements.igamingMeta.textContent = `% of handle in view with favorable tax + CAC band.`;

  elements.liveShareStats.textContent = `Dual-product + commerce opportunity states in view: ${dualCommerce}.`;
  elements.derivedStats.textContent = `Average priority score: ${rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0}. Lens: ${elements.lensMode.value === "growth" ? "Media/Growth" : "Ops"} • ${elements.execView.value === "finance" ? "Finance View" : "President View"}.`;
  elements.taxFilterMeta.textContent = `${rows.length} jurisdictions pass current tax + structure filters.`;
}

function renderFilterText(filters) {
  const parts = [
    `Lens ${elements.lensMode.value}`,
    elements.execView.value === "finance" ? "Finance view" : "President view",
    filters.sportsStatus !== "all" ? `Sports:${filters.sportsStatus}` : null,
    filters.igamingStatus !== "all" ? `iGaming:${filters.igamingStatus}` : null,
    filters.taxMax < 60 ? `Max tax:${filters.taxMax}%` : null
  ].filter(Boolean);

  elements.activeFilterText.textContent = parts.join(" • ");
  elements.activeFilterChips.innerHTML = parts.map((p) => `<span class='filter-chip'>${p}</span>`).join("");
}

function renderTableSummary(rows) {
  const top = rows.slice(0, 3).map((r) => r.state).join(", ");
  elements.tableSummaryRow.innerHTML = `<td colspan='14'><strong>Ranked recommendation:</strong> ${top || "—"}. ${elements.execView.value === "finance" ? "Finance readout emphasizes tax/CAC/payback discipline." : "President readout emphasizes growth share and ecosystem upside."}</td>`;
}

function renderPresetNarrative() {
  const copy = {
    none: "Preset story appears here.",
    "launch-now": "Where we can spend now: legal + live states with clearer execution paths.",
    "cross-sell": "Ecosystem / Cross-Sell Core: sportsbook + iGaming + commerce overlap states to compound LTV.",
    "brand-led": "This slice is where brand-led investment should expand the top of funnel; we accept slower payback for long-term share in large handle markets.",
    "dr-focus": "This slice prioritizes states where direct-response dollars should convert with faster payback and lower CAC pressure."
  };
  elements.presetNarrative.textContent = copy[activePreset] || copy.none;
}

function runScenario() {
  const budget = Number(elements.budgetInput.value || 25);
  const objective = elements.budgetObjective.value;
  const rows = [...lastRows];
  const weighted = rows.map((r) => {
    let objectiveBoost = 1;
    if (objective === "ngr") objectiveBoost = (r.sports === "legal" ? 1.25 : 0.7) * ((r.tax ?? 50) <= 25 ? 1.2 : 0.8);
    if (objective === "crossSell") objectiveBoost = (r.igaming || r.igamingStatus === "pending" ? 1.35 : 0.75) * (r.ecosystemFit === "Core ecosystem" ? 1.2 : 0.9);
    if (objective === "lowTax") objectiveBoost = ((r.tax ?? 50) <= 20 ? 1.4 : 0.6) * (["T1", "T2"].includes(r.handleTier) ? 1.25 : 0.8);
    return { ...r, scenarioScore: r.score * objectiveBoost };
  }).sort((a, b) => b.scenarioScore - a.scenarioScore);

  const top = weighted.slice(0, 5);
  const alloc = (budget / Math.max(1, top.length)).toFixed(1);
  elements.scenarioList.innerHTML = top.map((r) => `<li><strong>${r.state}</strong> — ${alloc}M suggested • score ${r.scenarioScore.toFixed(1)}</li>`).join("");
  elements.scenarioSummary.textContent = `Most incremental value comes from: ${top.slice(0, 3).map((r) => r.state).join(", ")} under this lens.`;
}

function showCopyToast(msg) {
  elements.copyToast.textContent = msg;
  elements.copyToast.classList.add("show");
  setTimeout(() => elements.copyToast.classList.remove("show"), 1400);
}

async function exportNarrative() {
  const top = lastRows.slice(0, 3).map((r) => r.state).join(", ");
  const highRisk = lastRows.filter((r) => r.riskFlags.length).slice(0, 2).map((r) => `${r.state}: ${r.riskFlags[0]}`).join("; ");
  const text = `• Lens: ${elements.lensMode.value}, ${elements.execView.value} view\n• Top priorities: ${top}\n• Efficiency: ${elements.igamingCount.textContent} favorable tax+CAC states\n• Risks: ${highRisk || "No major risk flags in top slice"}`;
  try {
    await navigator.clipboard.writeText(text);
    showCopyToast("Narrative bullets copied.");
  } catch {
    showCopyToast("Clipboard blocked.");
  }
}

function setFilters(f) {
  elements.search.value = f.search;
  elements.sportsStatus.value = f.sportsStatus;
  elements.igamingStatus.value = f.igamingStatus;
  elements.region.value = f.region;
  elements.fanaticsSportsbook.value = f.fanaticsSportsbook;
  elements.taxMax.value = f.taxMax;
  elements.excludeLimited.checked = f.excludeLimited;
  elements.hideUnattractive.checked = f.hideUnattractive;
  render();
}

function applyPreset(name) {
  activePreset = name;
  const presets = {
    "launch-now": { ...defaults, sportsStatus: "legal", fanaticsSportsbook: "yes", taxMax: 25 },
    "cross-sell": { ...defaults, sportsStatus: "legal", igamingStatus: "yes" },
    "brand-led": { ...defaults, sportsStatus: "legal", fanaticsSportsbook: "no", excludeLimited: true },
    "dr-focus": { ...defaults, sportsStatus: "legal", fanaticsSportsbook: "yes", taxMax: 20, hideUnattractive: true }
  };
  setFilters(presets[name] || defaults);
}

function render() {
  const f = getFilters();
  const rows = runFilter(stateData, f);
  lastRows = rows;
  elements.taxMaxLabel.textContent = `${f.taxMax}%`;
  renderRows(rows);
  renderKpis(rows);
  renderFilterText(f);
  renderPresetNarrative();
  renderTableSummary(rows);
}

[elements.search, elements.sportsStatus, elements.igamingStatus, elements.region, elements.fanaticsSportsbook, elements.taxMax, elements.excludeLimited, elements.hideUnattractive, elements.showPerformanceLayer, elements.lensMode, elements.execView].forEach((el) => {
  el.addEventListener("input", () => { activePreset = "none"; render(); });
  el.addEventListener("change", () => { activePreset = "none"; render(); });
});

elements.presetButtons.forEach((btn) => btn.addEventListener("click", () => applyPreset(btn.dataset.preset)));
elements.runScenarioBtn.addEventListener("click", runScenario);
elements.copyBtn.addEventListener("click", exportNarrative);
elements.resetBtn.addEventListener("click", () => { activePreset = "none"; setFilters(defaults); });

elements.lastUpdatedDate.textContent = dataLastUpdated;
stateData.map((r) => r.state).sort((a, b) => a.localeCompare(b)).forEach((state) => {
  const option = document.createElement("option");
  option.value = state;
  option.textContent = state;
  elements.search.appendChild(option);
});

setFilters(defaults);
runScenario();
