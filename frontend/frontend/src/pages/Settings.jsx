import { toast } from "sonner";
import { User, Bell, Map as MapIcon, Sliders } from "lucide-react";
import { useApp } from "@/context/AppContext";

function Toggle({ on, onClick, testId }) {
  return (
    <button onClick={onClick} data-testid={testId} className={`relative h-7 w-12 rounded-full transition-colors shrink-0 ${on ? "bg-blue-600" : "bg-slate-600"}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-6" : "left-1"}`} />
    </button>
  );
}

export default function Settings() {
  const { user, settings, toggleSetting } = useApp();

  const rows = [
    { key: "alertNotifications", label: "Alert notifications", desc: "Receive push alerts for new risk warnings" },
    { key: "emailNotifications", label: "Email notifications", desc: "Get daily summaries and critical alerts by email" },
    { key: "fieldReportNotifications", label: "Field report notifications", desc: "Notify when field reports are verified" },
    { key: "autoRefresh", label: "Auto refresh", desc: "Automatically refresh telemetry every 5 minutes" },
    { key: "darkMode", label: "Dark mode", desc: "Command-center dark theme (recommended)" },
  ];

  const onToggle = (k, label) => {
    toggleSetting(k);
    toast.success(`${label} ${settings[k] ? "disabled" : "enabled"}`);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl space-y-6">
      <div className="glass rounded-2xl p-6 animate-fade-up">
        <div className="flex items-center gap-2 mb-5"><User className="h-5 w-5 text-blue-400" /><h3 className="font-display text-lg font-semibold text-white">Profile</h3></div>
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-slate-100 to-slate-300 text-slate-900 font-bold font-display text-2xl">{user?.initial}</span>
          <div className="grid sm:grid-cols-2 gap-4 flex-1">
            <div><div className="text-xs text-slate-400">Name</div><div className="text-white font-medium">{user?.name}</div></div>
            <div><div className="text-xs text-slate-400">Role</div><div className="text-white font-medium">{user?.role}</div></div>
            <div><div className="text-xs text-slate-400">Username</div><div className="text-white font-medium">{user?.username}</div></div>
            <div><div className="text-xs text-slate-400">Region</div><div className="text-white font-medium">Northeast India (NER)</div></div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 animate-fade-up">
        <div className="flex items-center gap-2 mb-5"><Bell className="h-5 w-5 text-blue-400" /><h3 className="font-display text-lg font-semibold text-white">Notifications & Preferences</h3></div>
        <div className="divide-y divide-blue-900/30">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between py-4">
              <div><div className="text-white font-medium">{r.label}</div><div className="text-sm text-slate-400">{r.desc}</div></div>
              <Toggle on={settings[r.key]} onClick={() => onToggle(r.key, r.label)} testId={`settings-toggle-${r.key}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 animate-fade-up">
          <div className="flex items-center gap-2 mb-4"><MapIcon className="h-5 w-5 text-blue-400" /><h3 className="font-display text-lg font-semibold text-white">Map Preferences</h3></div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-slate-300">Default base map</span><span className="text-white font-medium">Satellite</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-300">Default region</span><span className="text-white font-medium">Northeast India</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-300">Default zoom</span><span className="text-white font-medium">Level 7</span></div>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 animate-fade-up">
          <div className="flex items-center gap-2 mb-4"><Sliders className="h-5 w-5 text-blue-400" /><h3 className="font-display text-lg font-semibold text-white">System Preferences</h3></div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-slate-300">Alert threshold</span><span className="text-white font-medium">Score ≥ 80</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-300">Data source</span><span className="text-white font-medium">JATAYU Telemetry</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-300">System status</span><span className="text-emerald-400 font-medium">● Operational</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
