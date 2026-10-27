# SignalMesh AI — Complete Setup Guide

**Project**: SignalMesh AI — AI-Powered Disaster Intelligence Platform  
**Team**: Apex-AI-X  
**Status**: Migration Complete (Stage A, B, C)

This guide provides step-by-step instructions for running the SignalMesh AI application with Snowflake integration.

---

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                 │         │                  │         │                  │
│  React Frontend │────────▶│  Express Backend │────────▶│    Snowflake     │
│  (Port 3000)    │  HTTP   │  (Port 5000)     │  SDK    │    Database      │
│                 │         │                  │         │                  │
└─────────────────┘         └──────────────────┘         └──────────────────┘
     JATAYU-frontend 2/           backend/              SIGNALMESH_AI
                                                        .DISASTER_RISK
```

**Security Model**:
- Frontend runs in browser (public, no secrets)
- Backend runs on server (private, has Snowflake credentials)
- All Snowflake queries executed server-side
- Credentials stored in backend `.env` file (git-ignored)

---

## Prerequisites

### Required Software
- **Node.js** 18+ — [Download](https://nodejs.org/)
- **npm** or **yarn** — Included with Node.js
- **Git** — For version control
- **Snowflake Account** — With `SIGNALMESH_AI` database created

### Required Access
- Snowflake credentials (account, username, password, warehouse)
- Network access to Snowflake

### Workspace Structure
```
hacktober/
├── backend/                    # Express API server
│   ├── src/server.js
│   ├── package.json
│   ├── .env.example           # Template
│   └── .env                   # Your credentials (create this)
├── JATAYU-frontend 2/
│   └── frontend/              # React application
│       ├── src/
│       ├── package.json
│       ├── .env.example       # Template
│       └── .env               # API config (created)
├── sql/
│   └── 02_create_schema.sql   # Snowflake setup
└── SETUP.md                   # This file
```

---

## Part 1: Snowflake Database Setup

### Step 1.1: Execute Schema Creation

**If you haven't already**, run the Snowflake schema creation script:

1. Open Snowflake web console
2. Navigate to Worksheets
3. Open `sql/02_create_schema.sql` from this workspace
4. Execute the entire script
5. Verify completion:
   ```sql
   SELECT COUNT(*) FROM SIGNALMESH_AI.DISASTER_RISK.NATION_FEATURES;
   -- Should return: 25
   
   SELECT * FROM SIGNALMESH_AI.DISASTER_RISK.NATION_FEATURES 
   WHERE nation_name = 'INDIA';
   -- Should return: 1 row with INDIA data
   ```

### Step 1.2: (Optional) Generate Risk Assessments

To populate the `RISK_ASSESSMENT` table with ML-generated scores:

```bash
# From workspace root
py run_model.py
```

This generates `output/risk_assessment_inserts.sql`. Execute that SQL in Snowflake to populate risk scores.

**Note**: The application works even if `RISK_ASSESSMENT` is empty (shows "pending assessment" state).

---

## Part 2: Backend Setup

### Step 2.1: Install Dependencies

```bash
cd backend
npm install
```

**Expected output**: 344 packages installed

### Step 2.2: Configure Snowflake Credentials

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `backend/.env` with your Snowflake credentials:
   ```env
   SNOWFLAKE_ACCOUNT=your_account.region
   SNOWFLAKE_USERNAME=your_username
   SNOWFLAKE_PASSWORD=your_password
   SNOWFLAKE_WAREHOUSE=SNOWFLAKE_LEARNING_WH
   SNOWFLAKE_DATABASE=SIGNALMESH_AI
   SNOWFLAKE_SCHEMA=DISASTER_RISK
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

   **How to find your Snowflake account identifier**:
   - Format: `<account>.<region>`
   - Example: `xy12345.us-east-1`
   - Found in Snowflake web URL or account admin settings

3. **VERIFY `.env` IS GIT-IGNORED**:
   ```bash
   git status
   # Should NOT show .env file in untracked files
   ```

### Step 2.3: Start Backend Server

```bash
npm run dev
```

**Expected output**:
```
============================================================
🚀 SignalMesh AI Backend Server
============================================================
✅ Server running on http://localhost:5000
📊 Environment: development
🔗 CORS Origin: http://localhost:3000
============================================================
✅ Connected to Snowflake successfully
   Database: SIGNALMESH_AI
   Schema: DISASTER_RISK
============================================================
```

**If credentials are missing or incorrect**:
```
⚠️  Missing required environment variables: SNOWFLAKE_ACCOUNT, SNOWFLAKE_USERNAME, SNOWFLAKE_PASSWORD
⚠️  Snowflake integration disabled. Configure .env to enable.
✅ Server running on http://localhost:5000
```

This is **OK for testing** — backend runs but Snowflake features disabled.

### Step 2.4: Test Backend Health

Open new terminal (keep backend running):

```bash
curl http://localhost:5000/health
```

