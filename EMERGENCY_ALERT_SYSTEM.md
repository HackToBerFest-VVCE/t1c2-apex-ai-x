# Emergency Alert System - SignalMesh AI

## ✅ STATUS: FULLY IMPLEMENTED AND OPERATIONAL

The Emergency Alert System is now fully integrated into SignalMesh AI. This system enables zero-login, high-priority emergency alerts triggered by AI/ML risk predictions.

---

## 🎯 Features Implemented

### 1. **Web Audio-Visual Emergency Modal** ✅
- **Location**: `frontend/frontend/src/pages/EmergencyAlert.jsx`
- **Route**: `/emergency-alert` (zero-login, no authentication required)
- **Features**:
  - Web Audio API siren (850 Hz pulsing oscillator)
  - Pulsing red background animation
  - Risk score display with real-time data
  - Trigger factors breakdown with severity levels
  - Evacuation directions
  - Action buttons: Call 112, Acknowledge, Share Alert
  - Mobile vibration support
  - Fully responsive design

### 2. **Backend Alert Dispatch API** ✅
- **Location**: `backend/src/routes/emergencyAlerts.js`
- **Database**: `ALERT_HISTORY` table in Snowflake
- **Endpoints**:
  - `POST /api/alerts/trigger` - Trigger emergency alert
  - `GET /api/alerts/history` - Get alert history
  - `GET /api/alerts/:alertId` - Get specific alert
  - `POST /api/alerts/acknowledge` - Acknowledge alert
  - `POST /api/alerts/test` - Trigger test alert
  - `WS /ws/alerts` - WebSocket for real-time updates

### 3. **ML Model Integration** ✅
- **Python Script**: `backend/scripts/trigger_alert.py`
- **Node.js Script**: `backend/scripts/trigger-mobile-alert.js`
- **Features**:
  - Auto-trigger when `risk_score >= 0.75` or `level == "HIGH_RISK"`
  - Command-line interface
  - JSON file input support
  - ADB integration for Android wake-up
  - Class-based API for easy ML integration

### 4. **Real-Time Broadcasting** ✅
- **WebSocket Server**: Integrated into backend server
- **Location**: `backend/src/server.js`
- **Path**: `ws://localhost:5000/ws/alerts`
- **Features**:
  - Broadcasts alerts to all connected clients
  - Maintains connection pool
  - Auto-cleanup of stale connections

---

## 🚀 Quick Start

### Test the Alert System

#### 1. Test via API
```bash
# Trigger a test alert
curl -X POST http://localhost:5000/api/alerts/test

# Or using PowerShell
Invoke-WebRequest -Uri "http://localhost:5000/api/alerts/test" -Method POST -ContentType "application/json" -Body '{}'
```

#### 2. View the Alert
Open the URL returned in the response:
```
http://localhost:3000/emergency-alert?id=TEST_xxx&location=Test+Location+-+Meghalaya&...
```

#### 3. Trigger from ML Model (Python)
```python
from backend.scripts.trigger_alert import EmergencyAlertSystem

alert_system = EmergencyAlertSystem()

# Simple trigger
alert_system.trigger_alert(
    location='Cherrapunji, Meghalaya',
    risk_score=0.89,
    level='CRITICAL',
    coordinates={'lat': 25.2639, 'lng': 91.7320},
    factors=[
        {'name': 'Rainfall', 'value': 285, 'unit': 'mm', 'severity': 'EXTREME'},
        {'name': 'Soil Saturation', 'value': 95, 'unit': '%', 'severity': 'CRITICAL'}
    ]
)

# Auto-trigger from model prediction
prediction = {
    'location': 'Cherrapunji, Meghalaya',
    'risk_score': 0.89,
    'level': 'CRITICAL',
    'coordinates': {'lat': 25.2639, 'lng': 91.7320},
    'factors': [...]
}
result = alert_system.trigger_from_model_prediction(prediction)
```

#### 4. Command Line Usage
```bash
# Python
python backend/scripts/trigger_alert.py "Cherrapunji, Meghalaya" 0.89 CRITICAL

# Or from JSON file
python backend/scripts/trigger_alert.py --from-json prediction.json
```

---

## 📱 Mobile Phone Integration

### Setup ADB for Android Alert

1. **Install Android Platform Tools**
   - Download from: https://developer.android.com/tools/releases/platform-tools
   - Add to PATH

2. **Enable USB Debugging on Phone**
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable USB Debugging

3. **Connect Phone**
   ```bash
   # Connect via USB
   adb devices
   
   # Or connect via Wi-Fi
   adb tcpip 5555
   adb connect <phone-ip>:5555
   ```

4. **Update ALERT_BASE_URL**
   Find your machine's IP:
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```
   
   Update `backend/.env`:
   ```
   ALERT_BASE_URL=http://192.168.1.100:3000
   ```

5. **Trigger Mobile Alert**
   ```bash
   node backend/scripts/trigger-mobile-alert.js
   ```
   
   Or with Python:
   ```python
   alert_system.trigger_mobile_alert(alert_url)
   ```

---

## 🔧 Configuration

### Environment Variables (`backend/.env`)

```bash
# Emergency Alert System
ALERT_BASE_URL=http://localhost:3000

# Twilio SMS (Optional)
# TWILIO_ACCOUNT_SID=your_account_sid
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_PHONE_NUMBER=your_phone_number

