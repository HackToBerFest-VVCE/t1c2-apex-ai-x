import { RISK, riskColor, riskBadgeBg } from "@/lib/risk";

export default function RiskBadge({ level, size = "md", testId }) {
  const color = riskColor(level);
  const bg = riskBadgeBg(level);
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : size === "lg" ? "px-5 py-2.5 text-base" : "px-3.5 py-1.5 text-sm";
  return (
    <span
      data-testid={testId}
      className={`inline-flex items-center rounded-full font-semibold font-display ${pad}`}
      style={{ backgroundColor: color, color: level === "Moderate" ? "#1a1000" : "#fff" }}
    >
      {(RISK[level] || RISK.Low).label}
    </span>
  );
}
