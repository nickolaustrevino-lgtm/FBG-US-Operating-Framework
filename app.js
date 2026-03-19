const elements = {
  search: document.getElementById("search"),
  sportsStatus: document.getElementById("sportsStatus"),
  igamingStatus: document.getElementById("igamingStatus"),
  region: document.getElementById("region"),
  taxMax: document.getElementById("taxMax"),
  taxMaxLabel: document.getElementById("taxMaxLabel"),
  rows: document.getElementById("stateRows"),
  statesCount: document.getElementById("statesCount"),
  onlineCount: document.getElementById("onlineCount"),
  igamingCount: document.getElementById("igamingCount"),
  activeFilterText: document.getElementById("activeFilterText"),
  resetBtn: document.getElementById("resetBtn"),
  copyBtn: document.getElementById("copyBtn"),
  copyToast: document.getElementById("copyToast"),
  presetButtons: document.querySelectorAll("[data-preset]")
};

const defaultFilters = {
  search: "",
  sportsStatus: "all",
  igamingStatus: "all",
  region: "all",
  collegeAllowedOnly: false,
  taxMin: 0,
  taxMax: 60
};

const hiddenFilters = {
  collegeAllowedOnly: defaultFilters.collegeAllowedOnly,
  taxMin: defaultFilters.taxMin
};

function getFilters() {
  return {
    search: elements.search.value.trim().toLowerCase(),
    sportsStatus: elements.sportsStatus.value,
    igamingStatus: elements.igamingStatus.value,
    region: elements.region.value,
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

function renderRows(rows) {
  if (!rows.length) {
    elements.rows.innerHTML = `<tr><td colspan="7" class="empty">No states matched. Try broadening the filters.</td></tr>`;
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
        <td>${displayTax(row)}</td>
        <td>${row.college}</td>
      </tr>`
    )
    .join("");
}

function renderKPIs(rows) {
  elements.statesCount.textContent = rows.length;
  elements.onlineCount.textContent = rows.filter((r) => r.online).length;
  elements.igamingCount.textContent = rows.filter((r) => r.igaming).length;
}

function renderFilterText(filters) {
  const parts = [];
  if (filters.search) parts.push(`Search: "${filters.search}"`);
  if (filters.sportsStatus !== "all") parts.push(`Sports: ${filters.sportsStatus}`);
  if (filters.igamingStatus !== "all") parts.push(`iGaming: ${filters.igamingStatus}`);
  if (filters.region !== "all") parts.push(`Region: ${filters.region}`);
  if (filters.collegeAllowedOnly) parts.push("College betting: Allowed only");
  if (filters.taxMin > 0) parts.push(`Min tax: ${filters.taxMin}%`);
  if (filters.taxMax < 60) parts.push(`Max tax: ${filters.taxMax}%`);

  elements.activeFilterText.textContent = parts.length ? parts.join(" • ") : "No filters applied.";
}

function render() {
  const filters = getFilters();
  const filtered = runFilter(stateData, filters);
  renderRows(filtered);
  renderKPIs(filtered);
  renderFilterText(filters);
  elements.taxMaxLabel.textContent = `${filters.taxMax}%`;
}

function setFilters(newFilters) {
  hiddenFilters.collegeAllowedOnly = newFilters.collegeAllowedOnly ?? defaultFilters.collegeAllowedOnly;
  hiddenFilters.taxMin = newFilters.taxMin ?? defaultFilters.taxMin;
  elements.search.value = newFilters.search;
  elements.sportsStatus.value = newFilters.sportsStatus;
  elements.igamingStatus.value = newFilters.igamingStatus;
  elements.region.value = newFilters.region;
  elements.taxMax.value = newFilters.taxMax;
  render();
}

function applyPreset(name) {
  const presets = {
    "launch-now": { ...defaultFilters, sportsStatus: "legal" },
    "igaming-focus": { ...defaultFilters, igamingStatus: "yes" },
    "high-tax": { ...defaultFilters, taxMin: 20, taxMax: 60 },
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
  const summary = `FBG Market Filter Studio\nStates: ${filtered.length}\nOnline sports: ${filtered.filter((r) => r.online).length}\niGaming: ${filtered.filter((r) => r.igaming).length}\nFilters: ${elements.activeFilterText.textContent}`;

  try {
    await navigator.clipboard.writeText(summary);
    elements.copyBtn.textContent = "Copied";
    showCopyToast("View summary copied to clipboard.");
    setTimeout(() => {
      elements.copyBtn.textContent = "Copy view summary";
    }, 1200);
  } catch {
    elements.copyBtn.textContent = "Clipboard blocked";
    showCopyToast("Clipboard access is blocked in this browser.", true);
    setTimeout(() => {
      elements.copyBtn.textContent = "Copy view summary";
    }, 1200);
  }
}

[
  elements.search,
  elements.sportsStatus,
  elements.igamingStatus,
  elements.region,
  elements.taxMax
].forEach((element) => {
  element.addEventListener("input", render);
  element.addEventListener("change", render);
});

elements.resetBtn.addEventListener("click", () => setFilters(defaultFilters));
elements.copyBtn.addEventListener("click", copySummary);

elements.presetButtons.forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});

setFilters(defaultFilters);
