import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileBarChart, Users, Milestone, Home, Building2, AlertTriangle, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import RiskBadge from "@/components/RiskBadge";
import FactorRow from "@/components/FactorRow";
import { LOCATIONS, getLocation, FACTOR_META } from "@/data/locations";
import { riskColor } from "@/lib/risk";
import { useApp } from "@/context/AppContext";

const TABS = ["Overview", "Factors", "History", "Impact", "Recommendations"];

export default function RiskAnalysis() {
  const navigate = useNavigate();
  const { selectedLocationId, setSelectedLocationId } = useApp();
  const [tab, setTab] = useState("Factors");
  const loc = getLocation(selectedLocationId) || LOCATIONS[0];
  const color = riskColor(loc.riskLevel);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* header row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 text-slate-200 hover:text-white" data-testid="risk-back-btn">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white flex-1">{loc.name}, {loc.state}</h1>
        <RiskBadge level={loc.riskLevel} size="lg" testId="risk-analysis-badge" />
      </div>

      {/* location selector */}
      <div className="flex flex-wrap gap-2 mb-5">
        {LOCATIONS.slice(0, 5).map((l) => (
          <button
            key={l.id}
            onClick={() => setSelectedLocationId(l.id)}
            data-testid={`risk-location-${l.id}`}
            className={`px-3.5 py-1.5 rounded-full text-sm transition ${l.id === loc.id ? "bg-blue-600 text-white" : "glass text-slate-300 hover:text-white"}`}
          >
            {l.name}
          </button>
        ))}
      </div>

      {/* tabs */}
      <div className="flex gap-1 sm:gap-6 border-b border-blue-900/30 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            data-testid={`risk-tab-${t.toLowerCase()}`}
            className={`relative pb-3 px-2 text-sm sm:text-base font-medium whitespace-nowrap transition ${tab === t ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
          >
            {t}
            {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-up">
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <h3 className="font-display text-lg font-semibold text-white mb-2">Risk Summary</h3>
            <p className="text-slate-300 leading-relaxed">{loc.summary}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {[["Risk Score", `${loc.riskScore}/100`], ["Rainfall", `${loc.rainfall}%`], ["Soil Moisture", `${loc.soilMoisture}%`], ["Slope", `${loc.slopeGradient}%`]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-800/40 p-4">
                  <div className="text-xs text-slate-400">{k}</div>
                  <div className="font-display text-xl font-bold text-white mt-1">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-5 w-5" style={{ color }} /><span className="text-sm text-slate-400">Current Risk Level</span></div>
            <RiskBadge level={loc.riskLevel} size="lg" />
            <p className="text-slate-300 mt-4 text-sm">High probability of landslide occurrence in the near term. Continuous monitoring is advised.</p>
          </div>
        </div>
      )}

      {tab === "Factors" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-up">
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <h3 className="font-display text-xl font-bold text-white mb-2">Contributing Factors</h3>
            <div className="divide-y divide-blue-900/30">
              {FACTOR_META.map((m, i) => <FactorRow key={m.key} meta={m} value={loc[m.key]} delay={i * 120} />)}
            </div>
          </div>
          <div className="glass rounded-2xl p-6 flex flex-col">
            <h3 className="font-display text-xl font-bold text-white mb-3">Why is the risk high?</h3>
            <p className="text-slate-300 leading-relaxed">{loc.summary}</p>
            <div className="mt-auto pt-6 flex items-end justify-center gap-1">
              <TrendingUp className="h-24 w-24 text-blue-500/30" />
            </div>
          </div>
        </div>
      )}

      {tab === "History" && (
        <div className="glass rounded-2xl p-6 animate-fade-up">
          <h3 className="font-display text-xl font-bold text-white mb-4">Historical Risk Score</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={loc.history} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(59,130,246,0.35)", borderRadius: 12, color: "#fff" }} />
                <Line type="monotone" dataKey="score" stroke={color} strokeWidth={3} dot={{ r: 4, fill: color }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "Impact" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up">
          {[
            { icon: Milestone, label: "Roads at Risk", value: loc.roads, color: "#FF8A00" },
            { icon: Home, label: "Villages", value: loc.villages, color: "#FFD21C" },
            { icon: Building2, label: "Infrastructure", value: loc.infrastructure, color: "#3B82F6" },
            { icon: Users, label: "Est. Population", value: loc.population.toLocaleString(), color: "#A855F7" },
          ].map((it) => {
            const Icon = it.icon;
            return (
              <div key={it.label} className="glass rounded-2xl p-6">
                <span className="grid h-12 w-12 place-items-center rounded-xl mb-3" style={{ backgroundColor: `${it.color}22` }}>
                  <Icon className="h-6 w-6" style={{ color: it.color }} />
                </span>
                <div className="font-display text-3xl font-extrabold text-white">{it.value}</div>
                <div className="text-sm text-slate-400 mt-1">{it.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "Recommendations" && (
        <div className="glass rounded-2xl p-6 animate-fade-up">
          <h3 className="font-display text-xl font-bold text-white mb-4">Recommended Actions</h3>
          <div className="space-y-3">
            {loc.recommendations.map((r, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-800/40 p-4" data-testid={`recommendation-${i}`}>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-white text-sm font-bold shrink-0">{i + 1}</span>
                <span className="text-slate-200">{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* bottom summary cards (shown on all tabs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        <div className="glass rounded-2xl p-6 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-xl bg-blue-500/15"><FileBarChart className="h-7 w-7 text-blue-400" /></span>
          <div className="flex-1">
            <div className="text-sm text-slate-400">Risk Score</div>
            <div className="font-display text-2xl font-extrabold text-white">{loc.riskScore} / 100</div>
            <div className="mt-2 h-2 rounded-full bg-slate-700/50 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${loc.riskScore}%`, backgroundColor: color }} />
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3"><Users className="h-5 w-5 text-emerald-400" /><span className="text-sm font-semibold text-slate-200">Potential Impact</span></div>
          <div className="grid grid-cols-3 text-center gap-2">
            <div><Milestone className="h-5 w-5 mx-auto text-slate-300" /><div className="text-xs text-slate-400 mt-1">Roads</div><div className="font-bold text-white">{loc.roads}</div></div>
            <div><Home className="h-5 w-5 mx-auto text-slate-300" /><div className="text-xs text-slate-400 mt-1">Villages</div><div className="font-bold text-white">{loc.villages}</div></div>
            <div><Building2 className="h-5 w-5 mx-auto text-slate-300" /><div className="text-xs text-slate-400 mt-1">Infra</div><div className="font-bold text-white">{loc.infrastructure}</div></div>
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3"><span className="grid h-9 w-9 place-items-center rounded-full" style={{ backgroundColor: `${color}22` }}><AlertTriangle className="h-5 w-5" style={{ color }} /></span><span className="text-sm text-slate-400">Current Risk Level</span></div>
          <RiskBadge level={loc.riskLevel} size="lg" />
          <p className="text-slate-300 mt-3 text-sm">High probability of landslide occurrence in the near term.</p>
        </div>
      </div>
    </div>
  );
}
