import { useMemo, useState } from "react";
import { Search, Layers as LayersIcon, Filter, LocateFixed, Plus, Minus, ChevronDown } from "lucide-react";
import MapView from "@/components/MapView";
import LocationDetails from "@/components/LocationDetails";
import { LOCATIONS, getLocation } from "@/data/locations";
import { riskColor, RISK_ORDER } from "@/lib/risk";
import { useApp } from "@/context/AppContext";

export default function MapPage() {
  const { layers, toggleLayer, selectedLocationId, setSelectedLocationId } = useApp();
  const [query, setQuery] = useState("");
  const [showPanel, setShowPanel] = useState(true);
  const [riskFilter, setRiskFilter] = useState("All");
  const [flyTarget, setFlyTarget] = useState(null);
  const [showLayers, setShowLayers] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [zoomNonce, setZoomNonce] = useState(0);

  const selected = getLocation(selectedLocationId);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return LOCATIONS.filter((l) => `${l.name} ${l.state}`.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const pick = (id) => {
    setSelectedLocationId(id);
    setShowPanel(true);
    setQuery("");
  };

  const layerToggles = [
    { key: "landslideRisk", label: "Landslide Risk" },
    { key: "rainfall", label: "Rainfall" },
    { key: "villages", label: "Villages" },
  ];

  return (
    <div className="relative h-[calc(100vh-73px)] w-full overflow-hidden">
      <MapView layers={layers} selectedId={selectedLocationId} onSelect={pick} riskFilter={riskFilter} flyTarget={flyTarget} />

      {/* Search top-left */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-[300px] z-[600]">
        <div className="glass rounded-xl flex items-center gap-2 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            data-testid="map-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location..."
            className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-400 text-sm"
          />
        </div>
        {matches.length > 0 && (
          <div className="glass rounded-xl mt-2 overflow-hidden" data-testid="map-search-results">
            {matches.map((m) => (
              <button
                key={m.id}
                onClick={() => pick(m.id)}
                data-testid={`map-search-result-${m.id}`}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: riskColor(m.riskLevel) }} />
                <div>
                  <div className="text-sm text-white">{m.name}, {m.state}</div>
                  <div className="text-xs text-slate-400">{m.riskLevel} Risk</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Location details panel below search */}
      {selected && showPanel && matches.length === 0 && (
        <div className="absolute top-[116px] left-4 sm:top-[76px] z-[500]">
          <LocationDetails location={selected} onClose={() => setShowPanel(false)} />
        </div>
      )}

      {/* Top-right controls */}
      <div className="absolute top-[64px] right-4 sm:top-4 z-[550] flex flex-wrap justify-end items-center gap-2 max-w-[calc(100vw-2rem)]">
        <div className="relative">
          <button
            onClick={() => { setShowFilter((s) => !s); setShowLayers(false); }}
            className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-white"
            data-testid="map-risk-layer-btn"
          >
            Risk Layer <ChevronDown className="h-4 w-4" />
          </button>
          {showFilter && (
            <div className="glass rounded-xl mt-2 p-2 absolute right-0 w-44" data-testid="map-risk-filter-menu">
              {["All", ...RISK_ORDER].map((r) => (
                <button
                  key={r}
                  onClick={() => { setRiskFilter(r); setShowFilter(false); }}
                  data-testid={`map-filter-${r.toLowerCase().replace(/ /g, "-")}`}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${riskFilter === r ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/5"}`}
                >
                  {r === "All" ? "All Levels" : r}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setShowLayers((s) => !s); setShowFilter(false); }} className="glass rounded-xl h-11 w-11 grid place-items-center text-white" data-testid="map-layers-btn">
            <LayersIcon className="h-5 w-5" />
          </button>
          {showLayers && (
            <div className="glass rounded-xl mt-2 p-3 absolute right-0 w-52 space-y-2" data-testid="map-layers-menu">
              {layerToggles.map((l) => (
                <label key={l.key} className="flex items-center justify-between text-sm text-slate-200 cursor-pointer">
                  {l.label}
                  <input type="checkbox" checked={layers[l.key]} onChange={() => toggleLayer(l.key)} data-testid={`map-layer-toggle-${l.key}`} className="accent-blue-500 h-4 w-4" />
                </label>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => setRiskFilter("All")} className="glass rounded-xl h-11 w-11 grid place-items-center text-white" data-testid="map-filter-reset-btn">
          <Filter className="h-5 w-5" />
        </button>
        <button onClick={() => setFlyTarget({ center: [25.6, 92.8], zoom: 7, t: Date.now() })} className="glass rounded-xl h-11 w-11 grid place-items-center text-white" data-testid="map-locate-btn">
          <LocateFixed className="h-5 w-5" />
        </button>
      </div>

      {/* Zoom controls bottom-right */}
      <div className="absolute bottom-6 right-4 z-[500] flex flex-col gap-2">
        <div className="glass rounded-xl overflow-hidden flex flex-col">
          <button onClick={() => { window.__jatZoom?.(1); }} id="jat-zoom-in" className="h-11 w-11 grid place-items-center text-white hover:bg-white/5" data-testid="map-zoom-in">
            <Plus className="h-5 w-5" />
          </button>
          <div className="h-px bg-blue-900/40" />
          <button onClick={() => { window.__jatZoom?.(-1); }} id="jat-zoom-out" className="h-11 w-11 grid place-items-center text-white hover:bg-white/5" data-testid="map-zoom-out">
            <Minus className="h-5 w-5" />
          </button>
        </div>
        <button onClick={() => setFlyTarget({ center: [25.6, 92.8], zoom: 7, t: Date.now() })} className="glass rounded-xl h-11 w-11 grid place-items-center text-white" data-testid="map-recenter-btn">
          <LocateFixed className="h-5 w-5" />
        </button>
      </div>

      {/* Legend bottom-left */}
      <div className="absolute bottom-6 left-4 z-[500] glass rounded-xl p-4" data-testid="map-legend">
        <div className="text-sm font-semibold text-white mb-2.5">Risk Level</div>
        <div className="space-y-2">
          {RISK_ORDER.map((r) => (
            <div key={r} className="flex items-center gap-2.5 text-sm text-slate-200">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: riskColor(r) }} />
              {r}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
