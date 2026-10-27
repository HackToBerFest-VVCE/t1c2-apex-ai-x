import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useApp } from "@/context/AppContext";

const aiStyle = {
  Verified: "bg-emerald-500/15 text-emerald-300",
  Pending: "bg-amber-500/15 text-amber-300",
  Flagged: "bg-red-500/15 text-red-300",
};
const statusStyle = {
  Verified: "bg-emerald-500/15 text-emerald-300",
  Submitted: "bg-blue-500/15 text-blue-300",
  Flagged: "bg-red-500/15 text-red-300",
};

export default function ReportActivity() {
  const { reports } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const rows = useMemo(() => {
    let r = reports;
    if (filter !== "All") r = r.filter((x) => x.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((x) => `${x.id} ${x.location} ${x.observation} ${x.submittedBy}`.toLowerCase().includes(q));
    }
    return r;
  }, [reports, query, filter]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="glass rounded-xl flex items-center gap-2 px-4 py-2.5 flex-1 max-w-md">
          <Search className="h-5 w-5 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reports..." data-testid="report-activity-search"
            className="flex-1 bg-transparent outline-none text-white text-sm placeholder:text-slate-500" />
        </div>
        <div className="flex gap-2">
          {["All", "Submitted", "Verified", "Flagged"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} data-testid={`report-activity-filter-${f.toLowerCase()}`}
              className={`px-3.5 py-2 rounded-xl text-sm transition ${filter === f ? "bg-blue-600 text-white" : "glass text-slate-300 hover:text-white"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-x-auto">
        <table className="w-full text-left min-w-[820px]">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-slate-400 border-b border-blue-900/30">
              <th className="px-5 py-4">Report ID</th><th className="px-5 py-4">Location</th><th className="px-5 py-4">Submitted By</th>
              <th className="px-5 py-4">Date</th><th className="px-5 py-4">Observation</th><th className="px-5 py-4">AI Status</th>
              <th className="px-5 py-4">Risk Impact</th><th className="px-5 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/30">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/5 transition" data-testid={`report-row-${r.id}`}>
                <td className="px-5 py-4 font-mono text-blue-300 text-sm">#{r.id}</td>
                <td className="px-5 py-4 text-white">{r.location}</td>
                <td className="px-5 py-4 text-slate-300">{r.submittedBy}</td>
                <td className="px-5 py-4 text-slate-400">{r.date}</td>
                <td className="px-5 py-4 text-slate-300">{r.observation}</td>
                <td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-xs ${aiStyle[r.aiStatus] || "bg-slate-500/20 text-slate-300"}`}>{r.aiStatus}{r.confidence ? ` ${r.confidence}%` : ""}</span></td>
                <td className="px-5 py-4 text-slate-300 text-sm">{r.riskImpact}</td>
                <td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-xs ${statusStyle[r.status] || "bg-slate-500/20 text-slate-300"}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="px-5 py-10 text-center text-slate-400">No reports found.</div>}
      </div>
    </div>
  );
}
