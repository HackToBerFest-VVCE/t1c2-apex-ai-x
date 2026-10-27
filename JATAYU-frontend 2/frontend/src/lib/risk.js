// Shared risk config + helpers used across all pages

export const RISK = {
  "Very High": { key: "very-high", color: "#FF2020", label: "Very High Risk", badgeBg: "rgba(255,32,32,0.18)" },
  High: { key: "high", color: "#FF8A00", label: "High Risk", badgeBg: "rgba(255,138,0,0.18)" },
  Moderate: { key: "moderate", color: "#FFD21C", label: "Moderate Risk", badgeBg: "rgba(255,210,28,0.16)" },
  Low: { key: "low", color: "#42D321", label: "Low Risk", badgeBg: "rgba(66,211,33,0.16)" },
};

export const RISK_ORDER = ["Very High", "High", "Moderate", "Low"];

export const riskColor = (lvl) => (RISK[lvl] || RISK.Low).color;
export const riskBadgeBg = (lvl) => (RISK[lvl] || RISK.Low).badgeBg;

export const levelFromScore = (s) =>
  s >= 80 ? "Very High" : s >= 65 ? "High" : s >= 45 ? "Moderate" : "Low";

export const severityLabel = (p) => (p >= 75 ? "High" : p >= 45 ? "Moderate" : "Low");
export const severityColor = (p) => (p >= 75 ? "#FF8A00" : p >= 45 ? "#FFD21C" : "#42D321");

// Deterministic pseudo-random for stable synthetic map points
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate synthetic landslide susceptibility points clustered around locations
export function generateRiskPoints(locations) {
  const rand = mulberry32(20250503);
  const pts = [];
  locations.forEach((loc, li) => {
    const count = loc.riskLevel === "Very High" ? 26 : loc.riskLevel === "High" ? 20 : loc.riskLevel === "Moderate" ? 14 : 8;
    for (let i = 0; i < count; i++) {
      const spread = 0.55;
      const lat = loc.latitude + (rand() - 0.5) * spread;
      const lng = loc.longitude + (rand() - 0.5) * spread;
      const d = rand();
      let level = loc.riskLevel;
      if (d > 0.78) level = "Moderate";
      else if (d > 0.62) level = level === "Very High" ? "High" : level;
      pts.push({ id: `${li}-${i}`, lat, lng, level });
    }
  });
  // background low/moderate scatter across NER bounding box
  for (let i = 0; i < 120; i++) {
    const lat = 22.6 + rand() * 6.0;
    const lng = 89.8 + rand() * 8.0;
    const d = rand();
    const level = d > 0.85 ? "Moderate" : "Low";
    pts.push({ id: `bg-${i}`, lat, lng, level });
  }
  return pts;
}

// Rainfall overlay points (blue intensity)
export function generateRainfallPoints() {
  const rand = mulberry32(88123);
  const pts = [];
  for (let i = 0; i < 90; i++) {
    const lat = 23.0 + rand() * 5.2;
    const lng = 90.0 + rand() * 7.5;
    pts.push({ id: `rain-${i}`, lat, lng, intensity: 0.3 + rand() * 0.7 });
  }
  return pts;
}
