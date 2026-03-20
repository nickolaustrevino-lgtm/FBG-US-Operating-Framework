const dataLastUpdated = "March 20, 2026";

const stateData = [
  { state: "Alabama", region: "South", sports: "illegal", online: false, igaming: false, tax: null, college: "N/A" },
  { state: "Alaska", region: "West", sports: "illegal", online: false, igaming: false, tax: null, college: "N/A" },
  { state: "Arizona", region: "West", sports: "legal", online: true, igaming: false, tax: 10, handleTier: "T2", college: "Allowed" },
  { state: "Arkansas", region: "South", sports: "legal", online: true, igaming: false, tax: 51, handleTier: "T3", college: "Allowed" },
  { state: "California", region: "West", sports: "illegal", online: false, igaming: false, tax: null, college: "N/A" },
  { state: "Colorado", region: "West", sports: "legal", online: true, igaming: false, tax: 10, handleTier: "T2", college: "Restricted props" },
  { state: "Connecticut", region: "Northeast", sports: "legal", online: true, igaming: true, tax: 13.75, handleTier: "T3", college: "Restricted in-state" },
  { state: "Delaware", region: "Northeast", sports: "legal", online: true, igaming: true, tax: 50, handleTier: "T3", college: "Restricted in-state" },
  { state: "Florida", region: "South", sports: "limited", online: true, onlineNote: "Hard Rock only", igaming: false, tax: 15, handleTier: "T3", college: "Allowed" },
  { state: "Georgia", region: "South", sports: "illegal", online: false, igaming: false, tax: null, college: "N/A" },
  { state: "Hawaii", region: "West", sports: "illegal", online: false, igaming: false, tax: null, college: "N/A" },
  { state: "Idaho", region: "West", sports: "illegal", online: false, igaming: false, tax: null, college: "N/A" },
  { state: "Illinois", region: "Midwest", sports: "legal", online: true, igaming: false, tax: 40, handleTier: "T1", college: "Restricted in-state", majorPolicyUpdate: "Progressive tax structure remains a major paid-media margin constraint." },
  { state: "Indiana", region: "Midwest", sports: "legal", online: true, igaming: false, tax: 9.5, handleTier: "T3", college: "Restricted props" },
  { state: "Iowa", region: "Midwest", sports: "legal", online: true, igaming: false, tax: 6.75, handleTier: "T3", college: "Restricted props" },
  { state: "Kansas", region: "Midwest", sports: "legal", online: true, igaming: false, tax: 10, handleTier: "T3", college: "Restricted props" },
  { state: "Kentucky", region: "South", sports: "legal", online: true, igaming: false, tax: 14.25, handleTier: "T3", college: "Allowed" },
  { state: "Louisiana", region: "South", sports: "legal", online: true, igaming: false, tax: 15, handleTier: "T3", college: "Allowed" },
  { state: "Maine", region: "Northeast", sports: "legal", online: true, igaming: false, igamingStatus: "pending", tax: 16, handleTier: "T3", college: "Restricted in-state", majorPolicyUpdate: "iGaming legalization pathway opened in 2026; launch timing remains a watchpoint." },
  { state: "Maryland", region: "South", sports: "legal", online: true, igaming: false, tax: 20, handleTier: "T2", college: "Restricted props" },
  { state: "Massachusetts", region: "Northeast", sports: "legal", online: true, igaming: false, tax: 20, handleTier: "T2", college: "Tournament only" },
  { state: "Michigan", region: "Midwest", sports: "legal", online: true, igaming: true, tax: 8.4, handleTier: "T3", college: "Restricted props" },
  { state: "Minnesota", region: "Midwest", sports: "illegal", online: false, igaming: false, tax: null, college: "N/A" },
  { state: "Mississippi", region: "South", sports: "limited", online: false, igaming: false, tax: 12, college: "Restricted props" },
  { state: "Missouri", region: "Midwest", sports: "legal", online: true, igaming: false, tax: 10, handleTier: "T3", college: "Restricted in-state" },
  { state: "Montana", region: "West", sports: "limited", online: false, igaming: false, tax: 20, college: "Allowed" },
  { state: "Nebraska", region: "Midwest", sports: "limited", online: false, igaming: false, tax: 20, college: "Restricted in-state" },
  { state: "Nevada", region: "West", sports: "legal", online: true, igaming: false, tax: 6.75, handleTier: "T2", college: "Allowed" },
  { state: "New Hampshire", region: "Northeast", sports: "legal", online: true, igaming: false, tax: 51, handleTier: "T3", college: "Restricted in-state" },
  { state: "New Jersey", region: "Northeast", sports: "legal", online: true, igaming: true, tax: 19.75, handleTier: "T1", college: "Restricted props" },
  { state: "New Mexico", region: "West", sports: "limited", online: false, igaming: false, tax: 10, college: "Allowed" },
  { state: "New York", region: "Northeast", sports: "legal", online: true, igaming: false, tax: 51, handleTier: "T1", college: "Restricted in-state", majorPolicyUpdate: "Renewed iGaming budget debate could materially shift paid-media scale assumptions." },
  { state: "North Carolina", region: "South", sports: "legal", online: true, igaming: false, tax: 18, handleTier: "T2", college: "Restricted props" },
  { state: "North Dakota", region: "Midwest", sports: "limited", online: false, igaming: false, tax: 10, college: "Restricted in-state" },
  { state: "Ohio", region: "Midwest", sports: "legal", online: true, igaming: false, tax: 20, handleTier: "T2", college: "Restricted props" },
  { state: "Oklahoma", region: "South", sports: "illegal", online: false, igaming: false, tax: null, college: "N/A" },
  { state: "Oregon", region: "West", sports: "legal", online: true, onlineNote: "State-run only", igaming: false, tax: 51, handleTier: "T3", college: "No college betting" },
  { state: "Pennsylvania", region: "Northeast", sports: "legal", online: true, igaming: true, tax: 36, handleTier: "T2", college: "Restricted props" },
  { state: "Rhode Island", region: "Northeast", sports: "legal", online: true, igaming: true, tax: 51, handleTier: "T3", college: "Restricted in-state" },
  { state: "South Carolina", region: "South", sports: "illegal", online: false, igaming: false, tax: null, college: "N/A" },
  { state: "South Dakota", region: "Midwest", sports: "limited", online: false, igaming: false, tax: 10, college: "Restricted in-state" },
  { state: "Tennessee", region: "South", sports: "legal", online: true, igaming: false, tax: 1.85, taxNote: "handle tax", handleTier: "T3", college: "Restricted props" },
  { state: "Texas", region: "South", sports: "illegal", online: false, igaming: false, tax: null, college: "N/A" },
  { state: "Utah", region: "West", sports: "illegal", online: false, igaming: false, tax: null, college: "N/A" },
  { state: "Vermont", region: "Northeast", sports: "legal", online: true, igaming: false, tax: 20, handleTier: "T3", college: "Restricted props" },
  { state: "Virginia", region: "South", sports: "legal", online: true, igaming: false, tax: 15, handleTier: "T2", college: "Restricted in-state", majorPolicyUpdate: "iGaming discussion remains active in policy circles and warrants media-planning monitoring." },
  { state: "Washington", region: "West", sports: "limited", online: false, igaming: false, tax: 10, college: "Allowed" },
  { state: "Washington D.C.", region: "Mid-Atlantic", sports: "legal", online: true, igaming: false, tax: 20, handleTier: "T3", college: "Restricted props" },
  { state: "West Virginia", region: "South", sports: "legal", online: true, igaming: true, tax: 10, handleTier: "T3", college: "Restricted props" },
  { state: "Wisconsin", region: "Midwest", sports: "limited", online: false, igaming: false, tax: 10, college: "Allowed" },
  { state: "Wyoming", region: "West", sports: "legal", online: true, igaming: false, tax: 10, handleTier: "T3", college: "Allowed" }
];

