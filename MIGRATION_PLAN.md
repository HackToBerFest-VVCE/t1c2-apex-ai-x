# SignalMesh AI — Migration Plan
## JATAYU to SignalMesh AI Project Upgrade

---

## Executive Summary

**Current State**: JATAYU landslide monitoring system with dual architecture (static HTML + React app) using hardcoded mock data for Northeast India districts.

**Target State**: SignalMesh AI disaster intelligence platform by Apex-AI-X, integrated with Snowflake database containing 25 nations with ML-generated risk assessments.

**Migration Approach**: Upgrade-in-place, preserve UI/UX, replace mock data with Snowflake backend, rebrand consistently.

**Risk Level**: MEDIUM — Modern React stack with good separation between data and presentation layers enables clean integration.

---

## Current Architecture Analysis

### Project Structure

The existing project has **TWO separate frontends**:

#### 1. Static HTML Frontend (`JATAYU-frontend 2/` root)
- **Tech Stack**: Plain HTML/CSS/JS, no build step
- **Files**: `index.html` (login), `dashboard.html`, `map.html`, `risk-analysis.html`, `alerts.html`, etc.
- **Dependencies**: CDN-loaded Chart.js, Leaflet, Google Fonts
- **Data**: Hardcoded JavaScript arrays at bottom of each HTML file
- **Scope**: Northeast India districts (Dima Hasao, Champhai, West Garo Hills, etc.)
- **Features**: Login, dashboard cards, donut chart, Leaflet map, alerts table, risk factors

#### 2. React SPA (`JATAYU-frontend 2/frontend/`)
- **Tech Stack**: Create React App (CRA) with CRACO, React 19, React Router 7
- **UI Framework**: Tailwind CSS + shadcn/ui (Radix UI components)
- **State Management**: React Context (`AppContext`), TanStack Query
- **Data Fetching**: axios, SWR (configured but not actively used)
- **Maps**: Leaflet with custom overlays
- **Charts**: Recharts (line charts, history visualization)
- **Routing**: React Router DOM with protected routes
- **Mock Data Location**: `src/data/` directory
  - `alerts.js` — 8 active alerts + 5 historical alerts
  - `locations.js` — 20 Northeast India locations with comprehensive risk data
  - `reports.js` — 4 field reports with AI verification status

### React App Features (Current Implementation)

**Pages**:
- Login page with authentication flow
- Dashboard: Risk stat cards, donut chart, recent alerts
- Map: Interactive Leaflet map with risk zones, search, layers, filters
- Risk Analysis: Multi-tab detailed view (Overview, Factors, History, Impact, Recommendations)
- Alerts: Active alerts table with filtering
- Field Reports: Citizen reports with AI verification
- Report Activity: Form to submit new observations
- Data Layers, History, Settings (stub pages)

**Components**:
- `Layout` with `Sidebar` and `Header`
- `MapView` with Leaflet integration
- `LocationDetails` panel
- `RiskBadge`, `FactorRow`, `DonutChart`
- `AIVerification` status display
- Full shadcn/ui component library (50+ components)

**Mock Data Structure** (`locations.js`):
```javascript
{
  id: "dima-hasao",
  name: "Dima Hasao",
  state: "Assam",
  latitude: 25.77,
  longitude: 93.03,
  riskLevel: "Very High",
  riskScore: 87,
  rainfall: 85,
  soilMoisture: 78,
  slopeGradient: 82,
  landCoverChange: 56,
  earthquakeRisk: 15,
  roads: 3,
  villages: 2,
  infrastructure: 1,
  population: 4200,
  summary: "High rainfall and soil moisture...",
  history: [{date: "27 Apr", score: 52}, ...],
  recommendations: ["Increase field inspection frequency...", ...]
}
```

### Technology Stack Assessment

**Strengths**:
- Modern React 19 with proper routing and state management
- Clean separation between data layer (`src/data/`) and presentation
- TanStack Query configured for data fetching (ready for API integration)
- axios already installed for HTTP requests
- Environment variables support via dotenv
- Tailwind + shadcn/ui provides consistent, accessible design system
- Recharts and Leaflet work well with dynamic data

