import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { INITIAL_REPORTS } from "@/data/reports";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const DEFAULT_LAYERS = {
  landslideRisk: true,
  rainfall: false,
  soilMoisture: false,
  slopeGradient: false,
  landCover: false,
  earthquake: false,
  roads: false,
  villages: true,
  infrastructure: false,
};

const DEFAULT_SETTINGS = {
  alertNotifications: true,
  emailNotifications: true,
  fieldReportNotifications: true,
  autoRefresh: true,
  darkMode: true,
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("jatayu_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [selectedLocationId, setSelectedLocationId] = useState("dima-hasao");
  const [reportCounter, setReportCounter] = useState(56);

  useEffect(() => {
    if (user) localStorage.setItem("jatayu_user", JSON.stringify(user));
    else localStorage.removeItem("jatayu_user");
  }, [user]);

  const login = (username, password) => {
    if (username.trim().toLowerCase() === "admin" && password === "admin123") {
      setUser({ name: "S. Sharma", initial: "S", role: "Command Officer", username: "admin" });
      return { ok: true };
    }
    return { ok: false, error: "Invalid credentials. Use admin / admin123." };
  };

  const logout = () => setUser(null);

  const toggleLayer = (key) => setLayers((p) => ({ ...p, [key]: !p[key] }));
  const toggleSetting = (key) => setSettings((p) => ({ ...p, [key]: !p[key] }));

  const addReport = (report) => {
    const id = `MFR-2025-${String(reportCounter).padStart(4, "0")}`;
    setReportCounter((c) => c + 1);
    const full = { id, status: "Submitted", aiStatus: "Pending", confidence: 0, riskImpact: "—", ...report };
    setReports((p) => [full, ...p]);
    return full;
  };

  const updateReport = (id, patch) =>
    setReports((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const value = useMemo(
    () => ({
      user, login, logout,
      reports, addReport, updateReport,
      layers, toggleLayer,
      settings, toggleSetting,
      selectedLocationId, setSelectedLocationId,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, reports, layers, settings, selectedLocationId]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
