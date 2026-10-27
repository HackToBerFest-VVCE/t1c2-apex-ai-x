# SignalMesh AI - Quick Start Guide

Get the SignalMesh AI disaster intelligence platform running in minutes.

---

## ✅ Prerequisites

- Node.js 16+ and npm
- Snowflake account with credentials
- Git

---

## 🚀 Quick Start (3 Steps)

### Step 1: Configure Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from template
copy .env.example .env

# Edit .env with your Snowflake credentials
# SNOWFLAKE_ACCOUNT=hz93433.ap-southeast-7.aws
# SNOWFLAKE_USERNAME=your-email@gmail.com
# SNOWFLAKE_PASSWORD=your-password
```

### Step 2: Start Backend Server

```bash
# In backend directory
npm run dev
```

You should see:
```
✅ Connected to Snowflake successfully
✅ All Snowflake connection tests passed!
🚀 Server running on http://localhost:5000
```

### Step 3: Test Backend API

Open a new terminal:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test data endpoint
curl http://localhost:5000/api/nation-features
```

You should see JSON responses with real Snowflake data! 🎉

---

## 🎨 Frontend Setup (Optional)

```bash
# Navigate to frontend directory
cd "frontend/frontend"

# Install dependencies
npm install

# Start development server
npm start
```

The React app will open at http://localhost:3000

---

## 🔧 Troubleshooting

### Connection Failed?

Run the diagnostic tool:
```bash
cd backend
node test-connection.js
```

This will test your Snowflake credentials and tell you exactly what's wrong.

### Common Issues

**"Incorrect username or password"**
- Ensure username is your **full email** (e.g., `username@gmail.com`)
- Verify password is correct
- Check account identifier format: `account.region.aws`

**"Cannot find module"**
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules
npm install
```

**Port 5000 already in use**
```bash
# Change PORT in backend/.env
PORT=5001
```

---

## 📡 API Endpoints

Once backend is running:

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Server and Snowflake status |
| `GET /api` | API information |
| `GET /api/nation-features` | All nations with environmental data (25 countries) |
| `GET /api/risk-assessments` | ML-generated risk assessments |
| `GET /api/nation-summary` | Combined features + assessments |
| `GET /api/nation/:key` | Single nation by ID |

---

## 📊 Sample Data

The database currently contains:
- **25 nations** across 5 regions (Africa, America, Asia, Europe, Middle East)
- **Environmental risk factors**: precipitation, terrain slope, soil stability, seismic activity, vegetation cover
- **Data source**: SYNTHETIC_DEMO (ready for real sensor data)

Sample nations: Algeria, Argentina, Brazil, Canada, China, Egypt, France, Germany, India, Indonesia, Japan, Kenya, Morocco, Peru, Russia, Saudi Arabia, United Kingdom, United States, Vietnam, and more.

---

## 🎯 What's Working

✅ **Backend Server**: Express API running on port 5000  
✅ **Snowflake Integration**: Live connection to cloud database  
✅ **Authentication**: Password-based (secure, git-ignored)  
✅ **API Endpoints**: All 6 endpoints operational  
✅ **Real Data**: Serving 25 nations from Snowflake  
✅ **Error Handling**: Comprehensive error messages  
✅ **CORS**: Enabled for frontend integration  
✅ **Auto-reload**: Nodemon watches for code changes  

---

## 📁 Project Structure

```
backend/
├── src/server.js          # Main API server ✅
├── .env                   # Your credentials (git-ignored) ✅
├── .env.example           # Template ✅
├── test-connection.js     # Diagnostic tool ✅
└── package.json           # Dependencies ✅

frontend/frontend/
├── src/
│   ├── pages/             # React pages
│   ├── components/        # React components
│   └── services/          # API service layer (to create)
└── package.json

Documentation/
├── QUICKSTART.md                  # This file ✅
├── SNOWFLAKE_SUCCESS_REPORT.md    # Detailed success report ✅
├── SNOWFLAKE_CONNECTION_STATUS.md # Troubleshooting guide ✅
└── SETUP.md                       # Full setup instructions ✅
```

---

## 🔐 Security Notes

- ✅ `.env` file is **git-ignored** - never committed
- ✅ Credentials **never exposed** in frontend or API responses
- ✅ CORS restricted to `http://localhost:3000` only
- ✅ No credentials in logs or console output

**For production**: Use key-pair authentication, HTTPS, and environment-specific configs.

---

## 🎊 You're Ready!

Your SignalMesh AI backend is now connected to Snowflake and serving real data.

**Next steps**:
1. ✅ Backend running and tested
2. Connect React frontend to backend API
3. Build dashboard visualizations
4. Add district-level data for Northeast India
5. Integrate real-time sensor data

---

## 📞 Quick Commands Reference

```bash
# Start backend (with auto-reload)
cd backend && npm run dev

# Start backend (production)
cd backend && npm start

# Test Snowflake connection
cd backend && node test-connection.js

# Start frontend
cd "frontend/frontend" && npm start

# Test API
curl http://localhost:5000/health
curl http://localhost:5000/api/nation-features

# View backend logs
# Check the terminal where you ran npm run dev
```

---

## 🌟 Success Indicators

You know everything is working when you see:

1. **Backend startup**:
   ```
   ✅ Connected to Snowflake successfully
   ✅ All Snowflake connection tests passed!
   ✅ Server running on http://localhost:5000
   ```

2. **Health check returns**:
   ```json
   {
     "status": "ok",
     "snowflake": {
       "connected": true
     }
   }
   ```

3. **Data endpoint returns 25 nations**:
   ```json
   {
     "success": true,
     "count": 25,
     "data": [...]
   }
   ```

**If you see all three, you're fully operational! 🚀**

---

For detailed documentation, see:
- `SNOWFLAKE_SUCCESS_REPORT.md` - Complete success details
- `SNOWFLAKE_CONNECTION_STATUS.md` - Troubleshooting guide
- `SETUP.md` - Full project setup instructions