# Mobile Phone Alert (Optional)
# PHONE_IP=192.168.1.100
```

### Frontend Configuration (`frontend/frontend/.env`)

```bash
REACT_APP_API_BASE_URL=http://localhost:5000
```

---

## 📊 Database Schema

### ALERT_HISTORY Table (Snowflake)

```sql
CREATE TABLE ALERT_HISTORY (
    ALERT_ID VARCHAR(100) PRIMARY KEY,
    LOCATION VARCHAR(200) NOT NULL,
    COORDINATES VARIANT,              -- JSON: {lat, lng}
    RISK_SCORE NUMBER(5,2) NOT NULL,
    RISK_LEVEL VARCHAR(20) NOT NULL,  -- LOW, MODERATE, HIGH, CRITICAL, EXTREME
    TRIGGER_FACTORS VARIANT,          -- JSON array
    DISTRICT_ID NUMBER(10,0),
    EVACUATION_DIRECTION VARCHAR(1000),
    RECIPIENT_PHONE VARCHAR(50),
    STATUS VARCHAR(20) DEFAULT 'ACTIVE',
    ACKNOWLEDGED_AT TIMESTAMP_NTZ,
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);
```

**Setup**: Run `node backend/scripts/create-alert-table.js`

---

## 📡 API Reference

### POST /api/alerts/trigger

Trigger emergency alert from ML model prediction.

**Request Body:**
```json
{
  "location": "Cherrapunji, Meghalaya",
  "coordinates": { "lat": 25.2639, "lng": 91.7320 },
  "risk_score": 0.89,
  "level": "CRITICAL",
  "factors": [
    { "name": "Rainfall", "value": 285, "unit": "mm", "severity": "EXTREME" }
  ],
  "evacuation_direction": "Move to designated safe zone at Community Center, 2.3 km North",
  "district_id": 101,
  "recipient_phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "alert": {
    "id": "ALERT_1793099737232_8tgkdhn7f",
    "location": "Cherrapunji, Meghalaya",
    "level": "CRITICAL",
    "riskScore": 0.89,
    "timestamp": "2026-10-27T11:15:37.232Z",
    "url": "http://localhost:3000/emergency-alert?id=..."
  },
  "broadcast": {
    "webSocketClients": 5,
    "failed": 0
  },
  "storage": {
    "memory": true,
    "snowflake": true
  },
  "notifications": {
    "sms": false,
    "smsRecipient": null
  }
}
```

### GET /api/alerts/history

Get recent alert history.

**Query Parameters:**
- `limit` (default: 50) - Number of alerts to return
- `level` (optional) - Filter by risk level

**Response:**
```json
{
  "success": true,
  "count": 10,
  "alerts": [...]
}
```

### POST /api/alerts/acknowledge

Acknowledge an alert.

**Request Body:**
```json
{
  "alertId": "ALERT_1793099737232_8tgkdhn7f",
  "timestamp": "2026-10-27T11:20:00.000Z"
}
```

### POST /api/alerts/test

Trigger a test alert (for testing purposes).

**Response:** Same as `/api/alerts/trigger`

---

## 🧪 Testing Checklist

- [x] Backend API endpoints operational
- [x] WebSocket server running
- [x] Snowflake ALERT_HISTORY table created
- [x] Frontend emergency alert page accessible
- [x] Audio siren working
- [x] Visual alerts (pulsing red background)
- [x] Test alert trigger successful
- [x] Python ML integration script
- [x] Node.js mobile alert script
- [ ] ADB mobile phone wake-up (requires physical device)
- [ ] SMS notifications (requires Twilio credentials)

---

## 🔐 Security Notes

1. **Zero-Login Access**: `/emergency-alert` route is intentionally public for emergency situations
2. **WebSocket**: Open to all clients for broadcasting
3. **SMS**: Optional Twilio integration (credentials required)
4. **ADB**: Local development only, requires physical device access

---

## 🚨 Production Deployment

### Backend (Render)
- Already deployed: https://signalmesh-ai-backend.onrender.com
- WebSocket endpoint: `wss://signalmesh-ai-backend.onrender.com/ws/alerts`
- Update `ALERT_BASE_URL` in Render environment variables

### Frontend (Vercel)
- Update `REACT_APP_API_BASE_URL` to point to Render backend
- Emergency alert will be accessible at: `https://your-app.vercel.app/emergency-alert`

### Environment Variables (Production)
```bash
# Backend (Render)
ALERT_BASE_URL=https://your-app.vercel.app
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# Frontend (Vercel)
REACT_APP_API_BASE_URL=https://signalmesh-ai-backend.onrender.com
```

---

## 📞 Support

For issues or questions:
1. Check backend logs: `npm run dev` in `backend/`
2. Check frontend console in browser DevTools
3. Verify WebSocket connection in Network tab
4. Test with `/api/alerts/test` endpoint first

---

## ✅ Implementation Complete

All components of the Emergency Alert System are now operational:
- ✅ Backend API routes integrated
- ✅ WebSocket broadcasting active
- ✅ Frontend alert page accessible
- ✅ Database table created
- ✅ ML model integration scripts ready
- ✅ Mobile phone alert scripts prepared
- ✅ Documentation complete

The system is ready for production use and ML model integration!
