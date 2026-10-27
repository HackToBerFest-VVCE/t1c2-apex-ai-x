import { useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Bell, Menu, ChevronDown } from "lucide-react";
import { useApp } from "@/context/AppContext";

const META = {
  "/dashboard": { title: "Dashboard", desc: "Overview of landslide risk, alerts and system status" },
  "/map": { title: "Map", desc: "Explore landslide risk levels across Northeast India" },
  "/risk-analysis": { title: "Risk Analysis", desc: "" },
  "/alerts": { title: "Alerts", desc: "Active warnings and alert history" },
  "/field-reports": { title: "Field Reports", desc: "Submit and track unusual activity reports" },
  "/report-activity": { title: "Report Activity", desc: "All field reports and their verification status" },
  "/data-layers": { title: "Data Layers", desc: "Toggle environmental data layers on the map" },
  "/history": { title: "History", desc: "Historical risk events and score changes" },
  "/settings": { title: "Settings", desc: "Manage profile, notifications and preferences" },
};

export default function Header({ onMenu }) {
  const { pathname } = useLocation();
  const { user, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = META[pathname] || { title: "JATAYU", desc: "" };

  return (
    <header className="sticky top-0 z-30 bg-[#0a1020]/85 backdrop-blur-md border-b border-blue-900/30">
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={onMenu} className="lg:hidden text-slate-300" data-testid="header-menu-btn">
          <Menu className="h-6 w-6" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white truncate" data-testid="page-title">
            {meta.title}
          </h1>
          {meta.desc && <p className="text-sm text-slate-400 truncate hidden sm:block">{meta.desc}</p>}
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
            <span>Last Updated: <span className="text-slate-200 font-medium">03 May 2025 10:30 AM</span></span>
            <span className="flex items-center gap-1.5 ml-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-emerald-400 font-semibold">Live</span>
            </span>
          </div>

          <button onClick={() => toast.info("8 active alerts. Latest: Dima Hasao, Assam — Very High Risk.")} className="relative text-slate-300 hover:text-white transition-colors" data-testid="header-bell-btn">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <div className="h-8 w-px bg-blue-900/40 hidden sm:block" />

          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2"
              data-testid="header-user-btn"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-slate-100 to-slate-300 text-slate-900 font-bold font-display">
                {user?.initial || "S"}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 glass rounded-xl p-2 shadow-2xl z-50" data-testid="header-user-menu">
                <div className="px-3 py-2 border-b border-blue-900/30">
                  <div className="text-sm font-semibold text-white">{user?.name}</div>
                  <div className="text-xs text-slate-400">{user?.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="mt-1 w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-red-500/10 hover:text-white transition"
                  data-testid="header-logout-btn"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