const fanaticsSportsbookStates = new Set([
  "Arizona",
  "Colorado",
  "Connecticut",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Missouri",
  "New Jersey",
  "New York",
  "North Carolina",
  "Ohio",
  "Pennsylvania",
  "Tennessee",
  "Vermont",
  "Virginia",
  "Washington D.C.",
  "West Virginia",
  "Wyoming"
]);

const fanaticsCasinoStates = new Set(["Michigan", "New Jersey", "Pennsylvania", "West Virginia"]);
const fanaticsTargetStates = new Set(["Connecticut", "Iowa", "Kansas", "Louisiana", "Massachusetts", "Nevada", "Vermont", "Washington D.C."]);
const handleShareOverrides = {
  "New York": 16.0,
  Illinois: 9.5,
  "New Jersey": 7.4
};

stateData.forEach((row) => {
  row.fanaticsSportsbook = fanaticsSportsbookStates.has(row.state);
  row.fanaticsCasino = fanaticsCasinoStates.has(row.state);
  row.fanaticsTarget = fanaticsTargetStates.has(row.state);
  if (!row.online || row.sports !== "legal") {
    row.handleShare = 0;
    return;
  }
  if (handleShareOverrides[row.state] !== undefined) {
    row.handleShare = handleShareOverrides[row.state];
    return;
  }
  row.handleShare = row.handleTier === "T2" ? 4 : row.handleTier === "T3" ? 1 : 0;
});
