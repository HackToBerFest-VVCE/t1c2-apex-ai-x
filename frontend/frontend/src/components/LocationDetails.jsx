import { useNavigate } from "react-router-dom";
import { X, Milestone, Home, Building2, ArrowRight } from "lucide-react";
import { riskColor } from "@/lib/risk";
import { useApp } from "@/context/AppContext";

export default function LocationDetails({ location, onClose }) {
  const navigate = useNavigate();
  const { setSelectedLocationId } = useApp();
  if (!location) return null;
  const color = riskColor(location.riskLevel);

  const goAnalysis = () => {
    setSelectedLocationId(location.id);
    navigate("/risk-analysis");
  };

  return (
    <div className="glass rounded-2xl p-5 w-[320px] max-w-[calc(100vw-2rem)] shadow-2xl animate-fade-up" data-testid="location-details-panel">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Location Details</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white" data-testid="location-details-close">
          <X className="h-5 w-5" />
        </button>
      </div>

      <h3 className="font-display text-2xl font-bold text-white mt-2">{location.name}, {location.state}</h3>
      <span className="inline-flex mt-3 rounded-full px-4 py-1.5 text-sm font-semibold text-white" style={{ backgroundColor: color }}>
        {location.riskLevel} Risk
      </span>

      <div className="mt-5">
        <div className="text-sm text-slate-400">Risk Score</div>
        <div className="font-display text-3xl font-extrabold text-white mt-1">{location.riskScore} <span className="text-lg text-slate-400">/ 100</span></div>
        <div className="mt-2 h-2.5 rounded-full bg-slate-700/50 overflow-hidden">
          <div className="h-full rounded-full grow-bar" style={{ width: `${location.riskScore}%`, backgroundColor: color }} />
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-blue-900/30">
        <div className="text-sm font-semibold text-slate-200 mb-3">Potential Impact</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { icon: Milestone, label: "Roads", value: location.roads },
            { icon: Home, label: "Villages", value: location.villages },
            { icon: Building2, label: "Infrastructure", value: location.infrastructure },
          ].map((it) => {
            const Icon = it.icon;
            return (
              <div key={it.label}>
                <Icon className="h-6 w-6 mx-auto text-slate-300" />
                <div className="text-[11px] text-slate-400 mt-1.5">{it.label}</div>
                <div className="font-display text-xl font-bold text-white">{it.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={goAnalysis}
        data-testid="location-view-analysis-btn"
        className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 transition-colors"
      >
        View Full Analysis <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
