import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Flame, Home, Shield, MapPin, TrendingUp, Loader2 } from "lucide-react";
import DonutChart from "@/components/DonutChart";
import { riskColor } from "@/lib/risk";
import SnowflakeStatus from "@/components/SnowflakeStatus";
import DataSourceBadge from "@/components/DataSourceBadge";
import DataDisclaimer from "@/components/DataDisclaimer";
import { snowflakeAPI } from "@/services/api";

export default function IndiaDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('ALL');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [summaryData, districtsData] = await Promise.all([
        snowflakeAPI.getIndiaDistrictSummary(),
        snowflakeAPI.getIndiaDistricts()
      ]);
      
      if (summaryData.success && districtsData.success) {
        setSummary(summaryData);
        setDistricts(districtsData.data);
      } else {
        throw new Error('Failed to load data from Snowflake');
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter districts based on selected filters
  const filteredDistricts = districts.filter(d => {
    const stateMatch = selectedState === 'ALL' || d.STATE_NAME === selectedState;
    const riskMatch = selectedRiskLevel === 'ALL' || d.RISK_LEVEL === selectedRiskLevel;
    return stateMatch && riskMatch;
  });

  // Get unique states
  const states = ['ALL', ...new Set(districts.map(d => d.STATE_NAME))].sort();

  // Loading state
  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <SnowflakeStatus />
        <div className="glass rounded-2xl p-12 text-center animate-fade-up mt-6">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Loading India district data from Snowflake...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <SnowflakeStatus />
        <div className="glass rounded-2xl p-8 text-center animate-fade-up mt-6 border border-red-500/30">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Failed to Load Data</h3>
          <p className="text-slate-300 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const riskDist = summary.riskDistribution || [];
  const donutData = riskDist.map(r => ({ name: r.level, value: r.count }));

  const STATS = [
    { 
      level: "VERY_HIGH", 
      label: "Very High Risk", 
      value: riskDist.find(r => r.level === 'VERY_HIGH')?.count || 0,
      unit: "Districts", 
      icon: AlertTriangle, 
      color: "#FF2020" 
    },
    { 
      level: "HIGH", 
      label: "High Risk", 
      value: riskDist.find(r => r.level === 'HIGH')?.count || 0,
      unit: "Districts", 
      icon: Flame, 
      color: "#FF8A00" 
    },
    { 
      level: "MODERATE", 
      label: "Moderate Risk", 
      value: riskDist.find(r => r.level === 'MODERATE')?.count || 0,
      unit: "Districts", 
      icon: Home, 
      color: "#FFD21C" 
    },
    { 
      level: "LOW", 
      label: "Low Risk", 
      value: riskDist.find(r => r.level === 'LOW')?.count || 0,
      unit: "Districts", 
      icon: Shield, 
      color: "#42D321" 
    },
    { 
      level: "TOTAL", 
      label: "Total Districts", 
      value: summary.summary.totalDistricts,
      unit: "8 States", 
      icon: MapPin, 
      color: "#A855F7" 
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Snowflake Integration Status */}
      <SnowflakeStatus />

      {/* Data Source Disclaimer */}
      <DataDisclaimer variant="district-demo" />

      {/* Stat cards */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-lg font-bold text-white">Northeast India - Landslide Risk Assessment</h2>
        <DataSourceBadge source="snowflake" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              data-testid={`stat-card-${s.label.toLowerCase().replace(/ /g, "-")}`}
              className="glass glass-hover rounded-2xl p-5 animate-fade-up cursor-pointer"
              style={{ animationDelay: `${i * 60}ms`, boxShadow: `inset 0 0 0 1px ${s.color}22, 0 0 24px ${s.color}12` }}
              onClick={() => s.level !== 'TOTAL' && setSelectedRiskLevel(s.level === selectedRiskLevel ? 'ALL' : s.level)}
            >
              <div className="text-sm font-semibold text-slate-200">{s.label}</div>
              <div className="flex items-center gap-3 mt-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ backgroundColor: `${s.color}1f` }}>
                  <Icon className="h-6 w-6" style={{ color: s.color }} />
                </span>
                <div>
                  <div className="font-display text-3xl font-extrabold leading-none" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.unit}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Risk Overview */}
        <div className="glass rounded-2xl p-6 animate-fade-up">
          <h2 className="font-display text-xl font-bold text-white mb-4">Risk Distribution</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/2">
              <DonutChart data={donutData} total={summary.summary.totalDistricts} />
            </div>
            <div className="w-full sm:w-1/2 space-y-3">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: riskColor(d.name) }} />
                    <span className="text-slate-200">{d.name.replace('_', ' ')}</span>
                  </div>
                  <span className="font-display font-bold text-white">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* State Statistics */}
        <div className="glass rounded-2xl p-6 animate-fade-up">
          <h2 className="font-display text-xl font-bold text-white mb-4">State-wise Risk Analysis</h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {summary.stateDistribution.map((state, idx) => (
              <div 
                key={state.state}
                className="flex items-center justify-between p-3 rounded-lg glass-hover cursor-pointer"
                style={{ animationDelay: `${idx * 30}ms` }}
                onClick={() => setSelectedState(state.state === selectedState ? 'ALL' : state.state)}
              >
                <div>
                  <div className="font-medium text-white">{state.state}</div>
                  <div className="text-xs text-slate-400">{state.districtCount} districts</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: riskColor(parseFloat(state.avgRiskScore) > 45 ? 'VERY_HIGH' : parseFloat(state.avgRiskScore) > 35 ? 'HIGH' : 'MODERATE') }}>
                    Risk: {state.avgRiskScore}
                  </div>
                  <div className="text-xs text-slate-400">{state.highRiskCount} high-risk</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* District Table */}
      <div className="glass rounded-2xl p-6 animate-fade-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h2 className="font-display text-xl font-bold text-white">District Details</h2>
          <div className="flex gap-2 flex-wrap">
            <select 
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {states.map(state => (
                <option key={state} value={state}>{state === 'ALL' ? 'All States' : state}</option>
              ))}
            </select>
            <select 
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="EXTREME">Extreme</option>
              <option value="VERY_HIGH">Very High</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-slate-400 mb-3">
          Showing {filteredDistricts.length} of {districts.length} districts
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">State</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">District</th>
                <th className="text-center py-3 px-4 text-slate-300 font-semibold">Risk Level</th>
                <th className="text-right py-3 px-4 text-slate-300 font-semibold">Risk Score</th>
                <th className="text-right py-3 px-4 text-slate-300 font-semibold">Rainfall</th>
                <th className="text-right py-3 px-4 text-slate-300 font-semibold">Slope</th>
              </tr>
            </thead>
            <tbody>
              {filteredDistricts.map((district, idx) => (
                <tr 
                  key={district.DISTRICT_ID}
                  className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                  style={{ animationDelay: `${idx * 10}ms` }}
                >
                  <td className="py-3 px-4 text-slate-300">{district.STATE_NAME}</td>
                  <td className="py-3 px-4 text-white font-medium">{district.DISTRICT_NAME}</td>
                  <td className="py-3 px-4 text-center">
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${riskColor(district.RISK_LEVEL)}22`,
                        color: riskColor(district.RISK_LEVEL)
                      }}
                    >
                      {district.RISK_LEVEL.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-white font-bold">
                    {district.RISK_SCORE}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">{district.RAINFALL_MM} mm</td>
                  <td className="py-3 px-4 text-right text-slate-300">{district.TERRAIN_SLOPE_FACTOR}°</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top High-Risk Districts */}
      <div className="glass rounded-2xl p-6 animate-fade-up">
        <h2 className="font-display text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-red-400" />
          Top High-Risk Districts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summary.topHighRiskDistricts.slice(0, 10).map((district, idx) => (
            <div 
              key={district.id}
              className="p-4 rounded-lg glass-hover animate-fade-up"
              style={{ 
                animationDelay: `${idx * 40}ms`,
                borderLeft: `3px solid ${riskColor(district.riskLevel)}`
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{district.district}</div>
                  <div className="text-sm text-slate-400">{district.state}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-xl font-bold" style={{ color: riskColor(district.riskLevel) }}>
                    {district.riskScore}
                  </div>
                  <div className="text-xs text-slate-400">{district.riskLevel.replace('_', ' ')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
