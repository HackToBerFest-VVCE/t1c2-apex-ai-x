import { useEffect, useRef } from "react";
import L from "leaflet";
import { LOCATIONS, STATE_LABELS } from "@/data/locations";
import { generateRiskPoints, generateRainfallPoints, riskColor } from "@/lib/risk";

const RISK_POINTS = generateRiskPoints(LOCATIONS);
const RAIN_POINTS = generateRainfallPoints();

function pinIcon(color) {
  return L.divIcon({
    className: "jat-pin",
    html: `<div style="position:relative;width:34px;height:44px">
      <div class="pin-pulse" style="position:absolute;left:50%;top:14px;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;background:${color}"></div>
      <svg width="34" height="44" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 20 12 20s12-11.6 12-20C24 5.4 18.6 0 12 0z" fill="${color}"/>
        <circle cx="12" cy="12" r="5" fill="#fff"/>
      </svg>
    </div>`,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
  });
}

export default function MapView({ layers, selectedId, onSelect, riskFilter = "All", flyTarget }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const layerGroups = useRef({});
  const markerRefs = useRef({});

  // init
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = L.map(containerRef.current, {
      center: [25.6, 92.8],
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
      minZoom: 5,
      maxZoom: 14,
    });
    mapRef.current = map;

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 17,
    }).addTo(map);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 17,
      opacity: 0.5,
    }).addTo(map);

    // groups
    layerGroups.current = {
      risk: L.layerGroup().addTo(map),
      rainfall: L.layerGroup(),
      villages: L.layerGroup().addTo(map),
      markers: L.layerGroup().addTo(map),
      labels: L.layerGroup().addTo(map),
    };

    // state labels
    STATE_LABELS.forEach((s) => {
      L.marker([s.lat, s.lng], {
        icon: L.divIcon({ className: "jat-state-label", html: s.name, iconSize: [120, 20] }),
        interactive: false,
      }).addTo(layerGroups.current.labels);
    });

    // primary location markers
    LOCATIONS.forEach((loc) => {
      const m = L.marker([loc.latitude, loc.longitude], { icon: pinIcon(riskColor(loc.riskLevel)) });
      m.bindPopup(
        `<div style="min-width:160px"><div style="font-weight:700;font-size:14px">${loc.name}, ${loc.state}</div>
        <div style="color:${riskColor(loc.riskLevel)};font-weight:600;margin-top:4px">${loc.riskLevel} Risk</div>
        <div style="color:#94a3b8;font-size:12px;margin-top:2px">Risk Score ${loc.riskScore}/100</div></div>`
      );
      m.on("click", () => onSelect && onSelect(loc.id));
      markerRefs.current[loc.id] = m;
      m.addTo(layerGroups.current.markers);
    });

    setTimeout(() => map.invalidateSize(), 200);
    window.__jatZoom = (delta) => map.setZoom(map.getZoom() + delta);

    return () => {
      delete window.__jatZoom;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // draw risk points based on filter
  useEffect(() => {
    const g = layerGroups.current.risk;
    if (!g) return;
    g.clearLayers();
    RISK_POINTS.forEach((p) => {
      if (riskFilter !== "All" && p.level !== riskFilter) return;
      L.circleMarker([p.lat, p.lng], {
        radius: p.level === "Very High" ? 9 : p.level === "High" ? 8 : p.level === "Moderate" ? 7 : 6,
        fillColor: riskColor(p.level),
        fillOpacity: 0.62,
        stroke: false,
      }).addTo(g);
    });
  }, [riskFilter]);

  // rainfall layer points
  useEffect(() => {
    const g = layerGroups.current.rainfall;
    if (!g) return;
    if (g.getLayers().length === 0) {
      RAIN_POINTS.forEach((p) => {
        L.circleMarker([p.lat, p.lng], {
          radius: 10 + p.intensity * 12,
          fillColor: "#38bdf8",
          fillOpacity: 0.14 + p.intensity * 0.18,
          stroke: false,
        }).addTo(g);
      });
    }
  }, []);

  // villages layer
  useEffect(() => {
    const g = layerGroups.current.villages;
    if (!g) return;
    g.clearLayers();
    LOCATIONS.forEach((loc) => {
      L.circleMarker([loc.latitude + 0.08, loc.longitude + 0.08], {
        radius: 4,
        fillColor: "#e2e8f0",
        fillOpacity: 0.9,
        color: "#0f172a",
        weight: 1,
      }).addTo(g);
    });
  }, []);

  // toggle layers on/off
  useEffect(() => {
    const map = mapRef.current;
    const g = layerGroups.current;
    if (!map || !g.risk) return;
    const set = (grp, on) => {
      if (!grp) return;
      if (on && !map.hasLayer(grp)) grp.addTo(map);
      if (!on && map.hasLayer(grp)) map.removeLayer(grp);
    };
    set(g.risk, layers.landslideRisk);
    set(g.rainfall, layers.rainfall);
    set(g.villages, layers.villages);
  }, [layers]);

  // selection -> open popup + pan
  useEffect(() => {
    const map = mapRef.current;
    const m = markerRefs.current[selectedId];
    if (!map || !m) return;
    const loc = LOCATIONS.find((l) => l.id === selectedId);
    if (loc) {
      map.flyTo([loc.latitude, loc.longitude], 9, { duration: 0.9 });
      setTimeout(() => m.openPopup(), 700);
    }
  }, [selectedId]);

  // external fly (e.g. locate/reset)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTarget) return;
    map.flyTo(flyTarget.center, flyTarget.zoom, { duration: 0.8 });
  }, [flyTarget]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" data-testid="leaflet-map" />;
}

export function useMapControls() {}