**Integration Points**:
- Replace `src/data/*.js` exports with API service layer
- Use TanStack Query for data fetching with loading/error states
- axios for Snowflake backend API calls
- Environment variables for backend URL configuration

---

## Snowflake Database Schema

### Existing Tables

**SIGNALMESH_AI.DISASTER_RISK.NATION_FEATURES** (25 nations, populated):
- `nation_key` INTEGER PRIMARY KEY
- `nation_name` VARCHAR(100) — e.g., "INDIA", "JAPAN", "BRAZIL"
- `region_name` VARCHAR(100) — e.g., "ASIA", "AMERICA"
- `precipitation_index` FLOAT — Synthetic, 0-100
- `terrain_slope_factor` FLOAT — Synthetic, 0-100
- `soil_stability_index` FLOAT — Synthetic, 0-100 (lower = more unstable)
- `seismic_activity_level` FLOAT — Synthetic, 0-100
- `vegetation_cover` FLOAT — Synthetic, 0-100
- `customer_count` INTEGER — Proxy for data density
- `data_source` VARCHAR(50) — 'SYNTHETIC_DEMO'
- `created_at` TIMESTAMP_NTZ

**SIGNALMESH_AI.DISASTER_RISK.RISK_ASSESSMENT** (may be empty until ML model runs):
- `assessment_id` INTEGER AUTOINCREMENT PRIMARY KEY
- `nation_key` INTEGER
- `nation_name` VARCHAR(100)
- `region_name` VARCHAR(100)
- `risk_score` FLOAT — ML-generated, 0-100
- `risk_level` VARCHAR(20) — LOW, MEDIUM, HIGH, EXTREME
- `confidence_score` FLOAT — 0-1, uncalibrated
- `top_risk_factor_1`, `top_risk_factor_2`, `top_risk_factor_3` VARCHAR(100)
- `top_risk_factor_1_importance`, etc. FLOAT
- `model_version` VARCHAR(50) — 'v1.0_random_forest'
- `assessed_at` TIMESTAMP_NTZ

**SIGNALMESH_AI.DISASTER_RISK.NATION_RISK_SUMMARY** (view):
- Joins NATION_FEATURES and RISK_ASSESSMENT
- Left join handles empty RISK_ASSESSMENT gracefully

### Data Mapping Challenge

**Problem**: Current app shows **20 Northeast India districts** (sub-national level), but Snowflake has **25 nations** (country level).

**Solutions**:
1. **Scope Shift**: Change app focus from India-only districts to global nation-level risk monitoring
   - Pro: Direct 1:1 mapping, simple integration
   - Con: Loses original Northeast India focus
   
2. **Hybrid Display**: Show both nation-level (Snowflake) and district-level (mock) data
   - Pro: Preserves original context
   - Con: Complex, confusing to users
   
3. **India Sub-Region Expansion**: Extend Snowflake to include India states/districts
   - Pro: Maintains original domain focus
   - Con: Requires additional Snowflake schema changes, out of scope

**RECOMMENDED**: Solution 1 — Shift to global nation-level monitoring. This aligns with "SignalMesh AI" brand positioning as international disaster intelligence platform.

---

## Migration Strategy

### Phase 1: Project Backup and Environment Setup

**Actions**:
- Create git commit before any changes
- Copy `.env.example` template with placeholders
- Update `.gitignore` to exclude credentials
- Document current working state

**Deliverables**:
- Git commit hash for rollback
- `.env.example` file
- Updated `.gitignore`

### Phase 2: Branding Update

**Changes Required**:

#### A. React App (`frontend/`)
- `package.json`: Change `name` and add `description`
- `public/index.html`: Update `<title>` and `<meta>` tags
- `src/pages/Login.jsx`: Update app name in login screen
- `src/components/Header.jsx`: Update header branding
- `src/components/Sidebar.jsx`: Update sidebar branding
- `README.md`: Replace JATAYU with SignalMesh AI
- Logo files: Keep existing eagle logo (represents Jatayu from mythology), update alt text

