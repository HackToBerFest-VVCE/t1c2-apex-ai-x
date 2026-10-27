import { useNavigate } from "react-router-dom";
import { AlertTriangle, Flame, Home, Shield, Bell, ArrowRight } from "lucide-react";
import DonutChart from "@/components/DonutChart";
import { LOCATIONS } from "@/data/locations";
import { ALERTS } from "@/data/alerts";
import { riskColor } from "@/lib/risk";
import { useApp } from "@/context/AppContext";

const STATS = [
  { level: "Very High", label: "Very High Risk", value: 12, unit: "Areas", icon: AlertTriangle, color: "#FF2020" },
  { level: "High", label: "High Risk", value: 27, unit: "Areas", icon: Flame, color: "#FF8A00" },
  { level: "Moderate", label: "Moderate Risk", value: 64, unit: "Areas", icon: Home, color: "#FFD21C" },
  { level: "Low", label: "Low Risk", value: 148, unit: "Areas", icon: Shield, color: "#42D321" },
  { level: "Alerts", label: "Active Alerts", value: 8, unit: "Alerts", icon: Bell, color: "#A855F7" },
];

const DONUT = [
  { name: "Very High", value: 12 },
  { name: "High", value: 27 },
  { name: "Moderate", value: 64 },
  { name: "Low", value: 148 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { setSelectedLocationId } = useApp();

  const openAlert = (a) => {
    setSelectedLocationId(a.locationId);
    navigate("/risk-analysis");
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              data-testid={`stat-card-${s.label.toLowerCase().replace(/ /g, "-")}`}
              className="glass glass-hover rounded-2xl p-5 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms`, boxShadow: `inset 0 0 0 1px ${s.color}22, 0 0 24px ${s.color}12` }}
            >
              <div className="text-sm font-semibold text-slate-200">{s.label}</div>
              <div className="flex items-center gap-3 mt-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ backgroundColor: `${s.color}1f` }}>
                  <Icon className="h-6 w-6" style={{ color: s.color }} />
                </span>
                <div>
                  <div className="font-display text-3xl font-extrabold leading-none" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.unit}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* two column */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Risk overview */}
        <div className="glass rounded-2xl p-6 animate-fade-up">
          <h2 className="font-display text-xl font-bold text-white mb-4">Risk Overview (NER)</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/2"><DonutChart data={DONUT} total={251} /></div>
            <div className="w-full sm:w-1/2 space-y-3">
              {DONUT.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: riskColor(d.name) }} />
                    <span className="text-slate-200">{d.name}</span>
                  </div>
                  <span className="font-display font-bold text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent alerts */}
        <div className="glass rounded-2xl p-6 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-white">Recent Alerts</h2>
            <button onClick={() => navigate("/alerts")} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 font-medium" data-testid="view-all-alerts">
              View All Alerts <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-blue-900/30">
            {ALERTS.slice(0, 5).map((a) => (
              <button
                key={a.id}
                onClick={() => openAlert(a)}
                data-testid={`recent-alert-${a.locationId}`}
                className="w-full flex items-center gap-3 py-3.5 text-left hover:bg-white/5 rounded-lg px-2 -mx-2 transition"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${riskColor(a.riskLevel)}22` }}>
                  <Bell className="h-5 w-5" style={{ color: riskColor(a.riskLevel) }} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold" style={{ color: riskColor(a.riskLevel) }}>{a.riskLevel} Risk</div>
                  <div className="text-sm text-slate-400 truncate">{a.name}, {a.state}</div>
                </div>
                <span className="text-sm text-slate-400 shrink-0">{a.time}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
