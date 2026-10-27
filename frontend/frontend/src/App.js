import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import IndiaDashboard from "@/pages/IndiaDashboard";
import Dashboard from "@/pages/Dashboard";
import MapPage from "@/pages/MapPage";
import RiskAnalysis from "@/pages/RiskAnalysis";
import Alerts from "@/pages/Alerts";
import FieldReports from "@/pages/FieldReports";
import ReportActivity from "@/pages/ReportActivity";
import DataLayers from "@/pages/DataLayers";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import EmergencyAlert from "@/pages/EmergencyAlert";

function App() {
  return (
    <div className="App">
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Emergency Alert - Zero-login, no protection */}
            <Route path="/emergency-alert" element={<EmergencyAlert />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<IndiaDashboard />} />
              <Route path="/dashboard-legacy" element={<Dashboard />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/risk-analysis" element={<RiskAnalysis />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/field-reports" element={<FieldReports />} />
              <Route path="/report-activity" element={<ReportActivity />} />
              <Route path="/data-layers" element={<DataLayers />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AppProvider>
    </div>
  );
}

export default App;