#### B. Static HTML Frontend (`root/`)
- **Decision**: Archive or delete static HTML files, focus on React app only
- Rationale: React app is more maintainable, better suited for API integration

**Branding Rules**:
- Application Name: **SignalMesh AI**
- Team Name: **Apex-AI-X**
- Tagline: "AI-Powered Disaster Intelligence Platform"
- Domain: Global landslide risk assessment
- Keep visual design, colors, layout unchanged

### Phase 3: Backend Integration Architecture

**Problem**: Snowflake credentials cannot be exposed in browser JavaScript.

**Solution**: Create secure backend API layer.

#### Option A: Node.js/Express Backend (RECOMMENDED)
**Pros**:
- Simple to implement
- Can run on same development machine
- Easy CORS configuration
- Fast iteration during development

**Cons**:
- Requires separate process
- Not serverless
- Manual deployment setup

**Implementation**:
```
backend/
  src/
    server.js          # Express server
    routes/
      locations.js     # GET /api/locations
      assessments.js   # GET /api/assessments
    services/
      snowflake.js     # Snowflake connection logic
    middleware/
      cors.js          # CORS configuration
  .env                 # Snowflake credentials
  package.json
```

#### Option B: Serverless Functions (Vercel, Netlify, AWS Lambda)
**Pros**:
- No server management
- Scales automatically
- Easy deployment

**Cons**:
- More complex setup
- Cold start latency
- Platform-specific configuration

**RECOMMENDATION**: Start with Option A (Express backend) for development, can migrate to serverless for production deployment.

### Phase 4: Data Layer Migration

#### A. Create API Service Layer

**File**: `frontend/src/services/api.js`
```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const api = {
  // Fetch all nation features with risk assessments
  getLocations: async () => {
    const response = await axios.get(`${API_BASE_URL}/locations`);
    return response.data;
  },
  
  // Fetch single nation by key
  getLocation: async (nationKey) => {
    const response = await axios.get(`${API_BASE_URL}/locations/${nationKey}`);
    return response.data;
  },
  
  // Fetch alerts (derived from high-risk nations)
  getAlerts: async () => {
    const response = await axios.get(`${API_BASE_URL}/alerts`);
    return response.data;
  },
  
  // Fetch field reports (if implemented)
  getReports: async () => {
    const response = await axios.get(`${API_BASE_URL}/reports`);
    return response.data;
  }
};
```

#### B. Create Data Transformation Layer

**Challenge**: Snowflake schema differs from current mock data structure.

**File**: `frontend/src/services/dataMapper.js`
```javascript
// Transform Snowflake nation data to app location format
export const mapNationToLocation = (nation) => {
  // Map Snowflake columns to app properties
  return {
    id: `nation-${nation.nation_key}`,
    nationKey: nation.nation_key,
    name: nation.nation_name,
    region: nation.region_name,
    // Map Snowflake environmental features to app risk factors
    riskLevel: nation.risk_level || 'Unknown',
    riskScore: Math.round(nation.risk_score || 0),
    rainfall: Math.round(nation.precipitation_index || 0),
    soilMoisture: Math.round(100 - (nation.soil_stability_index || 50)), // Invert
    slopeGradient: Math.round(nation.terrain_slope_factor || 0),
    earthquakeRisk: Math.round(nation.seismic_activity_level || 0),
    vegetationCover: Math.round(nation.vegetation_cover || 0),
    // Coordinates needed for map (requires geocoding service or hardcoded lookup)
    latitude: getNationCoordinates(nation.nation_name).lat,
    longitude: getNationCoordinates(nation.nation_name).lng,
    // Default values for fields not in Snowflake
    roads: 0,
    villages: 0,
    infrastructure: 0,
    population: nation.customer_count * 1000, // Rough estimate
    summary: generateRiskSummary(nation),
    history: [], // Historical data not yet in Snowflake
    recommendations: generateRecommendations(nation.risk_level),
    confidenceScore: nation.confidence_score,
    topRiskFactors: [
      { name: nation.top_risk_factor_1, importance: nation.top_risk_factor_1_importance },
      { name: nation.top_risk_factor_2, importance: nation.top_risk_factor_2_importance },
      { name: nation.top_risk_factor_3, importance: nation.top_risk_factor_3_importance }
    ].filter(f => f.name)
  };
};
```

