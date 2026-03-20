 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/app.js b/app.js
index b5dc3d98179f0168b6c492fdb5e700b9b6a7d52c..22c24e79ccf702b7753178789366aa7a694fefd6 100644
--- a/app.js
+++ b/app.js
@@ -1,29 +1,28 @@
 const elements = {
   search: document.getElementById("search"),
   lastUpdatedDate: document.getElementById("lastUpdatedDate"),
-  refreshBtn: document.getElementById("refreshBtn"),
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
@@ -37,50 +36,52 @@ const elements = {
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
 
+const HIGH_TAX_PRESET_MIN = 36;
+
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
 
@@ -267,51 +268,51 @@ function renderPolicyBrief(rows) {
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
-      "High Tax Risk: high-tax environments that may compress margin and require different promo/pricing strategy.",
+      `High Tax Risk: tax rates ${HIGH_TAX_PRESET_MIN}% and above that may compress margin and require different promo/pricing strategy.`,
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
 
@@ -412,51 +413,51 @@ function render() {
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
-    "high-tax": { ...defaultFilters, taxMin: 36, taxMax: 60 },
+    "high-tax": { ...defaultFilters, taxMin: HIGH_TAX_PRESET_MIN, taxMax: defaultFilters.taxMax },
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
@@ -545,31 +546,26 @@ elements.sortButtons.forEach((button) => {
 
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
 
-elements.refreshBtn.addEventListener("click", () => {
-  showCopyToast("Refreshing and reloading latest available dataset...");
-  setTimeout(() => window.location.reload(), 200);
-});
-
 setFilters(defaultFilters);
 
EOF
)
