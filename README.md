# 🇮🇳 SignalMesh AI - Landslide Risk Assessment Platform

**Team**: Apex-AI-X  
**Project**: SignalMesh AI  
**Focus**: Northeast India Landslide Risk Monitoring  
**Tech Stack**: React + Express.js + Snowflake  

[![Hackathon](https://img.shields.io/badge/Hackathon-HackToBerFest%202024-orange)](https://github.com/HackToBerFest-VVCE)
[![Status](https://img.shields.io/badge/Status-Complete-success)](https://github.com/HackToBerFest-VVCE/t1c2-apex-ai-x)

---

## 🎯 Project Overview

SignalMesh AI is a full-stack disaster intelligence platform focused on **landslide risk assessment** for **Northeast India**. The system integrates React frontend, Node.js backend, and Snowflake cloud database to provide real-time risk analysis across **69 districts** in **8 states**.

### Key Features
- ✅ **Real-time Snowflake Integration**: Live data from cloud database
- ✅ **69 Districts Covered**: Complete Northeast India coverage
- ✅ **8 States**: Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura
- ✅ **Interactive Dashboard**: React-based UI with filters and visualizations
- ✅ **Risk Assessment**: 5-level classification (LOW to EXTREME)
- ✅ **RESTful API**: 8 endpoints serving district and nation-level data

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  React Frontend │ ───▶ │  Express Backend│ ───▶ │    Snowflake    │
│  (Port 3000)    │      │   (Port 5000)   │      │  Cloud Database │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Technology Stack

**Frontend**:
- React 18 with React Router
- Tailwind CSS + Radix UI
- Axios for API calls
- Recharts for data visualization

**Backend**:
- Node.js + Express.js
- Snowflake Node.js SDK
- CORS enabled
- Environment-based configuration

**Database**:
- Snowflake Cloud Data Platform
- Database: `SIGNALMESH_AI`
- Schema: `DISASTER_RISK`
- Tables: `INDIA_DISTRICT_FEATURES`, `NATION_FEATURES`

---

## 📊 Data Coverage

### Districts by State
| State | Districts |
|-------|-----------|
| Arunachal Pradesh | 10 |
| Meghalaya | 11 |
| Nagaland | 11 |
| Manipur | 9 |
| Assam | 8 |
| Mizoram | 8 |
| Tripura | 8 |
| Sikkim | 4 |
| **Total** | **69** |

### Risk Distribution
- **EXTREME**: 1 district (Cherrapunji - world's wettest place)
- **VERY_HIGH**: 26 districts
- **HIGH**: 27 districts
- **MODERATE**: 11 districts
- **LOW**: 4 districts

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git
- Snowflake account (for database access)

### 1. Clone Repository
```bash
git clone https://github.com/HackToBerFest-VVCE/t1c2-apex-ai-x.git
cd t1c2-apex-ai-x
```

### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Snowflake credentials

# Start backend
npm run dev
```

Backend will run on **http://localhost:5000**

### 3. Setup Frontend
```bash
cd "JATAYU-frontend 2/frontend"

# Install dependencies
npm install

# Configure environment (optional)
cp .env.example .env.local

# Start frontend
npm start
```

Frontend will open at **http://localhost:3000**

### 4. Load Snowflake Data
```bash
cd backend

# Load India district data (69 districts)
node scripts/load-india-data.js
```

---

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:
```env
# Snowflake Connection
SNOWFLAKE_ACCOUNT=your-account.region.aws
SNOWFLAKE_USERNAME=your-email@gmail.com
SNOWFLAKE_PASSWORD=your-password
SNOWFLAKE_WAREHOUSE=SNOWFLAKE_LEARNING_WH
SNOWFLAKE_DATABASE=SIGNALMESH_AI
SNOWFLAKE_SCHEMA=DISASTER_RISK

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables

Create `JATAYU-frontend 2/frontend/.env.local`:
```env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_ENABLE_SNOWFLAKE_INTEGRATION=true
```

---

## 📡 API Endpoints

### India District Endpoints (Primary)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/india-districts` | Get all 69 districts |
| GET | `/api/india-districts/:id` | Get single district by ID |
| GET | `/api/india-district-summary` | Get aggregated statistics |

### Nation-Level Endpoints (Global Data)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/nation-features` | Get 25 nations with environmental data |
| GET | `/api/risk-assessments` | Get ML-generated risk assessments |
| GET | `/api/nation-summary` | Get combined features + assessments |
| GET | `/api/nation/:key` | Get single nation by key |

### System Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Backend and Snowflake status |
| GET | `/api` | API information |

---

## 🎨 Dashboard Features

### India Dashboard (`/dashboard`)
- **Summary Cards**: 69 districts across 8 states with risk distribution
- **Risk Chart**: Donut chart showing proportional risk levels
- **State Analysis**: Performance metrics for each of 8 states
- **District Table**: Filterable table with all 69 districts
- **Top Risks**: 10 highest-risk districts highlighted
- **Interactive Filters**: Filter by state and risk level

### Demo Credentials
For local testing, the login accepts any username/password combination.

---

## 📁 Project Structure

```
t1c2-apex-ai-x/
├── backend/                          # Express.js API server
│   ├── src/
│   │   └── server.js                 # Main server with 8 API endpoints
│   ├── scripts/
│   │   └── load-india-data.js        # Snowflake data loader
│   ├── sql/
│   │   └── 01_create_india_district_features.sql
│   ├── .env.example                  # Environment template
│   └── package.json
│
├── JATAYU-frontend 2/frontend/       # React application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── IndiaDashboard.jsx    # Main India-focused dashboard
│   │   │   ├── Dashboard.jsx         # Legacy global dashboard
│   │   │   ├── Login.jsx
│   │   │   └── ...                   # Other pages
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── DonutChart.jsx
│   │   │   └── ...                   # UI components
│   │   ├── services/
│   │   │   └── api.js                # API service layer
│   │   └── App.js                    # Main app with routing
│   ├── .env.example
│   └── package.json
│
├── SignalMesh_India_Landslide_Dataset.csv  # District data export
├── IMPLEMENTATION_COMPLETE.md               # Technical details
├── FINAL_HACKATHON_REPORT.md               # Hackathon presentation guide
├── DEMO_COMMANDS.txt                        # Quick demo commands
└── README.md                                # This file
```

---

## 🧪 Testing

### Test Backend API
```bash
# Health check
curl http://localhost:5000/health

# Get India district summary
curl http://localhost:5000/api/india-district-summary

# Get all districts
curl http://localhost:5000/api/india-districts
```

### Test Frontend
1. Open http://localhost:3000
2. Login with any credentials (demo mode)
3. View India Dashboard with 69 districts
4. Test filters (state, risk level)
5. Verify data loads from backend

---

## 📊 Risk Calculation Formula

Risk scores are calculated using a **transparent weighted formula**:

```javascript
Risk Score = (Rainfall/100 × 0.30) +      // 30% weight
             (Slope × 0.25) +              // 25% weight
             ((100-SoilStability) × 0.25) +// 25% weight
             (Seismic × 0.15) +            // 15% weight
             ((100-Vegetation) × 0.05)     // 5% weight
```

### Risk Level Thresholds
- **EXTREME**: Score > 100
- **VERY_HIGH**: 40 ≤ Score ≤ 100
- **HIGH**: 30 ≤ Score < 40
- **MODERATE**: 20 ≤ Score < 30
- **LOW**: Score < 20

---

## 🔐 Security

### Environment Variables
- All sensitive credentials stored in `.env` files
- `.env` files are **git-ignored** and never committed
- Use `.env.example` templates for setup

### API Security
- CORS configured for frontend origin
- No credentials exposed in API responses
- Error messages sanitized

### Database Security
- Snowflake credentials never exposed to frontend
- Backend acts as secure proxy
- Connection pooling and timeout management

---

## 📈 Deployment

### Frontend Deployment (GitHub Pages)
```bash
cd "JATAYU-frontend 2/frontend"

# Build production bundle
npm run build

# Deploy to GitHub Pages (requires gh-pages setup)
npm run deploy
```

**Note**: Update `REACT_APP_API_BASE_URL` to point to deployed backend.

### Backend Deployment (Render/Heroku)

1. **Push to Repository**
2. **Connect to Render/Heroku**
3. **Set Environment Variables** (Snowflake credentials)
4. **Deploy** from main branch

**Environment Variables Required**:
- `SNOWFLAKE_ACCOUNT`
- `SNOWFLAKE_USERNAME`
- `SNOWFLAKE_PASSWORD`
- `SNOWFLAKE_WAREHOUSE`
- `SNOWFLAKE_DATABASE`
- `SNOWFLAKE_SCHEMA`
- `PORT` (auto-set by hosting provider)
- `NODE_ENV=production`
- `CORS_ORIGIN` (deployed frontend URL)

---

## 📝 Data Transparency

### Synthetic Demo Data
All district data in this hackathon project is labeled **SYNTHETIC_DEMO**:
- Values are generated for demonstration purposes
- Risk scores calculated using documented formula
- Real district names from Northeast India
- Ready to be replaced with actual sensor data

### Real Data Integration (Future)
To integrate real data:
1. Connect weather APIs (IMD, NOAA)
2. Add real-time rain gauges
3. Integrate seismic monitoring stations
4. Update `DATA_SOURCE` and `DATA_TYPE` fields

---

## 🎯 Hackathon Highlights

### What We Built
✅ Full-stack application (React + Express + Snowflake)  
✅ Real cloud database integration  
✅ 69 districts across 8 states  
✅ Interactive data visualization  
✅ RESTful API with 8 endpoints  
✅ Responsive dashboard with filters  
✅ Complete documentation  

### Technical Achievements
✅ Real-time Snowflake queries  
✅ Secure backend API  
✅ Modern React with hooks  
✅ Professional UI/UX  
✅ Scalable architecture  
✅ Git best practices  

---

## 👥 Team Apex-AI-X

**Project**: SignalMesh AI  
**Hackathon**: HackToBerFest 2024  
**Repository**: [t1c2-apex-ai-x](https://github.com/HackToBerFest-VVCE/t1c2-apex-ai-x)  
**Organization**: [HackToBerFest-VVCE](https://github.com/HackToBerFest-VVCE)

---

## 📚 Documentation

- `IMPLEMENTATION_COMPLETE.md` - Complete technical implementation details
- `FINAL_HACKATHON_REPORT.md` - Hackathon presentation guide
- `DATASET_DOCUMENTATION.md` - Data structure and sources
- `DEMO_COMMANDS.txt` - Quick demo commands
- `QUICKSTART.md` - Fast setup guide

---

## 🚀 Future Enhancements

### Phase 1 - Real Data Integration
- Weather API integration (IMD)
- Real-time sensor data
- Historical trend analysis

### Phase 2 - ML & Prediction
- Predictive ML models
- Anomaly detection
- Early warning system

### Phase 3 - Alert System
- SMS/Email notifications
- WhatsApp integration
- Mobile app (React Native)

### Phase 4 - Production
- User authentication (JWT)
- Role-based access control
- API rate limiting
- Cloud deployment (AWS/Azure)
- Monitoring (Grafana)

---

## 📄 License

This project is created for HackToBerFest 2024 hackathon.

---

## 🙏 Acknowledgments

- **India Meteorological Department (IMD)** - Weather data reference
- **Geological Survey of India (GSI)** - Seismic and terrain data reference
- **Snowflake** - Cloud database platform
- **HackToBerFest-VVCE** - Hackathon organizers

---

## 📞 Support

For questions or issues:
1. Check documentation files in the repository
2. Review API endpoints: `curl http://localhost:5000/api`
3. Test connection: `curl http://localhost:5000/health`

---

**Built with ❤️ by Team Apex-AI-X**

**Focus**: Northeast India Landslide Risk Assessment  
**Goal**: Disaster prevention through intelligent monitoring  
**Status**: ✅ Complete and Operational

🚀 **Ready for Deployment!**