#### C. Update Pages to Use API

**Pattern**: Replace static imports with TanStack Query hooks.

**Before** (`Dashboard.jsx`):
```javascript
import { LOCATIONS } from "@/data/locations";
import { ALERTS } from "@/data/alerts";
```

**After**:
```javascript
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export default function Dashboard() {
  const { data: locations, isLoading, error } = useQuery({
    queryKey: ['locations'],
    queryFn: api.getLocations
  });
  
  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: api.getAlerts
  });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorState message="Failed to load data" />;
  if (!locations?.length) return <EmptyState message="No risk data available" />;
  
  // Rest of component using locations and alerts
}
```

#### D. Handle Empty RISK_ASSESSMENT Table

**Scenario**: RISK_ASSESSMENT table may be empty until ML model runs.

**Solution**: Backend returns NATION_FEATURES with null risk scores, frontend shows graceful empty state.

```javascript
{
  nation_name: "INDIA",
  risk_score: null,
  risk_level: null,
  confidence_score: null
}
```

**Frontend Handling**:
```javascript
const riskLevel = location.riskLevel || 'Unknown';
const riskScore = location.riskScore ?? 0;
const showRiskWarning = !location.riskLevel; // Show "Awaiting assessment" badge
```

### Phase 5: Map Coordinate Handling

**Challenge**: Snowflake has nation names but no lat/lng coordinates.

**Solutions**:

#### Option A: Hardcoded Lookup Table (RECOMMENDED for hackathon)
```javascript
const NATION_COORDINATES = {
  'INDIA': { lat: 20.5937, lng: 78.9629 },
  'JAPAN': { lat: 36.2048, lng: 138.2529 },
  'CHINA': { lat: 35.8617, lng: 104.1954 },
  // ... all 25 nations
};
```

#### Option B: Geocoding API (Google Maps, Mapbox)
- Pro: Dynamic, accurate
- Con: Requires API key, costs money, rate limits

#### Option C: Extend Snowflake Schema
- Add `latitude` and `longitude` columns to NATION_FEATURES
- Update with one-time data population
- Pro: Data lives in single source of truth
- Con: Requires Snowflake schema modification

**RECOMMENDATION**: Option A for initial implementation, Option C for production.

### Phase 6: UI Adaptation for Global Scope

**Changes Required**:

1. **Map View**: Change default center/zoom to show world map instead of Northeast India
   - Current: `center: [25.6, 92.8], zoom: 7` (Northeast India)
   - New: `center: [20, 0], zoom: 2` (World view)

2. **Location Labels**: Remove "state" field, use "region" instead
   - Current: "Dima Hasao, Assam"
   - New: "INDIA, ASIA"

3. **Risk Factor Labels**: Update to match Snowflake terminology
   - Current: "72-hour Rainfall", "Soil Moisture"
   - New: "Precipitation Index", "Soil Stability Index"

4. **Add Data Disclaimers**:
   ```javascript
   <Alert variant="info">
     <InfoIcon className="h-4 w-4" />
     <AlertDescription>
       Environmental features are synthetic demonstration data. 
       Risk assessments are generated by uncalibrated ML models 
       for hackathon prototype purposes only.
     </AlertDescription>
   </Alert>
   ```

5. **Empty State Handling**:
   - No historical data: "Historical risk data not yet available"
   - No risk assessment: "Risk assessment pending — run ML model to generate"
   - No field reports: "Field reporting not yet implemented for nation-level monitoring"

