# SignalMesh AI - Feature 2 Implementation Plan

**Feature**: Live Monitoring + AI Risk Analysis + Mobile Push Alerts  
**Team**: Apex-AI-X  
**Status**: Phase 1 Backend Infrastructure - IN PROGRESS

---

## ✅ COMPLETED (Phase 1 - Backend Infrastructure)

### 1. Dependencies Added
- `axios` - HTTP client for external APIs
- `firebase-admin` - Push notification backend
- `node-cache` - Caching layer for external data

### 2. Database Schema Created
**Files**: 
- `backend/sql/02_create_live_risk_history.sql`
- `backend/sql/03_create_notification_tables.sql`

**Tables**:
- `LIVE_RISK_HISTORY` - Historical risk assessment snapshots
- `USER_SUBSCRIPTIONS` - User notification preferences with FCM tokens
- `NOTIFICATION_HISTORY` - Complete notification delivery log

### 3. Live Data Service (`backend/src/services/liveDataService.js`)
**Features**:
- IMD API integration interface (placeholder for credentials)
- Demo data fallback for development
- Automatic caching with TTL
- Data freshness classification (LIVE/RECENT/STALE/UNAVAILABLE)
- Coordinator pattern with fallback logic

### 4. Risk Assessment Service (`backend/src/services/riskAssessmentService.js`)
**Features**:
- Transparent weighted scoring algorithm
- Handles missing data gracefully
- Confidence scoring based on data availability
- Top contributing factors analysis
- Risk change tracking (INCREASED/DECREASED/STABLE)
- Clear disclaimer labeling

### 5. Live Monitoring API Routes (`backend/src/routes/liveMonitoring.js`)
**Endpoints Created**:
- `GET /api/live/status` - System status and data source availability
- `GET /api/live/overview` - All monitored districts summary
- `GET /api/live/districts/:id` - Comprehensive district live data
- `POST /api/live/refresh` - Manual data refresh trigger

---

## 🔄 IN PROGRESS (Phase 2 - Integration & Frontend)

### Next Steps:

#### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

