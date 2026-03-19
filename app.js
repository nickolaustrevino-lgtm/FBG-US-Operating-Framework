const elements = {
  search: document.getElementById("search"),
  sportsStatus: document.getElementById("sportsStatus"),
  igamingStatus: document.getElementById("igamingStatus"),
  region: document.getElementById("region"),
  fanaticsSportsbook: document.getElementById("fanaticsSportsbook"),
  fanaticsCasino: document.getElementById("fanaticsCasino"),
  taxMax: document.getElementById("taxMax"),
  taxMaxLabel: document.getElementById("taxMaxLabel"),
  rows: document.getElementById("stateRows"),
  statesCount: document.getElementById("statesCount"),
  statesMeta: document.getElementById("statesMeta"),
  onlineCount: document.getElementById("onlineCount"),
  onlineMeta: document.getElementById("onlineMeta"),
  igamingCount: document.getElementById("igamingCount"),
  igamingMeta: document.getElementById("igamingMeta"),
  derivedStats: document.getElementById("derivedStats"),
  activeFilterText: document.getElementById("activeFilterText"),
  activeFilterChips: document.getElementById("activeFilterChips"),
  presetNarrative: document.getElementById("presetNarrative"),
  resetBtn: document.getElementById("resetBtn"),
  copyBtn: document.getElementById("copyBtn"),
  copyToast: document.getElementById("copyToast"),
  presetButtons: document.querySelectorAll("[data-preset]"),
  tableSummaryRow: document.getElementById("tableSummaryRow")
};

const defaultFilters = {
  search: "",
  sportsStatus: "all",
  igamingStatus: "all",
  region: "all",
  fanaticsSportsbook: "all",
  fanaticsCasino: "all",
  collegeAllowedOnly: false,
  taxMin: 0,
  taxMax: 60
};

const hiddenFilters = {
  collegeAllowedOnly: defaultFilters.collegeAllowedOnly,
  taxMin: defaultFilters.taxMin
};

let activePreset = "none";

function getFilters() {
  return {
    search: elements.search.value.trim().toLowerCase(),
    sportsStatus: elements.sportsStatus.value,
    igamingStatus: elements.igamingStatus.value,
    region: elements.region.value,
    fanaticsSportsbook: elements.fanaticsSportsbook.value,
    fanaticsCasino: elements.fanaticsCasino.value,
    collegeAllowedOnly: hiddenFilters.collegeAllowedOnly,
    taxMin: hiddenFilters.taxMin,
    taxMax: Number(elements.taxMax.value)
  };
}

function runFilter(data, filters) {
  return data.filter((row) => {
    if (filters.search && !row.state.toLowerCase().includes(filters.search)) return false;
    if (filters.sportsStatus !== "all" && row.sports !== filters.sportsStatus) return false;
    if (filters.igamingStatus !== "all") {
      const shouldHaveIGaming = filters.igamingStatus === "yes";
      if (row.igaming !== shouldHaveIGaming) return false;
    }
    if (filters.region !== "all" && row.region !== filters.region) return false;
    if (filters.fanaticsSportsbook !== "all") {
      const shouldHaveFanaticsSportsbook = filters.fanaticsSportsbook === "yes";
      if (Boolean(row.fanaticsSportsbook) !== shouldHaveFanaticsSportsbook) return false;
    }
    if (filters.fanaticsCasino !== "all") {
      const shouldHaveFanaticsCasino = filters.fanaticsCasino === "yes";
      if (Boolean(row.fanaticsCasino) !== shouldHaveFanaticsCasino) return false;
    }
    if (filters.collegeAllowedOnly && row.college !== "Allowed") return false;
    if (row.tax !== null && row.tax < filters.taxMin) return false;
    if (row.tax !== null && row.tax > filters.taxMax) return false;
    return true;
  });
}

function badgeForSports(sports) {
  if (sports === "legal") return `<span class="pill legal">Legal</span>`;
  if (sports === "limited") return `<span class="pill limited">Limited</span>`;
  return `<span class="pill illegal">Illegal</span>`;
}

function displayOnline(row) {
  if (!row.online) return "No";
  return row.onlineNote ? `Yes (${row.onlineNote})` : "Yes";
}

function displayIGaming(row) {
  if (row.igamingStatus === "pending") return "Pending";
  return row.igaming ? "Yes" : "No";
}

function displayTax(row) {
  if (row.tax === null) return "N/A";
  if (row.taxNote) return `${row.tax}% (${row.taxNote})`;
  return `${row.tax}%`;
}

function displayFanatics(value) {
  if (value) return `<span class="pill fanatics-live">Live</span>`;
  return `<span class="pill fanatics-off">Not live</span>`;
}

function displayHandleTier(row) {
  return row.handleTier || "N/A";
}

