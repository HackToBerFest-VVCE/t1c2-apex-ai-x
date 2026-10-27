import { useNavigate } from "react-router-dom";
import { CloudRain, Droplet, TrendingUp, Leaf, Activity, Milestone, Home, Building2, Mountain, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";

const LAYERS = [
  { key: "landslideRisk", label: "Landslide Risk", desc: "Susceptibility zones & heatmap", icon: Mountain, color: "#FF2020", mapped: true },
  { key: "rainfall", label: "Rainfall", desc: "72-hour accumulation overlay", icon: CloudRain, color: "#3B82F6", mapped: true },
  { key: "soilMoisture", label: "Soil Moisture", desc: "Sub-surface saturation index", icon: Droplet, color: "#38BDF8" },
  { key: "slopeGradient", label: "Slope Gradient", desc: "Terrain steepness mesh", icon: TrendingUp, color: "#FFD21C" },
  { key: "landCover", label: "Land Cover", desc: "Vegetation & deforestation change", icon: Leaf, color: "#42D321" },
  { key: "earthquake", label: "Earthquake Activity", desc: "Recent seismic events", icon: Activity, color: "#A855F7" },
  { key: "roads", label: "Roads", desc: "Highway & road corridors", icon: Milestone, color: "#F97316" },
  { key: "villages", label: "Villages", desc: "Settlement markers", icon: Home, color: "#E2E8F0", mapped: true },
  { key: "infrastructure", label: "Infrastructure", desc: "Critical facilities", icon: Building2, color: "#60A5FA" },
];

export default function DataLayers() {
  const { layers, toggleLayer } = useApp();
  const navigate = useNavigate();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-slate-400 text-sm">Toggle layers to control what appears on the interactive map.</p>
        <button onClick={() => navigate("/map")} className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium" data-testid="datalayers-open-map">
          Open Map <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {LAYERS.map((l, i) => {
          const Icon = l.icon;
          const on = layers[l.key];
          return (
            <div key={l.key} className="glass rounded-2xl p-5 flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }} data-testid={`datalayer-${l.key}`}>
              <span className="grid h-12 w-12 place-items-center rounded-xl shrink-0" style={{ backgroundColor: `${l.color}22` }}>
                <Icon className="h-6 w-6" style={{ color: l.color }} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{l.label}</span>
                  {l.mapped && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300">LIVE ON MAP</span>}
                </div>
                <div className="text-xs text-slate-400 truncate">{l.desc}</div>
              </div>
              <button
                onClick={() => toggleLayer(l.key)}
                data-testid={`datalayer-toggle-${l.key}`}
                className={`relative h-7 w-12 rounded-full transition-colors shrink-0 ${on ? "bg-blue-600" : "bg-slate-600"}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-6" : "left-1"}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