### Phase 7: Backend Implementation

**File**: `backend/src/server.js`
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const snowflake = require('snowflake-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// Snowflake connection
const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA
});

connection.connect((err) => {
  if (err) {
    console.error('Failed to connect to Snowflake:', err);
    process.exit(1);
  }
  console.log('Connected to Snowflake');
});

// API Routes
app.get('/api/locations', async (req, res) => {
  const query = `SELECT * FROM NATION_RISK_SUMMARY ORDER BY nation_name`;
  
  connection.execute({
    sqlText: query,
    complete: (err, stmt, rows) => {
      if (err) {
        console.error('Query failed:', err);
        return res.status(500).json({ error: 'Database query failed' });
      }
      res.json(rows);
    }
  });
});

app.get('/api/locations/:nationKey', async (req, res) => {
  const query = `SELECT * FROM NATION_RISK_SUMMARY WHERE nation_key = ?`;
  
  connection.execute({
    sqlText: query,
    binds: [req.params.nationKey],
    complete: (err, stmt, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database query failed' });
      }
      if (!rows.length) {
        return res.status(404).json({ error: 'Nation not found' });
      }
      res.json(rows[0]);
    }
  });
});

app.get('/api/alerts', async (req, res) => {
  // Derive alerts from high-risk nations
  const query = `
    SELECT * FROM NATION_RISK_SUMMARY 
    WHERE risk_level IN ('HIGH', 'EXTREME')
    ORDER BY risk_score DESC
  `;
  
  connection.execute({
    sqlText: query,
    complete: (err, stmt, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database query failed' });
      }
      // Transform to alert format
      const alerts = rows.map(row => ({
        id: `AL-${row.NATION_KEY}`,
        nationKey: row.NATION_KEY,
        name: row.NATION_NAME,
        region: row.REGION_NAME,
        riskLevel: row.RISK_LEVEL,
        riskScore: row.RISK_SCORE,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: 'Active'
      }));
      res.json(alerts);
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
```

**File**: `backend/.env.example`
```
SNOWFLAKE_ACCOUNT=your_account.region
SNOWFLAKE_USERNAME=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=SNOWFLAKE_LEARNING_WH
SNOWFLAKE_DATABASE=SIGNALMESH_AI
SNOWFLAKE_SCHEMA=DISASTER_RISK
PORT=5000
```

**File**: `backend/package.json`
```json
{
  "name": "signalmesh-backend",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "snowflake-sdk": "^1.9.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Phase 8: Testing and Verification

**Testing Checklist**:
- [ ] Backend connects to Snowflake successfully
- [ ] `/api/locations` returns 25 nations
- [ ] `/api/locations/:nationKey` returns single nation
- [ ] INDIA is present in results
- [ ] Frontend displays loading state during fetch
- [ ] Frontend displays error state on API failure
- [ ] Frontend displays empty state when RISK_ASSESSMENT is empty
- [ ] Map renders with world view
- [ ] Clicking nation on map shows details panel
- [ ] Dashboard cards update with Snowflake data
- [ ] Risk analysis page shows nation-level factors
- [ ] Data disclaimers visible throughout app
- [ ] No Snowflake credentials in frontend code
- [ ] No Snowflake credentials committed to git
- [ ] `.env` file in `.gitignore`
- [ ] Build succeeds without warnings
- [ ] Branding updated consistently

---

## File Modification Checklist

### Files to CREATE
- [ ] `backend/` directory with Express server
- [ ] `backend/src/server.js`
- [ ] `backend/package.json`
- [ ] `backend/.env` (local only, not committed)
- [ ] `backend/.env.example`
- [ ] `frontend/.env.example`
- [ ] `frontend/src/services/api.js`
- [ ] `frontend/src/services/dataMapper.js`
- [ ] `frontend/src/services/coordinates.js` (nation lat/lng lookup)
- [ ] `frontend/src/components/LoadingState.jsx`
- [ ] `frontend/src/components/ErrorState.jsx`
- [ ] `frontend/src/components/EmptyState.jsx`
- [ ] `frontend/src/components/DataDisclaimer.jsx`
- [ ] `SETUP_INSTRUCTIONS.md`

### Files to MODIFY
- [ ] `frontend/package.json` (name, description)
- [ ] `frontend/public/index.html` (title, meta tags)
- [ ] `frontend/src/pages/Login.jsx` (branding)
- [ ] `frontend/src/pages/Dashboard.jsx` (API integration)
- [ ] `frontend/src/pages/MapPage.jsx` (API integration, world view)
- [ ] `frontend/src/pages/RiskAnalysis.jsx` (API integration)
- [ ] `frontend/src/pages/Alerts.jsx` (API integration)
- [ ] `frontend/src/pages/FieldReports.jsx` (empty state or remove)
- [ ] `frontend/src/components/Header.jsx` (branding)
- [ ] `frontend/src/components/Sidebar.jsx` (branding)
- [ ] `frontend/src/components/MapView.jsx` (world coordinates)
- [ ] `frontend/src/components/LocationDetails.jsx` (nation format)
- [ ] `frontend/src/components/FactorRow.jsx` (updated labels)
- [ ] `frontend/README.md` (setup instructions)
- [ ] `README.md` (root, project overview)
- [ ] `.gitignore` (add `.env`, `backend/.env`)

### Files to ARCHIVE (move to `_archive/` or delete)
- [ ] `JATAYU-frontend 2/index.html`
- [ ] `JATAYU-frontend 2/dashboard.html`
- [ ] `JATAYU-frontend 2/map.html`
- [ ] `JATAYU-frontend 2/risk-analysis.html`
- [ ] `JATAYU-frontend 2/alerts.html`
- [ ] `JATAYU-frontend 2/report-activity.html`
- [ ] `JATAYU-frontend 2/field-reports.html`
- [ ] `JATAYU-frontend 2/data-layers.html`
- [ ] `JATAYU-frontend 2/history.html`
- [ ] `JATAYU-frontend 2/settings.html`
- [ ] `JATAYU-frontend 2/assets/` (CSS/JS for static HTML)

**Rationale**: Static HTML frontend is superseded by React app. Archive for reference but focus development on React version.

### Files to KEEP AS-IS
- [ ] All shadcn/ui components in `frontend/src/components/ui/`
- [ ] `frontend/craco.config.js`
- [ ] `frontend/tailwind.config.js`
- [ ] `frontend/postcss.config.js`
- [ ] All public assets (logos, images)
- [ ] `frontend/src/context/AppContext.jsx` (may need minor updates)
- [ ] `frontend/src/lib/` utilities

---

## Risk Assessment

### Low Risks ✅
- Branding update (find/replace, no logic changes)
- Backend API creation (standard Express + Snowflake SDK pattern)
- TanStack Query integration (already configured, just needs usage)
- Build process (no changes needed)

### Medium Risks ⚠️
- **Data structure mismatch** (district vs nation level)
  - Mitigation: Clear transformation layer, comprehensive mapping functions
- **Empty RISK_ASSESSMENT table** (may have no ML data yet)
  - Mitigation: Graceful empty states, clear messaging
- **Coordinate lookup** (nations need lat/lng for map)
  - Mitigation: Hardcoded lookup table for 25 nations
- **Historical data absence** (Snowflake has no time-series yet)
  - Mitigation: Hide/disable history tab or show empty state

### High Risks 🚨
- **Snowflake credentials exposure**
  - Mitigation: Backend API layer, never frontend-direct connection
  - Verification: Code review, git history scan before commit
- **Backend deployment complexity**
  - Mitigation: Start with local development, document deployment separately
- **Feature loss** (field reports, citizen submissions not in Snowflake)
  - Mitigation: Show "Coming soon" placeholders or remove pages

---

## Timeline Estimate

### Phase 1: Backup & Setup (30 min)
- Git commit
- Environment file templates
- Update `.gitignore`

### Phase 2: Branding (1 hour)
- Update all text references
- Update package.json
- Update README files
- Archive static HTML files

### Phase 3: Backend Setup (2 hours)
- Create Express server
- Install snowflake-sdk
- Implement API routes
- Test Snowflake connection
- Verify queries return data

### Phase 4: Frontend Data Layer (2 hours)
- Create API service layer
- Create data mapper
- Create coordinate lookup
- Implement loading/error/empty states

### Phase 5: Frontend Integration (3 hours)
- Update Dashboard with TanStack Query
- Update MapPage with world view
- Update RiskAnalysis page
- Update Alerts page
- Add data disclaimers

### Phase 6: Testing & Fixes (2 hours)
- End-to-end testing
- Bug fixes
- Edge case handling
- Documentation updates

**Total Estimated Time: 10-11 hours**

---

## Success Criteria

### Must Have ✅
- [ ] Application rebranded as SignalMesh AI by Apex-AI-X
- [ ] Backend API securely connects to Snowflake
- [ ] Frontend fetches and displays 25 nations from Snowflake
- [ ] INDIA visible in map and location list
- [ ] Map shows world view with clickable nation markers
- [ ] Dashboard shows risk statistics from Snowflake data
- [ ] Risk analysis page displays nation-level details
- [ ] Data disclaimers clearly label synthetic data
- [ ] No credentials exposed in frontend or git history
- [ ] Application builds and runs without errors
- [ ] README updated with setup instructions

### Should Have 🎯
- [ ] Loading states during data fetch
- [ ] Error states on API failure
- [ ] Empty states when RISK_ASSESSMENT is empty
- [ ] Alerts derived from high-risk nations
- [ ] Basic historical risk chart (even with limited data)
- [ ] Confidence scores displayed where available
- [ ] Top risk factors shown in analysis view

### Nice to Have 🌟
- [ ] Field reports integrated (requires additional backend)
- [ ] Real-time data updates
- [ ] Historical time-series from Snowflake
- [ ] Export functionality
- [ ] Admin dashboard for ML model management
- [ ] Deployment guide for production

---

## Rollback Plan

If critical issues arise:

1. **Git Revert**: `git reset --hard <commit-hash>` to pre-migration state
2. **Restore Original**: JATAYU project fully recoverable from git history
3. **Backup Location**: Migration work preserved in feature branch `feature/snowflake-integration`

---

## Next Steps After This Plan

1. **Review this plan** with user for approval
2. **Get Snowflake credentials** for backend configuration
3. **Execute Phase 1-2** (backup, branding) — low risk, immediate value
4. **Execute Phase 3** (backend) — validate Snowflake connection
5. **Execute Phase 4-5** (frontend integration) — replace mock data
6. **Execute Phase 6** (testing) — end-to-end verification
7. **Document** final setup instructions
8. **Report** completion with verification screenshots

---

## Questions for User

Before proceeding, please confirm:

1. **Which frontend to prioritize?**
   - Recommendation: Focus on React app, archive static HTML
   - Alternative: Integrate both (significantly more work)

2. **Scope change approval?**
   - Current: Northeast India districts (sub-national)
   - Proposed: Global nations (country-level)
   - This affects UI labels, map scope, and data interpretation

3. **Backend hosting preference?**
   - Development: Local Express server (localhost:5000)
   - Production: Vercel serverless functions? AWS Lambda? Other?

4. **Snowflake credentials**:
   - Ready to provide for backend `.env` file?
   - Account identifier, username, password, warehouse name

5. **Field reports feature**:
   - Keep with "Coming soon" placeholder?
   - Remove entirely?
   - Implement mock version (not connected to Snowflake)?

6. **ML model execution**:
   - When will `run_model.py` be executed to populate RISK_ASSESSMENT?
   - Should frontend handle empty risk scores gracefully until then?

---

**Migration Plan Version**: 1.0  
**Created**: 2026-10-27  
**Author**: Kiro (SignalMesh AI Migration)  
**Status**: AWAITING APPROVAL