**Expected response** (if Snowflake connected):
```json
{
  "status": "ok",
  "service": "SignalMesh AI Backend",
  "version": "1.0.0",
  "timestamp": "2025-05-03T...",
  "snowflake": {
    "configured": true,
    "connected": true,
    "error": null,
    "lastAttempt": "2025-05-03T..."
  }
}
```

**If Snowflake not connected** (`connected: false`), check:
- `.env` file exists in `backend/` directory
- All required variables are set
- Account identifier format is correct
- Username and password are correct
- Network can reach Snowflake

### Step 2.5: Test Data Endpoints

```bash
# Get all nations (should return 25)
curl http://localhost:5000/api/nation-features

# Get INDIA specifically
curl http://localhost:5000/api/nation/8

# Get combined summary
curl http://localhost:5000/api/nation-summary
```

---

## Part 3: Frontend Setup

### Step 3.1: Install Dependencies

```bash
cd "JATAYU-frontend 2/frontend"
npm install
```

**Expected output**: 1000+ packages installed (React ecosystem)

### Step 3.2: Verify Environment Configuration

Frontend `.env` file has been created with:
```env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_ENABLE_SNOWFLAKE_INTEGRATION=true
REACT_APP_SHOW_DEMO_DATA=true
REACT_APP_MODE=development
```

**No changes needed** for local development.

### Step 3.3: Start Frontend

```bash
npm start
```

**Expected output**:
```
Compiled successfully!

You can now view signalmesh-ai-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

Browser should automatically open to `http://localhost:3000`

### Step 3.4: Verify Application

1. **Login Page**:
   - Should show "SignalMesh AI" branding
   - "AI-Powered Disaster Intelligence by Apex-AI-X"
   - Login with: `admin` / `admin123`

2. **Dashboard**:
   - Snowflake connection status banner at top (green if connected, amber if not)
   - "DEMO DATA" badge on district sections
   - District cards show Northeast India locations
   - Data disclaimer visible

3. **Check Console** (F12 → Console tab):
   - No errors about missing modules
   - API calls to `http://localhost:5000` succeed

---

## Part 4: Verification Checklist

### Backend ✅

- [ ] `npm install` completed without errors
- [ ] `.env` file created with Snowflake credentials
- [ ] `.env` is NOT shown in `git status`
- [ ] Server starts on port 5000
- [ ] `/health` endpoint returns JSON
- [ ] Snowflake `connected: true` in health response
- [ ] `/api/nation-features` returns 25 nations
- [ ] INDIA (nation_key: 8) present in results

### Frontend ✅

- [ ] `npm install` completed without errors
- [ ] `.env` file exists with backend URL
- [ ] `npm start` compiles successfully
- [ ] Application opens in browser on port 3000
- [ ] Login page shows SignalMesh AI branding
- [ ] Can login with admin/admin123
- [ ] Dashboard displays without errors
- [ ] Snowflake status widget shows connection state
- [ ] Data source badges visible (DEMO badges on districts)
- [ ] No console errors about missing components

### Integration ✅

- [ ] Frontend can call backend API (check Network tab in browser)
- [ ] Snowflake status updates correctly (green if connected, amber if not)
- [ ] Dashboard shows district-level demo data
- [ ] Data disclaimers clearly label demonstration data
- [ ] No Snowflake credentials visible in browser dev tools

---

## Part 5: Development Workflow

### Running Both Servers

**Terminal 1** (Backend):
```bash
cd backend
npm run dev
```

**Terminal 2** (Frontend):
```bash
cd "JATAYU-frontend 2/frontend"
npm start
```

Both must be running for full functionality.

### Making Changes

**Backend changes**:
- Server auto-restarts (nodemon) when files change
- No manual restart needed

**Frontend changes**:
- React hot-reloads automatically
- Browser updates without refresh

### Stopping Servers

Press `Ctrl+C` in each terminal to stop.

---

## Part 6: Data Sources Explained

### District-Level Data (DEMO)

**Source**: `JATAYU-frontend 2/frontend/src/data/locations.js`  
**Scope**: 20 Northeast India districts  
**Purpose**: Demonstrate UI/UX for district-level monitoring  
**Label**: 🎭 DEMO DATA badge throughout application

**Districts included**:
- Assam: Dima Hasao, Karbi Anglong, Guwahati
- Mizoram: Champhai, Aizawl, Lunglei
- Meghalaya: West Garo Hills, Cherrapunji, Shillong
- Nagaland: Peren, Kohima, Mokokchung
- Manipur: Tamenglong, Ukhrul, Imphal
- Arunachal Pradesh: Tawang, Itanagar, Papum Pare
- Tripura: Dhalai, Agartala

**Why demo?**: Real district-level environmental data not yet available. Values are synthetic for prototype demonstration.

### Nation-Level Data (LIVE from Snowflake)

**Source**: `SIGNALMESH_AI.DISASTER_RISK` schema in Snowflake  
**Scope**: 25 nations worldwide (including INDIA)  
**Purpose**: Demonstrate Snowflake integration and ML risk assessment  
**Label**: ✅ SNOWFLAKE LIVE badge

