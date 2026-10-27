import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { LOCATIONS, getLocation } from "@/data/locations";
import { riskColor } from "@/lib/risk";

const MONTHLY = [
  { month: "Jan", events: 2 }, { month: "Feb", events: 3 }, { month: "Mar", events: 5 },
  { month: "Apr", events: 9 }, { month: "May", events: 14 }, { month: "Jun", events: 21 },
  { month: "Jul", events: 26 }, { month: "Aug", events: 18 }, { month: "Sep", events: 11 },
];

export default function History() {
  const [locId, setLocId] = useState("dima-hasao");
  const loc = getLocation(locId);
  const color = riskColor(loc.riskLevel);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-slate-400 text-sm">Select location:</span>
        <select value={locId} onChange={(e) => setLocId(e.target.value)} data-testid="history-location-select"
          className="glass rounded-xl px-4 py-2.5 bg-transparent outline-none text-white text-sm">
          {LOCATIONS.map((l) => <option key={l.id} className="bg-slate-900" value={l.id}>{`${l.name}, ${l.state}`}</option>)}
        </select>
      </div>

      <div className="glass rounded-2xl p-6 animate-fade-up">
        <h3 className="font-display text-xl font-bold text-white mb-1">Risk Score Trend — {loc.name}</h3>
        <p className="text-slate-400 text-sm mb-4">Daily risk score changes over the recent period</p>
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

      <div className="glass rounded-2xl p-6 animate-fade-up">
        <h3 className="font-display text-xl font-bold text-white mb-1">Monthly Landslide Events (NER)</h3>
        <p className="text-slate-400 text-sm mb-4">Region-wide recorded events by month</p>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip cursor={{ fill: "rgba(59,130,246,0.08)" }} contentStyle={{ background: "#0f172a", border: "1px solid rgba(59,130,246,0.35)", borderRadius: 12, color: "#fff" }} />
              <Bar dataKey="events" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
