/**
 * SignalMesh AI - Emergency Alert System
 * High-priority alert dispatch with WebSocket broadcasting
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('crypto').randomUUID ? require('crypto') : { v4: () => require('crypto').randomBytes(16).toString('hex') };

// Store active WebSocket connections
const activeConnections = new Set();

// Store recent alerts in memory (last 100)
const alertHistory = [];
const MAX_HISTORY = 100;

// Snowflake query executor (injected from server.js)
let executeQuery = null;

function setExecuteQuery(fn) {
  executeQuery = fn;
}

/**
 * Register WebSocket connection for real-time alerts
 */
function registerWebSocket(ws) {
  activeConnections.add(ws);
  console.log(`[ALERTS] WebSocket connected. Total connections: ${activeConnections.size}`);

  ws.on('close', () => {
    activeConnections.delete(ws);
    console.log(`[ALERTS] WebSocket disconnected. Total connections: ${activeConnections.size}`);
  });

  // Send recent alerts on connection
  ws.send(JSON.stringify({
    type: 'HISTORY',
    alerts: alertHistory.slice(-10)
  }));
}

/**
 * Broadcast alert to all connected WebSocket clients
 */
function broadcastAlert(alert) {
  const message = JSON.stringify({
    type: 'ALERT',
    alert
  });

  let sentCount = 0;
  let failedCount = 0;

  activeConnections.forEach(ws => {
    try {
      if (ws.readyState === 1) { // OPEN
        ws.send(message);
        sentCount++;
      } else {
        activeConnections.delete(ws);
        failedCount++;
      }
    } catch (error) {
      console.error('[ALERTS] WebSocket send failed:', error.message);
      activeConnections.delete(ws);
      failedCount++;
    }
  });

  console.log(`[ALERTS] Broadcast to ${sentCount} clients, ${failedCount} failed/removed`);
  
  return { sentCount, failedCount };
}

/**
 * POST /api/alerts/trigger
 * Trigger emergency alert with model prediction
 */