function taxBandClass(tax) {
  if (tax === null) return "";
  if (tax >= 36) return "tax-high";
  if (tax >= 20) return "tax-mid";
  if (tax < 15) return "tax-low";
  return "";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderRows(rows) {
  if (!rows.length) {
    elements.rows.innerHTML = `<tr><td colspan="10" class="empty">No states matched. Try broadening the filters.</td></tr>`;
    return;
  }

  elements.rows.innerHTML = rows
    .map(
      (row) => `
      <tr>
        <td>${row.state}</td>
        <td>${row.region}</td>
        <td>${badgeForSports(row.sports)}</td>
        <td>${displayOnline(row)}</td>
        <td>${displayIGaming(row)}</td>
        <td>${displayFanatics(Boolean(row.fanaticsSportsbook))}</td>
        <td>${displayFanatics(Boolean(row.fanaticsCasino))}</td>
        <td class="${taxBandClass(row.tax)}">${displayTax(row)}</td>
        <td>${displayHandleTier(row)}</td>
        <td>${row.college}</td>
      </tr>`
    )
    .join("");
}

function renderKPIs(rows) {
  const totalJurisdictions = stateData.length;
  const legalOnlineStates = rows.filter((r) => r.online && r.sports === "legal");
  const igamingLiveStates = rows.filter((r) => r.igaming);

  elements.statesCount.textContent = rows.length;
  elements.statesMeta.textContent = `of ${totalJurisdictions} total jurisdictions`;

  elements.onlineCount.textContent = legalOnlineStates.length;
  elements.onlineMeta.textContent = rows.length
    ? `${Math.round((legalOnlineStates.length / rows.length) * 100)}% of current view`
    : "0% of current view";

  elements.igamingCount.textContent = igamingLiveStates.length;
  elements.igamingMeta.textContent = rows.length
    ? `${Math.round((igamingLiveStates.length / rows.length) * 100)}% of current view`
    : "0% of current view";
}

function renderDerivedStats(rows) {
  const legalOnlineCount = rows.filter((r) => r.online && r.sports === "legal").length;
  const igamingLiveCount = rows.filter((r) => r.igaming).length;
  const taxes = rows.filter((r) => r.tax !== null).map((r) => r.tax);
  const highestTax = taxes.length ? Math.max(...taxes) : null;
  const igamingShare = legalOnlineCount ? Math.round((igamingLiveCount / legalOnlineCount) * 100) : 0;

  elements.derivedStats.textContent = `Share of legal-online states with iGaming live: ${igamingLiveCount}/${legalOnlineCount || 0} (${igamingShare}%). Highest tax in view: ${highestTax === null ? "N/A" : `${highestTax}%`}.`;
}

function renderPresetNarrative() {
  const narratives = {
    none: "Preset story: select a demo preset to load a narrative-backed market slice.",
    "launch-now":
      "Launch-Now focus: legal online states where Fanatics Sportsbook is already live, with manageable tax and meaningful market scale (T1/T2).",
    "igaming-focus":
      "iGaming Focus: states where online casino is legal to highlight sportsbook-to-casino cross-sell opportunities.",
    "high-tax":
      "High Tax Risk: high-tax environments that may compress margin and require different promo/pricing strategy.",
    "college-safe":
      "College-Friendly: legal online states with college betting allowed to support compliant college-themed campaigns."
  };

  elements.presetNarrative.textContent = narratives[activePreset] || narratives.none;
}

function renderTableSummary(rows) {
  const taxRows = rows.filter((r) => r.tax !== null);
  const averageTax = taxRows.length ? (taxRows.reduce((sum, row) => sum + row.tax, 0) / taxRows.length).toFixed(1) : "N/A";
  const liveSportsbook = rows.filter((r) => r.fanaticsSportsbook).length;
  const liveCasino = rows.filter((r) => r.fanaticsCasino).length;
  const collegeAllowed = rows.filter((r) => r.college === "Allowed").length;

  elements.tableSummaryRow.innerHTML = `<td colspan="10">Avg tax: ${averageTax === "N/A" ? averageTax : `${averageTax}%`} • Jurisdictions: ${rows.length} • Live sportsbook: ${liveSportsbook} • Live casino: ${liveCasino} • College allowed: ${collegeAllowed}</td>`;
}

function renderFilterText(filters) {
  const parts = [];
  if (filters.search) parts.push(`Search: "${filters.search}"`);
  if (filters.sportsStatus !== "all") parts.push(`Sports: ${filters.sportsStatus}`);
  if (filters.igamingStatus !== "all") parts.push(`iGaming: ${filters.igamingStatus}`);
  if (filters.region !== "all") parts.push(`Region: ${filters.region}`);
  if (filters.fanaticsSportsbook !== "all") parts.push(`Fanatics Sportsbook: ${filters.fanaticsSportsbook}`);
  if (filters.fanaticsCasino !== "all") parts.push(`Fanatics Casino: ${filters.fanaticsCasino}`);
  if (filters.collegeAllowedOnly) parts.push("College betting: Allowed only");
  if (filters.taxMin > 0) parts.push(`Min tax: ${filters.taxMin}%`);
  if (filters.taxMax < 60) parts.push(`Max tax: ${filters.taxMax}%`);

  elements.activeFilterText.textContent = parts.length ? parts.join(" • ") : "No filters applied.";
  elements.activeFilterChips.innerHTML = parts.length
    ? parts.map((part) => `<span class="filter-chip">${escapeHtml(part)}</span>`).join("")
    : `<span class="filter-chip muted">All jurisdictions</span>`;
}

function render() {
  const filters = getFilters();
  const filtered = runFilter(stateData, filters);
  renderRows(filtered);
  renderKPIs(filtered);
  renderDerivedStats(filtered);
  renderFilterText(filters);
  renderPresetNarrative();
  renderTableSummary(filtered);
  elements.taxMaxLabel.textContent = `${filters.taxMax}%`;
}

function setFilters(newFilters) {
  hiddenFilters.collegeAllowedOnly = newFilters.collegeAllowedOnly ?? defaultFilters.collegeAllowedOnly;
  hiddenFilters.taxMin = newFilters.taxMin ?? defaultFilters.taxMin;
  elements.search.value = newFilters.search;
  elements.sportsStatus.value = newFilters.sportsStatus;
  elements.igamingStatus.value = newFilters.igamingStatus;
  elements.region.value = newFilters.region;
  elements.fanaticsSportsbook.value = newFilters.fanaticsSportsbook;
  elements.fanaticsCasino.value = newFilters.fanaticsCasino;
  elements.taxMax.value = newFilters.taxMax;
  render();
}

function applyPreset(name) {
  activePreset = name;
  const presets = {
    "launch-now": { ...defaultFilters, sportsStatus: "legal", fanaticsSportsbook: "yes", taxMax: 20 },
    "igaming-focus": { ...defaultFilters, igamingStatus: "yes" },
    "high-tax": { ...defaultFilters, taxMin: 36, taxMax: 60 },
    "college-safe": { ...defaultFilters, sportsStatus: "legal", collegeAllowedOnly: true, search: "" }
  };

  setFilters(presets[name] || defaultFilters);
}

let copyToastTimeout;

function showCopyToast(message, isError = false) {
  elements.copyToast.textContent = message;
  elements.copyToast.classList.toggle("error", isError);
  elements.copyToast.classList.add("show");
  clearTimeout(copyToastTimeout);
  copyToastTimeout = setTimeout(() => {
    elements.copyToast.classList.remove("show");
  }, 1500);
}

async function copySummary() {
  const filters = getFilters();
  const filtered = runFilter(stateData, filters);
  const onlineSports = filtered.filter((r) => r.online && r.sports === "legal").length;
  const igamingLive = filtered.filter((r) => r.igaming).length;
  const taxRows = filtered.filter((r) => r.tax !== null);
  const avgTax = taxRows.length ? (taxRows.reduce((sum, row) => sum + row.tax, 0) / taxRows.length).toFixed(1) : "N/A";
  const tierMix = {
    T1: filtered.filter((r) => r.handleTier === "T1").length,
    T2: filtered.filter((r) => r.handleTier === "T2").length,
    T3: filtered.filter((r) => r.handleTier === "T3").length
  };
  const summary = `Filter: ${elements.activeFilterText.textContent}. ${filtered.length} jurisdictions in view, ${onlineSports} legal online sports, ${igamingLive} iGaming live, avg tax ${avgTax === "N/A" ? avgTax : `${avgTax}%`}, tier mix: ${tierMix.T1} T1 / ${tierMix.T2} T2 / ${tierMix.T3} T3.`;

  try {
    await navigator.clipboard.writeText(summary);
    elements.copyBtn.textContent = "Copied";
    showCopyToast("View summary copied to clipboard.");
    setTimeout(() => {
      elements.copyBtn.textContent = "Copy KPI summary";
    }, 1200);
  } catch {
    elements.copyBtn.textContent = "Clipboard blocked";
    showCopyToast("Clipboard access is blocked in this browser.", true);
    setTimeout(() => {
      elements.copyBtn.textContent = "Copy KPI summary";
    }, 1200);
  }
}

[
  elements.search,
  elements.sportsStatus,
  elements.igamingStatus,
  elements.region,
  elements.fanaticsSportsbook,
  elements.fanaticsCasino,
  elements.taxMax
].forEach((element) => {
  element.addEventListener("input", () => {
    activePreset = "none";
    render();
  });
  element.addEventListener("change", () => {
    activePreset = "none";
    render();
  });
});

elements.resetBtn.addEventListener("click", () => setFilters(defaultFilters));
elements.copyBtn.addEventListener("click", copySummary);

elements.presetButtons.forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});

setFilters(defaultFilters);
