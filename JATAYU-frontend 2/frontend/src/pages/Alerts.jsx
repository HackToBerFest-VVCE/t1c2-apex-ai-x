import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, MapPin, Clock } from "lucide-react";
import RiskBadge from "@/components/RiskBadge";
import { ALERTS, ALERT_HISTORY } from "@/data/alerts";
import { getLocation } from "@/data/locations";
import { riskColor, RISK_ORDER } from "@/lib/risk";
import { useApp } from "@/context/AppContext";

const statusStyle = {
  New: "bg-blue-500/15 text-blue-300",
  Acknowledged: "bg-amber-500/15 text-amber-300",
  Closed: "bg-slate-500/20 text-slate-300",
};

export default function Alerts() {
  const navigate = useNavigate();
  const { setSelectedLocationId } = useApp();
  const [tab, setTab] = useState("active");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(null);

  const source = tab === "active" ? ALERTS : ALERT_HISTORY;
  const rows = useMemo(
    () => (filter === "All" ? source : source.filter((a) => a.riskLevel === filter)),
    [source, filter]
  );

  const openAnalysis = (a) => {
    setSelectedLocationId(a.locationId);
    navigate("/risk-analysis");
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* tabs */}
      <div className="flex gap-6 border-b border-blue-900/30 mb-5">
        {[["active", "Active Alerts"], ["history", "Alert History"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} data-testid={`alerts-tab-${k}`}
            className={`relative pb-3 font-medium transition ${tab === k ? "text-white" : "text-slate-400 hover:text-slate-200"}`}>
            {l}
            {tab === k && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
          </button>
        ))}
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {["All", ...RISK_ORDER].map((r) => (
          <button key={r} onClick={() => setFilter(r)} data-testid={`alerts-filter-${r.toLowerCase().replace(/ /g, "-")}`}
            className={`px-3.5 py-1.5 rounded-full text-sm transition ${filter === r ? "bg-blue-600 text-white" : "glass text-slate-300 hover:text-white"}`}>
            {r}
          </button>
        ))}
      </div>

      {/* table (desktop) */}
      <div className="glass rounded-2xl overflow-hidden hidden md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-blue-900/30">
              <th className="px-6 py-4">Alert</th><th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Risk Level</th><th className="px-6 py-4">Time</th><th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/30">
            {rows.map((a) => (
              <tr key={a.id} onClick={() => setModal(a)} data-testid={`alert-row-${a.id}`} className="hover:bg-white/5 cursor-pointer transition">
                <td className="px-6 py-4 font-medium text-white">{a.name}</td>
                <td className="px-6 py-4 text-slate-300">{a.state}</td>
                <td className="px-6 py-4"><span className="font-semibold" style={{ color: riskColor(a.riskLevel) }}>{a.riskLevel}</span></td>
                <td className="px-6 py-4 text-slate-400">{a.date} {a.time}</td>
                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle[a.status]}`}>{a.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* cards (mobile) */}
      <div className="md:hidden space-y-3">
        {rows.map((a) => (
          <button key={a.id} onClick={() => setModal(a)} className="glass rounded-xl p-4 w-full text-left" data-testid={`alert-card-${a.id}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">{a.name}, {a.state}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs ${statusStyle[a.status]}`}>{a.status}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-semibold text-sm" style={{ color: riskColor(a.riskLevel) }}>{a.riskLevel}</span>
              <span className="text-slate-400 text-sm">· {a.time}</span>
            </div>
          </button>
        ))}
      </div>

      {/* modal */}
      {modal && (
        <div className="fixed inset-0 z-[600] grid place-items-center px-4" data-testid="alert-modal">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative glass rounded-2xl p-6 w-full max-w-md animate-fade-up">
            <button onClick={() => setModal(null)} className="absolute right-4 top-4 text-slate-400 hover:text-white" data-testid="alert-modal-close"><X className="h-5 w-5" /></button>
            <div className="text-xs uppercase tracking-wider text-slate-400">Alert Details</div>
            <h3 className="font-display text-2xl font-bold text-white mt-1">{modal.name}, {modal.state}</h3>
            <div className="mt-3"><RiskBadge level={modal.riskLevel} /></div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-300"><MapPin className="h-4 w-4 text-blue-400" /> {modal.name}, {modal.state}</div>
              <div className="flex items-center gap-2 text-slate-300"><Clock className="h-4 w-4 text-blue-400" /> {modal.date} {modal.time}</div>
              <div className="flex items-center gap-2 text-slate-300">Status: <span className={`px-2.5 py-0.5 rounded-full text-xs ${statusStyle[modal.status]}`}>{modal.status}</span></div>
            </div>
            <button onClick={() => openAnalysis(modal)} data-testid="alert-modal-analysis-btn"
              className="mt-6 w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 transition">
              View Risk Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
