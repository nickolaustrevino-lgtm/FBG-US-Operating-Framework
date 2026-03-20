const elements = {
  search: document.getElementById("search"),
  lastUpdatedDate: document.getElementById("lastUpdatedDate"),
  refreshBtn: document.getElementById("refreshBtn"),
  sportsStatus: document.getElementById("sportsStatus"),
  igamingStatus: document.getElementById("igamingStatus"),
  region: document.getElementById("region"),
  fanaticsSportsbook: document.getElementById("fanaticsSportsbook"),
  fanaticsCasino: document.getElementById("fanaticsCasino"),
  hasFanaticsPresence: document.getElementById("hasFanaticsPresence"),
  excludeLimited: document.getElementById("excludeLimited"),
  primarySort: document.getElementById("primarySort"),
  groupByRegion: document.getElementById("groupByRegion"),
  sortButtons: document.querySelectorAll(".sort-btn"),
  taxMax: document.getElementById("taxMax"),
  taxMaxLabel: document.getElementById("taxMaxLabel"),
  taxFilterMeta: document.getElementById("taxFilterMeta"),
  rows: document.getElementById("stateRows"),
  statesCount: document.getElementById("statesCount"),
  statesMeta: document.getElementById("statesMeta"),
  onlineCount: document.getElementById("onlineCount"),
  onlineMeta: document.getElementById("onlineMeta"),
  igamingCount: document.getElementById("igamingCount"),
  igamingMeta: document.getElementById("igamingMeta"),
  liveShareStats: document.getElementById("liveShareStats"),
  derivedStats: document.getElementById("derivedStats"),
  stateBriefSelect: document.getElementById("stateBriefSelect"),
  briefSnapshot: document.getElementById("briefSnapshot"),
  briefUpdate: document.getElementById("briefUpdate"),
  briefWhy: document.getElementById("briefWhy"),
  briefLinks: document.getElementById("briefLinks"),
  activeFilterText: document.getElementById("activeFilterText"),
  majorPolicyCallout: document.getElementById("majorPolicyCallout"),
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
  hasFanaticsPresence: false,
  excludeLimited: false,
  collegeAllowedOnly: false,
  taxMin: 0,
  taxMax: 60
};

const hiddenFilters = {
  collegeAllowedOnly: defaultFilters.collegeAllowedOnly,
  taxMin: defaultFilters.taxMin
};

const HIGH_TAX_PRESET_MIN = 36;

let activePreset = "none";
let activeSort = { key: "state", direction: "asc" };
let lastRenderedRows = [];

const stateBriefOverrides = {
  "New York": {
    snapshot: "Status: Online sports betting legal and live statewide; iGaming remains not yet legalized.",
    update: "Last notable update: 2025–2026 budget cycle includes renewed iGaming debate tied to state revenue pressure.",
    why: "Why it matters for Fanatics: Top-handle market with high tax pressure; iGaming legalization would materially expand LTV opportunity.",
    links: [
      { label: "NYS Gaming Commission", url: "https://gaming.ny.gov/" },
      { label: "Legal Sports Report - NY", url: "https://www.legalsportsreport.com/new-york/" }
    ]
  },
  Maine: {
    snapshot: "Status: Online sports betting legal; iGaming legalized in 2026 but rollout is pending.",
    update: "Last notable update: Jan 2026 legalization created a new iGaming pathway with implementation and legal follow-through still developing.",
    why: "Why it matters for Fanatics: Emerging dual-product state where sports presence can seed casino cross-sell if market access opens.",
    links: [
      { label: "Maine Gambling Control Unit", url: "https://www.maine.gov/dps/mgc/" },
      { label: "Action Network - Maine betting", url: "https://www.actionnetwork.com/online-sports-betting/maine" }
    ]
  }
};

function getFilters() {
  return {
    search: elements.search.value,
    sportsStatus: elements.sportsStatus.value,
    igamingStatus: elements.igamingStatus.value,
    region: elements.region.value,
    fanaticsSportsbook: elements.fanaticsSportsbook.value,
    fanaticsCasino: elements.fanaticsCasino.value,
    hasFanaticsPresence: elements.hasFanaticsPresence.checked,
    excludeLimited: elements.excludeLimited.checked,
    collegeAllowedOnly: hiddenFilters.collegeAllowedOnly,
    taxMin: hiddenFilters.taxMin,
    taxMax: Number(elements.taxMax.value)
  };
}

