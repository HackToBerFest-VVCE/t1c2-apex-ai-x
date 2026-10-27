import { CloudRain, Droplet, TrendingUp, Leaf, Activity } from "lucide-react";
import { severityLabel } from "@/lib/risk";

const ICONS = { CloudRain, Droplet, TrendingUp, Leaf, Activity };

export default function FactorRow({ meta, value, delay = 0 }) {
  const Icon = ICONS[meta.icon] || Activity;
  const sev = severityLabel(value);
  const sevColor = sev === "High" ? "#FF8A00" : sev === "Moderate" ? "#FFD21C" : "#42D321";
  return (
    <div className="flex items-center gap-2.5 sm:gap-4 py-3.5 min-w-0" data-testid={`factor-row-${meta.key}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${meta.color}22` }}>
        <Icon className="h-5 w-5" style={{ color: meta.color }} />
      </span>
      <div className="w-24 sm:w-44 shrink-0 text-sm sm:text-base text-slate-100 font-medium truncate">{meta.label}</div>
      <div className="w-14 sm:w-20 shrink-0 text-sm font-semibold" style={{ color: sevColor }}>{sev}</div>
      <div className="flex-1 min-w-0 h-2.5 rounded-full bg-slate-700/50 overflow-hidden">
        <div className="h-full rounded-full grow-bar" style={{ width: `${value}%`, backgroundColor: meta.color, animationDelay: `${delay}ms` }} />
      </div>
      <div className="w-10 sm:w-12 shrink-0 text-right font-semibold text-white text-sm">{value}%</div>
    </div>
  );
}
