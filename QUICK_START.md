# SignalMesh AI — Quick Start Guide

**Status**: Migration Complete — Ready for Snowflake Credentials  
**Time to First Run**: ~10 minutes  
**Prerequisites**: Node.js 18+, Snowflake account

---

## ⚡ Fast Track Setup

### 1. Configure Snowflake (Required)

```bash
# Create backend environment file
cd backend
cp .env.example .env

# Edit .env with your credentials
# Required values:
# - SNOWFLAKE_ACCOUNT=your_account.region
# - SNOWFLAKE_USERNAME=your_username
# - SNOWFLAKE_PASSWORD=your_password
```

### 2. Start Backend

```bash
# Install and run backend (terminal 1)
cd backend
npm install
npm run dev

# Should see: ✅ Connected to Snowflake successfully
```

### 3. Start Frontend

```bash
# Install and run frontend (terminal 2)
cd "frontend/frontend"
npm install --legacy-peer-deps
npm start

# Browser opens to http://localhost:3000
```

### 4. Login

- Username: `admin`
- Password: `admin123`

### 5. Verify

- ✅ Dashboard shows green "Snowflake Connected" status
- ✅ District data has "DEMO DATA" badges
- ✅ No errors in browser console

---

## 🔍 Troubleshooting

### "Snowflake integration disabled"

**Cause**: Missing credentials in `backend/.env`  
**Fix**: Create `.env` file with your Snowflake account details

### "Backend server not responding"

**Cause**: Backend not running  
**Fix**: Open terminal 1, run `cd backend && npm run dev`

### "npm install fails"

**Cause**: Peer dependency conflicts  
**Fix**: Use `npm install --legacy-peer-deps`

---

## 📖 Full Documentation

- **Complete Setup**: See `SETUP.md`
- **API Reference**: See `backend/README.md`
- **Data Explanation**: See `DATA_COMPATIBILITY_ANALYSIS.md`
- **Status Report**: See `MIGRATION_STATUS_REPORT.md`

---

## 🎯 What You Get

**✅ Working Now**:
- SignalMesh AI branding throughout
- District-level demo data for NE India (20 locations)
- Interactive maps, dashboards, alerts
- Real-time Snowflake connection status
- Data source badges (DEMO vs LIVE)

**⏳ After Snowflake Credentials**:
- Live connection to SIGNALMESH_AI database
- 25 nations with environmental features
- ML-generated risk assessments
- Nation-level data display

---

## 🔐 Security Notes

✅ Credentials are git-ignored  
✅ No secrets in source code  
✅ Backend API protects Snowflake access

**Never commit** `backend/.env` or `frontend/.env` files!

---

**SignalMesh AI v1.0** — By Apex-AI-X