router.post('/trigger', async (req, res) => {
  try {
    const {
      location,
      coordinates = { lat: 0, lng: 0 },
      risk_score,
      level,
      factors = [],
      timestamp,
      district_id,
      recipient_phone,
      evacuation_direction
    } = req.body;

    // Validate required fields
    if (!location || risk_score === undefined || !level) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: location, risk_score, level'
      });
    }

    // Validate risk level
    const validLevels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL', 'EXTREME'];
    if (!validLevels.includes(level.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid level. Must be one of: ${validLevels.join(', ')}`
      });
    }

    // Generate alert ID
    const alertId = `ALERT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const alertTimestamp = timestamp || new Date().toISOString();

    // Create alert object
    const alert = {
      id: alertId,
      location,
      coordinates,
      riskScore: parseFloat(risk_score),
      level: level.toUpperCase(),
      factors: Array.isArray(factors) ? factors : [],
      timestamp: alertTimestamp,
      districtId: district_id || null,
      evacuationDirection: evacuation_direction || 'Move to higher ground and follow local evacuation procedures',
      recipientPhone: recipient_phone || null,
      status: 'ACTIVE',
      acknowledged: false
    };

    // Store in memory history
    alertHistory.push(alert);
    if (alertHistory.length > MAX_HISTORY) {
      alertHistory.shift();
    }

    // Store in Snowflake (if available)
    let snowflakeSaved = false;
    if (executeQuery) {
      try {
        const insertQuery = `
          INSERT INTO ALERT_HISTORY (
            ALERT_ID, LOCATION, COORDINATES, RISK_SCORE, RISK_LEVEL,
            TRIGGER_FACTORS, DISTRICT_ID, EVACUATION_DIRECTION,
            RECIPIENT_PHONE, STATUS, CREATED_AT
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await executeQuery(insertQuery, [
          alertId,
          location,
          JSON.stringify(coordinates),
          alert.riskScore,
          alert.level,
          JSON.stringify(alert.factors),
          alert.districtId,
          alert.evacuationDirection,
          alert.recipientPhone,
          'ACTIVE',
          alertTimestamp
        ]);
        
        snowflakeSaved = true;
      } catch (dbError) {
        console.error('[ALERTS] Failed to save to Snowflake:', dbError.message);
        // Continue even if DB save fails
      }
    }

    // Broadcast to WebSocket clients
    const broadcast = broadcastAlert(alert);

    // Send SMS if phone number provided and Twilio configured
    let smsSent = false;
    if (recipient_phone && process.env.TWILIO_ACCOUNT_SID) {
      try {
        smsSent = await sendSMS(alert, recipient_phone);
      } catch (smsError) {
        console.error('[ALERTS] SMS send failed:', smsError.message);
      }
    }

    // Generate direct alert URL
    const alertUrl = generateAlertUrl(alert);

    console.log(`[ALERTS] ⚠️  Emergency alert triggered: ${alertId} - ${location} - ${level} (${(alert.riskScore * 100).toFixed(0)}%)`);

    res.json({
      success: true,
      alert: {
        id: alertId,
        location,
        level: alert.level,
        riskScore: alert.riskScore,
        timestamp: alertTimestamp,
        url: alertUrl
      },
      broadcast: {
        webSocketClients: broadcast.sentCount,
        failed: broadcast.failedCount
      },
      storage: {
        memory: true,
        snowflake: snowflakeSaved
      },
      notifications: {
        sms: smsSent,
        smsRecipient: recipient_phone || null
      }
    });

  } catch (error) {
    console.error('[ALERTS] Trigger error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/alerts/history
 * Get recent alert history
 */
router.get('/history', async (req, res) => {
  try {
    const { limit = 50, level } = req.query;

    let alerts = [...alertHistory];
    
    // Filter by level if specified
    if (level) {
      alerts = alerts.filter(a => a.level === level.toUpperCase());
    }

    // Limit results
    alerts = alerts.slice(-parseInt(limit));

    res.json({
      success: true,
      count: alerts.length,
      alerts: alerts.reverse() // Most recent first
    });
  } catch (error) {
    console.error('[ALERTS] History error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/alerts/:alertId
 * Get specific alert details
 */
router.get('/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    
    const alert = alertHistory.find(a => a.id === alertId);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.json({
      success: true,
      alert
    });
  } catch (error) {
    console.error('[ALERTS] Get alert error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/alerts/acknowledge
 * Acknowledge an alert
 */
router.post('/acknowledge', async (req, res) => {
  try {
    const { alertId, timestamp } = req.body;

    if (!alertId) {
      return res.status(400).json({
        success: false,
        error: 'alertId is required'
      });
    }

    const alert = alertHistory.find(a => a.id === alertId);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    alert.acknowledged = true;
    alert.acknowledgedAt = timestamp || new Date().toISOString();

    // Update in Snowflake if available
    if (executeQuery) {
      try {
        const updateQuery = `
          UPDATE ALERT_HISTORY
          SET STATUS = 'ACKNOWLEDGED',
              ACKNOWLEDGED_AT = ?
          WHERE ALERT_ID = ?
        `;
        await executeQuery(updateQuery, [alert.acknowledgedAt, alertId]);
      } catch (dbError) {
        console.error('[ALERTS] Failed to update Snowflake:', dbError.message);
      }
    }

    // Broadcast acknowledgment
    broadcastAlert({
      type: 'ACKNOWLEDGED',
      alertId,
      acknowledgedAt: alert.acknowledgedAt
    });

    res.json({
      success: true,
      alert: {
        id: alertId,
        acknowledged: true,
        acknowledgedAt: alert.acknowledgedAt
      }
    });
  } catch (error) {
    console.error('[ALERTS] Acknowledge error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/alerts/test
 * Trigger a test alert
 */
router.post('/test', async (req, res) => {
  try {
    const testAlert = {
      location: 'Test Location - Meghalaya',
      coordinates: { lat: 25.5788, lng: 91.8933 },
      risk_score: 0.85,
      level: 'HIGH',
      factors: [
        { name: 'Rainfall', value: 150, unit: 'mm', severity: 'HIGH' },
        { name: 'Test Factor', value: 75, unit: '%', severity: 'MODERATE' }
      ],
      evacuation_direction: 'TEST ALERT - This is a test of the emergency alert system',
      ...req.body
    };

    // Generate alert ID
    const alertId = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const alertTimestamp = new Date().toISOString();

    // Create alert object
    const alert = {
      id: alertId,
      location: testAlert.location,
      coordinates: testAlert.coordinates,
      riskScore: parseFloat(testAlert.risk_score),
      level: testAlert.level.toUpperCase(),
      factors: testAlert.factors,
      timestamp: alertTimestamp,
      districtId: testAlert.district_id || null,
      evacuationDirection: testAlert.evacuation_direction,
      recipientPhone: testAlert.recipient_phone || null,
      status: 'TEST',
      acknowledged: false
    };

    // Store in memory history
    alertHistory.push(alert);
    if (alertHistory.length > MAX_HISTORY) {
      alertHistory.shift();
    }

    // Broadcast to WebSocket clients
    const broadcast = broadcastAlert(alert);

    // Generate direct alert URL
    const alertUrl = generateAlertUrl(alert);

    console.log(`[ALERTS] 🧪 Test alert triggered: ${alertId}`);

    res.json({
      success: true,
      message: 'Test alert triggered successfully',
      alert: {
        id: alertId,
        location: alert.location,
        level: alert.level,
        riskScore: alert.riskScore,
        timestamp: alertTimestamp,
        url: alertUrl
      },
      broadcast: {
        webSocketClients: broadcast.sentCount,
        failed: broadcast.failedCount
      }
    });
  } catch (error) {
    console.error('[ALERTS] Test alert error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate alert URL for sharing/mobile opening
 */
function generateAlertUrl(alert) {
  const baseUrl = process.env.ALERT_BASE_URL || 'http://localhost:3000';
  const params = new URLSearchParams({
    id: alert.id,
    location: alert.location,
    lat: alert.coordinates.lat,
    lng: alert.coordinates.lng,
    risk_score: alert.riskScore,
    level: alert.level,
    factors: JSON.stringify(alert.factors),
    evacuation: alert.evacuationDirection
  });
  
  return `${baseUrl}/emergency-alert?${params.toString()}`;
}

/**
 * Send SMS via Twilio (if configured)
 */
async function sendSMS(alert, recipientPhone) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('[ALERTS] Twilio not configured, skipping SMS');
    return false;
  }

  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const alertUrl = generateAlertUrl(alert);
    const message = `🚨 EMERGENCY ALERT\n${alert.level} RISK at ${alert.location}\nRisk: ${(alert.riskScore * 100).toFixed(0)}%\n\n${alert.evacuationDirection}\n\nView: ${alertUrl}`;

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: recipientPhone
    });

    console.log(`[ALERTS] SMS sent to ${recipientPhone}: ${result.sid}`);
    return true;
  } catch (error) {
    console.error('[ALERTS] SMS send error:', error.message);
    return false;
  }
}

module.exports = { router, setExecuteQuery, registerWebSocket, broadcastAlert };
