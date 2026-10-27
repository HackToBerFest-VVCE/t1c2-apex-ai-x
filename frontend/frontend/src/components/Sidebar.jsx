import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, MapPin, Bell, BarChart3, FileText,
  ClipboardList, Layers, Clock, Settings, Power, X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

const NAV = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Map", path: "/map", icon: MapPin },
  { name: "Alerts", path: "/alerts", icon: Bell },
  { name: "Risk Analysis", path: "/risk-analysis", icon: BarChart3 },
  { name: "Field Reports", path: "/field-reports", icon: FileText },
  { name: "Report Activity", path: "/report-activity", icon: ClipboardList },
  { name: "Data Layers", path: "/data-layers", icon: Layers },
  { name: "History", path: "/history", icon: Clock },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const content = (
    <div className="flex h-full flex-col bg-[#0e172a]/95 backdrop-blur-xl border-r border-blue-900/30 w-64">
      {/* Branding */}
      <div className="px-4 pt-5 pb-4 relative">
        <img src="/slope.jpeg" alt="SignalMesh AI" className="w-full max-w-[210px] mx-auto drop-shadow-[0_6px_18px_rgba(0,0,0,0.6)]" />
        <div className="text-center text-[10px] text-slate-400 mt-1 tracking-wide">AI-Powered Disaster Intelligence</div>
        <div className="text-center text-[9px] text-slate-500 tracking-wider">by Apex-AI-X</div>
        <button onClick={onClose} className="lg:hidden absolute right-3 top-4 text-slate-400" data-testid="sidebar-close-btn">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              data-testid={`sidebar-nav-${item.name.toLowerCase().replace(/ /g, "-")}`}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-[0_6px_20px_rgba(37,99,235,0.45)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-6 pt-2 border-t border-blue-900/30">
        <button
          onClick={handleLogout}
          data-testid="sidebar-logout-btn"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-red-500/10 transition-all"
        >
          <Power className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-40">{content}</aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 animate-fade-up">{content}</div>
        </div>
      )}
    </>
  );
}