function runFilter(data, filters) {
  return data.filter((row) => {
    if (filters.search && row.state !== filters.search) return false;
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
    if (filters.hasFanaticsPresence && !(row.fanaticsSportsbook || row.fanaticsCasino)) return false;
    if (filters.excludeLimited && row.sports === "limited") return false;
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

function displayCollege(college) {
  if (college === "Restricted in-state" || college === "Tournament only") return "No in-state teams";
  if (college === "Restricted props") return "No props";
  return college;
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
        <td>${displayCollege(row.college)}</td>
      </tr>`
    )
    .join("");
}

function renderKPIs(rows) {
  const legalOnlineStates = rows.filter((r) => r.online && r.sports === "legal");
  const liveOrTargetStates = legalOnlineStates.filter((r) => r.fanaticsSportsbook || r.fanaticsTarget);
  const totalHandleShare = stateData.reduce((sum, row) => sum + (row.handleShare || 0), 0);
  const addressableHandleShare = liveOrTargetStates.reduce((sum, row) => sum + (row.handleShare || 0), 0);
  const legalOnlineLiveSportsbook = legalOnlineStates.filter((r) => r.fanaticsSportsbook).length;
  const whitespaceStates = legalOnlineStates.filter((r) => !r.fanaticsSportsbook).length;
  const igamingLegalStates = stateData.filter((r) => r.igaming || rowIsIGamingPending(r));
  const dualOpportunityStates = rows.filter((r) => (r.igaming || rowIsIGamingPending(r)) && (r.fanaticsSportsbook || r.fanaticsTarget));

  elements.statesCount.textContent = `${addressableHandleShare.toFixed(1)}%`;
  elements.statesMeta.textContent = `${totalHandleShare ? Math.round((addressableHandleShare / totalHandleShare) * 100) : 0}% of modeled U.S. online handle`;

  elements.onlineCount.textContent = `${legalOnlineLiveSportsbook} of ${legalOnlineStates.length}`;
  elements.onlineMeta.textContent = `${legalOnlineStates.length ? Math.round((legalOnlineLiveSportsbook / legalOnlineStates.length) * 100) : 0}% penetration • whitespace ${whitespaceStates}`;

  elements.igamingCount.textContent = `${dualOpportunityStates.length} of ${igamingLegalStates.length}`;
  elements.igamingMeta.textContent = `${igamingLegalStates.length ? Math.round((dualOpportunityStates.length / igamingLegalStates.length) * 100) : 0}% of iGaming-legal states`;

  const casinoLiveStates = rows.filter((r) => r.fanaticsCasino);
  const totalCasinoLive = stateData.filter((r) => r.fanaticsCasino).length;
  const igamingLiveStates = rows.filter((r) => r.igaming);
  const totalIgamingLive = stateData.filter((r) => r.igaming).length;
  elements.liveShareStats.textContent = `Casino live in view: ${casinoLiveStates.length}/${totalCasinoLive} (${totalCasinoLive ? Math.round((casinoLiveStates.length / totalCasinoLive) * 100) : 0}% of total live casino markets). iGaming live in view: ${igamingLiveStates.length}/${totalIgamingLive} (${totalIgamingLive ? Math.round((igamingLiveStates.length / totalIgamingLive) * 100) : 0}% of total live iGaming markets).`;

  const underTax = stateData.filter((r) => r.tax === null || r.tax <= Number(elements.taxMax.value));
  const underTaxLive = underTax.filter((r) => r.fanaticsSportsbook).length;
  elements.taxFilterMeta.textContent = `${underTax.length} of ${stateData.length} jurisdictions, ${underTaxLive} with Fanatics Sportsbook live under this tax ceiling.`;
}

function rowIsIGamingPending(row) {
  return row.igamingStatus === "pending";
}

function getBriefForRow(row) {
  if (stateBriefOverrides[row.state]) return stateBriefOverrides[row.state];
  const igamingDescriptor = row.igaming ? "iGaming legal and live" : row.igamingStatus === "pending" ? "iGaming approved/pending launch" : "iGaming not legal";
  return {
    snapshot: `Status: ${row.sports === "legal" ? "Online sports legal" : row.sports === "limited" ? "Limited sports market" : "Sports betting not legal"}; ${igamingDescriptor}. Tax: ${displayTax(row)}.`,
    update: "Last notable update: monitor state regulator and legislative calendars for 2025–2026 policy movement.",
    why: `Why it matters for Fanatics: ${row.fanaticsSportsbook ? "live sportsbook footprint exists" : row.fanaticsTarget ? "target expansion candidate" : "currently outside near-term footprint"} with handle tier ${displayHandleTier(row)}.`,
    links: [
      { label: "State regulator resources", url: "https://www.ncsl.org/fiscal/seven-years-of-sports-betting-did-states-get-it-right" }
    ]
  };
}

function renderPolicyBrief(rows) {
  const selectedState = elements.stateBriefSelect.value;
  elements.stateBriefSelect.innerHTML = rows.map((row) => `<option value="${row.state}">${row.state}</option>`).join("");
  if (!rows.length) {
    elements.briefSnapshot.textContent = "No states in view.";
    elements.briefUpdate.textContent = "";
    elements.briefWhy.textContent = "";
    elements.briefLinks.innerHTML = "";
    return;
  }
  const targetState = rows.find((row) => row.state === selectedState) || rows[0];
  elements.stateBriefSelect.value = targetState.state;
  const brief = getBriefForRow(targetState);
  elements.briefSnapshot.textContent = brief.snapshot;
  elements.briefUpdate.textContent = brief.update;
  elements.briefWhy.textContent = brief.why;
  elements.briefLinks.innerHTML = brief.links.map((link) => `<li><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label}</a></li>`).join("");
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
      `High Tax Risk: tax rates ${HIGH_TAX_PRESET_MIN}% and above that may compress margin and require different promo/pricing strategy.`,
    "college-safe":
      "College-Friendly: legal online states with college betting allowed to support compliant college-themed campaigns.",
    "white-space":
      "Whitespace Expansion: legal online states where Fanatics Sportsbook is not yet live, prioritized for expansion mapping.",
    "cross-sell":
      "Cross-Sell Core: iGaming-legal states where Fanatics can maximize sportsbook-to-casino lifetime value."
  };

  elements.presetNarrative.textContent = narratives[activePreset] || narratives.none;
}

function renderTableSummary(rows) {
  const taxRows = rows.filter((r) => r.tax !== null);
  const averageTax = taxRows.length ? (taxRows.reduce((sum, row) => sum + row.tax, 0) / taxRows.length).toFixed(1) : "N/A";
  const liveSportsbook = rows.filter((r) => r.fanaticsSportsbook).length;
  const liveCasino = rows.filter((r) => r.fanaticsCasino).length;
  const collegeAllowed = rows.filter((r) => r.college === "Allowed").length;
  const igamingLegal = rows.filter((r) => r.igaming).length;
  const collegeProhibited = rows.filter((r) => r.college === "No college betting").length;
  const limitedMarkets = rows.filter((r) => r.sports === "limited").length;
  const viewLabel =
    activePreset === "none"
      ? "All jurisdictions view"
      : `${activePreset.replace("-", " ")} view`;

  elements.tableSummaryRow.innerHTML = `<td colspan="10"><strong>${viewLabel}</strong> • Avg tax: ${averageTax === "N/A" ? averageTax : `${averageTax}%`} • Jurisdictions: ${rows.length} • Live sportsbook: ${liveSportsbook} • Live casino: ${liveCasino} • iGaming legal: ${igamingLegal} • College allowed: ${collegeAllowed} • College prohibited: ${collegeProhibited} • Limited/state-run: ${limitedMarkets}</td>`;
}

function renderMajorPolicyCallout(rows) {
  const updates = rows.filter((row) => row.majorPolicyUpdate).map((row) => `${row.state}: ${row.majorPolicyUpdate}`);
  if (!updates.length) {
    elements.majorPolicyCallout.textContent = "";
    return;
  }
  elements.majorPolicyCallout.textContent = `Major paid-media policy updates: ${updates.slice(0, 2).join(" | ")}`;
}

function compareValues(a, b, direction = "asc") {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (a < b) return direction === "asc" ? -1 : 1;
  return direction === "asc" ? 1 : -1;
}

function getSortValue(row, key) {
  if (key === "state") return row.state;
  if (key === "region") return row.region;
  if (key === "sports") return { legal: 0, limited: 1, illegal: 2 }[row.sports];
  if (key === "online") return row.online ? 0 : 1;
  if (key === "igaming") return row.igaming ? 0 : row.igamingStatus === "pending" ? 1 : 2;
  if (key === "fanaticsSportsbook") return row.fanaticsSportsbook ? 0 : 1;
  if (key === "fanaticsCasino") return row.fanaticsCasino ? 0 : 1;
  if (key === "tax") return row.tax;
  if (key === "handleTier") return { T1: 0, T2: 1, T3: 2 }[row.handleTier] ?? 3;
  if (key === "college") return displayCollege(row.college);
  return row.state;
}

function applySort(rows) {
  const data = [...rows];

  if (elements.groupByRegion.checked) {
    data.sort((a, b) => compareValues(a.region, b.region, "asc") || compareValues(a.state, b.state, "asc"));
  }

  const { key, direction } = activeSort;
  if (!key) return data;

  return data.sort((a, b) => {
    const primary = compareValues(getSortValue(a, key), getSortValue(b, key), direction);
    if (primary !== 0) return primary;
    return compareValues(a.state, b.state, "asc");
  });
}

function updateSortIndicators() {
  elements.sortButtons.forEach((button) => {
    const key = button.dataset.sortKey;
    const indicator = button.querySelector(".sort-indicator");
    button.classList.remove("active");
    indicator.textContent = "";
    if (activeSort.key === key) {
      button.classList.add("active");
      indicator.textContent = activeSort.direction === "asc" ? "↑" : "↓";
    }
  });
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
  const sorted = applySort(filtered);
  renderRows(sorted);
  renderKPIs(sorted);
  renderDerivedStats(sorted);
  renderFilterText(filters);
  renderPresetNarrative();
  renderTableSummary(sorted);
  renderMajorPolicyCallout(sorted);
  renderPolicyBrief(sorted);
  updateSortIndicators();
  elements.taxMaxLabel.textContent = `${filters.taxMax}%`;
  lastRenderedRows = sorted;
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
  elements.hasFanaticsPresence.checked = newFilters.hasFanaticsPresence;
  elements.excludeLimited.checked = newFilters.excludeLimited;
  elements.taxMax.value = newFilters.taxMax;
  render();
}

function applyPreset(name) {
  activePreset = name;
  const presets = {
    "launch-now": { ...defaultFilters, sportsStatus: "legal", fanaticsSportsbook: "yes", taxMax: 20, hasFanaticsPresence: true },
    "igaming-focus": { ...defaultFilters, igamingStatus: "yes" },
    "high-tax": { ...defaultFilters, taxMin: HIGH_TAX_PRESET_MIN, taxMax: defaultFilters.taxMax },
    "college-safe": { ...defaultFilters, sportsStatus: "legal", collegeAllowedOnly: true, search: "" },
    "white-space": { ...defaultFilters, sportsStatus: "legal", fanaticsSportsbook: "no", excludeLimited: true },
    "cross-sell": { ...defaultFilters, igamingStatus: "yes", fanaticsSportsbook: "yes" }
  };

  if (name === "high-tax") activeSort = { key: "tax", direction: "desc" };
  if (name === "launch-now") activeSort = { key: "handleTier", direction: "asc" };
  if (name === "igaming-focus") activeSort = { key: "fanaticsCasino", direction: "desc" };
  if (name === "college-safe") activeSort = { key: "state", direction: "asc" };
  if (name === "white-space") activeSort = { key: "handleTier", direction: "asc" };
  if (name === "cross-sell") activeSort = { key: "fanaticsCasino", direction: "desc" };
  elements.primarySort.value = activeSort.key ? `${activeSort.key}:${activeSort.direction}` : "none";

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
  elements.hasFanaticsPresence,
  elements.excludeLimited,
  elements.primarySort,
  elements.groupByRegion,
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

elements.primarySort.addEventListener("change", () => {
  if (elements.primarySort.value === "none") {
    activeSort = { key: null, direction: "asc" };
  } else {
    const [key, direction] = elements.primarySort.value.split(":");
    activeSort = { key, direction };
  }
  activePreset = "none";
  render();
});

elements.sortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.sortKey;
    if (activeSort.key !== key) {
      activeSort = { key, direction: "asc" };
    } else if (activeSort.direction === "asc") {
      activeSort = { key, direction: "desc" };
    } else {
      activeSort = { key: null, direction: "asc" };
    }
    elements.primarySort.value = activeSort.key ? `${activeSort.key}:${activeSort.direction}` : "none";
    activePreset = "none";
    render();
  });
});

elements.resetBtn.addEventListener("click", () => setFilters(defaultFilters));
elements.copyBtn.addEventListener("click", copySummary);

elements.presetButtons.forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});

elements.stateBriefSelect.addEventListener("change", () => {
  renderPolicyBrief(lastRenderedRows);
});

elements.primarySort.value = "state:asc";
elements.lastUpdatedDate.textContent = typeof dataLastUpdated === "string" ? dataLastUpdated : new Date().toISOString().slice(0, 10);

stateData
  .map((row) => row.state)
  .sort((a, b) => a.localeCompare(b))
  .forEach((state) => {
    const option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    elements.search.appendChild(option);
  });

elements.refreshBtn.addEventListener("click", () => {
  showCopyToast("Refreshing and reloading latest available dataset...");
  setTimeout(() => window.location.reload(), 200);
});

setFilters(defaultFilters);