#### Step 2: Update Environment Variables
Add to `backend/.env`:
```env
# Live Data Sources (Optional - Demo mode works without these)
IMD_API_URL=https://api.imd.gov.in/v1  # If available
IMD_API_KEY=your_key_here               # If available

# Firebase Cloud Messaging (For push notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

#### Step 3: Integrate Live Routes into Server
Modify `backend/src/server.js` to include live monitoring routes.

#### Step 4: Create Snowflake Tables
Execute the SQL scripts:
```sql
-- Run in Snowflake
@backend/sql/02_create_live_risk_history.sql
@backend/sql/03_create_notification_tables.sql
```

#### Step 5: Create Frontend Components
- `LiveMonitoring.jsx` - Main live monitoring page
- `LiveDistrictCard.jsx` - District status card with live data
- `RiskTrendChart.jsx` - Historical risk trending
- `NotificationSettings.jsx` - Push notification preferences
- `LiveDataIndicator.jsx` - Data freshness indicator

#### Step 6: Firebase Setup (For Push Notifications)
1. Create Firebase project at https://console.firebase.google.com
2. Enable Cloud Messaging
3. Generate service account key
4. Add to backend environment variables
5. Add Firebase SDK to frontend
6. Implement FCM token registration

---

## 📋 REMAINING TASKS

### Backend Tasks
- [ ] Integrate live monitoring routes into server.js
- [ ] Create Firebase notification service
- [ ] Implement notification scheduling logic
- [ ] Add duplicate notification prevention
- [ ] Create alert evaluation rules engine
- [ ] Implement FCM token management
- [ ] Add notification history endpoints

### Frontend Tasks
- [ ] Create LiveMonitoring page component
- [ ] Add live monitoring route to App.js
- [ ] Create live data display components
- [ ] Implement real-time data refresh UI
- [ ] Add data freshness indicators
- [ ] Create notification permission flow
- [ ] Implement notification settings interface
- [ ] Add notification history viewer
- [ ] Create risk trend visualization
- [ ] Add "Live" button with actual functionality

### Data Integration Tasks
- [ ] Document IMD API integration requirements
- [ ] Test demo data fallback system
- [ ] Implement API rate limiting
- [ ] Add request timeout handling
- [ ] Create data quality monitoring
- [ ] Implement cache invalidation strategy

### Testing Tasks
- [ ] Test live data retrieval
- [ ] Test risk assessment accuracy
- [ ] Test notification delivery
- [ ] Test with unavailable data sources
- [ ] Test demo mode functionality
- [ ] Load test refresh endpoints
- [ ] Test FCM token expiration handling

### Deployment Tasks
- [ ] Update deployment environment variables
- [ ] Configure Firebase for production
- [ ] Set up notification scheduling (cron/cloud scheduler)
- [ ] Test production data sources
- [ ] Monitor API rate limits
- [ ] Set up error alerting

---

## 🎯 ACCEPTANCE CRITERIA

### Live Monitoring
- [x] Backend service architecture created
- [ ] Can fetch live rainfall data (or demo fallback)
- [ ] Risk assessment uses available data
- [ ] Missing data clearly indicated
- [ ] Data freshness visible to user
- [ ] Manual refresh works
- [ ] Historical trending available
- [ ] No fake precision or invented data

### Push Notifications
- [ ] User can subscribe to districts
- [ ] FCM tokens securely managed
- [ ] Notifications sent on risk threshold breach
- [ ] Duplicate notifications prevented
- [ ] Notification history tracked
- [ ] Users can unsubscribe
- [ ] Demo notifications clearly labeled
- [ ] No notifications on stale data (unless explicitly enabled)

### Security
- [x] API keys in environment variables only
- [ ] FCM credentials server-side only
- [ ] No secrets in frontend code
- [ ] No secrets in Git commits
- [ ] CORS properly configured
- [ ] User data access controlled

### User Experience
- [ ] Live button performs real action
- [ ] Loading states implemented
- [ ] Error states handled gracefully
- [ ] Retry mechanisms available
- [ ] Data source attribution clear
- [ ] Synthetic data clearly labeled
- [ ] Setup instructions for missing credentials

---

## 🚀 QUICK START (Current State)

### Run Backend
```bash
cd backend
npm install  # Install new dependencies
npm run dev
```

### Test Live Endpoints (Demo Mode)
```bash
# Check system status
curl http://localhost:5000/api/live/status

# Get live overview
curl http://localhost:5000/api/live/overview?allowDemo=true

# Get specific district live data
curl http://localhost:5000/api/live/districts/1?allowDemo=true

# Trigger manual refresh
curl -X POST http://localhost:5000/api/live/refresh \
  -H "Content-Type: application/json" \
  -d '{"districtIds": [1, 2, 3], "allowDemo": true}'
```

---

## 📊 CURRENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    SignalMesh AI                             │
│                  Live Monitoring System                      │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐      ┌─────▼─────┐
   │ React   │       │ Express │      │ Snowflake │
   │Frontend │◄──────│ Backend │◄─────│ Database  │
   └─────────┘       └────┬────┘      └───────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐     ┌─────▼──────┐   ┌─────▼─────┐
   │ IMD API │     │ Demo Data  │   │ Firebase  │
   │(Config  │     │  Service   │   │    FCM    │
   │ needed) │     │ (Active)   │   │ (Setup    │
   └─────────┘     └────────────┘   │  needed)  │
                                    └───────────┘
```

---

## 🔍 NEXT IMMEDIATE ACTION

**You should**:
1. Review this implementation plan
2. Run `cd backend && npm install` to install new dependencies
3. Tell me if you want to:
   - Continue with integrating routes into server.js
   - Set up Firebase for notifications
   - Create frontend components
   - Test the current backend functionality
   - Deploy and test with live data sources

**I'm ready to continue implementation based on your priority!**