**Nations included**: INDIA, JAPAN, CHINA, BRAZIL, USA, and 20 others

**Why separate?**: Nation-level and district-level are incompatible geographic scales. Cannot map INDIA country risk to individual Dima Hasao district risk.

### Data Compatibility

**See**: `DATA_COMPATIBILITY_ANALYSIS.md` for detailed explanation

**Key principle**: Never conflate nation-level scores with district-level predictions. Keep data sources clearly labeled and separated.

---

## Part 7: Troubleshooting

### "Cannot find module '@/services/api'"

**Solution**: Frontend import alias `@` might not be configured. Check `jsconfig.json` or restart dev server.

### "CORS policy: No 'Access-Control-Allow-Origin'"

**Solution**: 
- Ensure backend is running on port 5000
- Verify `CORS_ORIGIN=http://localhost:3000` in backend `.env`
- Check frontend is accessing `http://localhost:3000` (not `127.0.0.1`)

### "Backend server not responding"

**Solution**:
- Verify backend is running: `curl http://localhost:5000/health`
- Check port 5000 not used by another process
- Review backend terminal for error messages

### "Snowflake connection failed"

**Solution**:
- Verify credentials in `backend/.env` are correct
- Check account identifier format: `account.region`
- Ensure warehouse exists and is running
- Verify database `SIGNALMESH_AI` exists
- Test credentials in Snowflake web console first

### "Module not found: Can't resolve 'snowflake-sdk'"

**Solution**: This is **correct** — `snowflake-sdk` should only be in backend, never frontend. If you see this error in frontend build, you've accidentally imported backend code in frontend.

### Frontend builds but shows blank page

**Solution**:
- Check browser console for errors (F12)
- Verify all component imports resolve
- Check for missing UI components from shadcn/ui

---

## Part 8: Production Deployment Notes

**Not yet configured**, but when deploying:

### Backend Deployment

- Set environment variables in hosting platform (not `.env` file)
- Use production Snowflake warehouse
- Set `NODE_ENV=production`
- Update `CORS_ORIGIN` to production frontend URL
- Enable HTTPS
- Consider adding rate limiting and authentication

### Frontend Deployment

- Build: `npm run build` in frontend directory
- Update `REACT_APP_API_BASE_URL` to production backend URL
- Deploy `build/` folder to static hosting (Vercel, Netlify, S3, etc.)
- Configure HTTPS

---

## Part 9: Next Steps

### Immediate Enhancements

1. **Add Global Overview Page**:
   - New tab in navigation
   - World map showing all 25 nations from Snowflake
   - Table of nation-level risks
   - Clearly labeled as "Live Snowflake Data"

2. **Integrate Risk Assessments**:
   - Run `py run_model.py` to generate ML scores
   - Execute generated SQL in Snowflake
   - Frontend automatically displays risk scores when available

3. **Historical Data**:
   - Add time-series tracking to Snowflake
   - Store daily risk score snapshots
   - Display historical charts

### Future Enhancements

4. **Sub-Regional Data**:
   - Extend Snowflake schema to include India states/districts
   - Collect real environmental data for Northeast India
   - Replace demo district data with live Snowflake queries

5. **Real-Time Updates**:
   - WebSocket connection for live alerts
   - Automatic dashboard refresh
   - Push notifications

6. **Advanced Analytics**:
   - Correlation analysis between factors
   - Predictive modeling improvements
   - Integration with real meteorological APIs

---

## Support & Documentation

**Files to Reference**:
- `backend/README.md` — Backend API documentation
- `DATA_COMPATIBILITY_ANALYSIS.md` — Data scope explanation
- `MIGRATION_PLAN.md` — Complete migration strategy
- `VALIDATION_REPORT.md` — Phase 2 ML model validation

**Testing Endpoints**:
- Backend health: `http://localhost:5000/health`
- API info: `http://localhost:5000/api`
- Nation data: `http://localhost:5000/api/nation-features`

---

## Status Summary

### ✅ Completed
- Stage A: Branding updated to SignalMesh AI by Apex-AI-X
- Stage B: Secure Express backend with Snowflake integration
- Stage C: Frontend API service layer and status components
- Security: Credentials properly isolated in git-ignored .env files
- Documentation: Complete setup guide and data compatibility analysis

### ⏳ Pending
- Snowflake credentials configuration (user action required)
- Running ML model to populate RISK_ASSESSMENT table (optional)
- Global Overview page implementation (future enhancement)
- Production deployment configuration (future)

### ✅ Verified
- Backend installs and starts successfully
- Backend health endpoint responds correctly
- Frontend React app still builds and runs
- No credentials exposed in frontend code
- Data source badges and disclaimers implemented

---

**SignalMesh AI v1.0**  
**Setup Guide Version**: 1.0  
**Last Updated**: 2026-10-27  
**Team**: Apex-AI-X
