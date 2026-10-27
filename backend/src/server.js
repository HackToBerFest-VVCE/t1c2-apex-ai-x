/**
 * SignalMesh AI Backend Server
 * Secure API layer for Snowflake database integration
 * 
 * SECURITY: Snowflake credentials are loaded from .env file
 * and NEVER exposed to frontend code or committed to git.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const snowflake = require('snowflake-sdk');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Snowflake connection state
let snowflakeConnection = null;
let connectionStatus = {
  connected: false,
  error: null,
  lastAttempt: null
};

/**
 * Initialize Snowflake connection
 * Only attempts connection if credentials are configured
 */
function initializeSnowflake() {
  const required = [
    'SNOWFLAKE_ACCOUNT',
    'SNOWFLAKE_USERNAME',
    'SNOWFLAKE_PASSWORD'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(', ')}`;
    console.warn(`⚠️  ${msg}`);
    console.warn('⚠️  Snowflake integration disabled. Configure .env to enable.');
    connectionStatus.error = msg;
    return;
  }

  console.log('🔄 Connecting to Snowflake...');
  connectionStatus.lastAttempt = new Date().toISOString();

  snowflakeConnection = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USERNAME,
    password: process.env.SNOWFLAKE_PASSWORD,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database: process.env.SNOWFLAKE_DATABASE,
    schema: process.env.SNOWFLAKE_SCHEMA,
    application: 'SignalMeshAI_Backend'
  });

  snowflakeConnection.connect((err, conn) => {
    if (err) {
      console.error('❌ Failed to connect to Snowflake:', err.message);
      connectionStatus.connected = false;
      connectionStatus.error = err.message;
    } else {
      console.log('✅ Connected to Snowflake successfully');
      console.log(`   Database: ${process.env.SNOWFLAKE_DATABASE}`);
      console.log(`   Schema: ${process.env.SNOWFLAKE_SCHEMA}`);
      connectionStatus.connected = true;
      connectionStatus.error = null;
    }
  });
}

/**
 * Execute Snowflake query with error handling
 */
function executeQuery(sqlText, binds = []) {
  return new Promise((resolve, reject) => {
    if (!snowflakeConnection) {
      return reject(new Error('Snowflake connection not initialized'));
    }

    if (!connectionStatus.connected) {
      return reject(new Error('Snowflake connection not established'));
    }

    const options = {
      sqlText,
      binds,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Query error:', err.message);
          return reject(err);
        }
        resolve(rows);
      }
    };

    snowflakeConnection.execute(options);
  });
}

// =============================================================================
// HEALTH & STATUS ENDPOINTS
// =============================================================================

/**
 * Health check endpoint
 * Returns API and Snowflake connection status
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SignalMesh AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    snowflake: {
      configured: !!snowflakeConnection,
      connected: connectionStatus.connected,
      error: connectionStatus.error,
      lastAttempt: connectionStatus.lastAttempt
    }
  });
});

/**
 * API info endpoint
 */
app.get('/api', (req, res) => {
  res.json({
    name: 'SignalMesh AI API',
    version: '1.0.0',
    description: 'Secure backend API for disaster intelligence platform',
    team: 'Apex-AI-X',
    endpoints: {
      health: 'GET /health',
      nationFeatures: 'GET /api/nation-features',
      riskAssessments: 'GET /api/risk-assessments',
      nationSummary: 'GET /api/nation-summary',
      nationById: 'GET /api/nation/:nationKey'
    }
  });
});

// =============================================================================
// DATA ENDPOINTS
// =============================================================================

/**
 * Get all nation features (environmental risk factors)
 */
app.get('/api/nation-features', async (req, res) => {
  try {
    const query = `
      SELECT 
        nation_key,
        nation_name,
        region_name,
        precipitation_index,
        terrain_slope_factor,
        soil_stability_index,
        seismic_activity_level,
        vegetation_cover,
        customer_count,
        data_source,
        created_at
      FROM NATION_FEATURES
      ORDER BY nation_name
    `;

    const rows = await executeQuery(query);
    
    res.json({
      success: true,
      count: rows.length,
      data: rows,
      source: 'SIGNALMESH_AI.DISASTER_RISK.NATION_FEATURES',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching nation features:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      hint: connectionStatus.error || 'Check Snowflake connection and credentials'
    });
  }
});

/**
 * Get all risk assessments (ML-generated)
 */
app.get('/api/risk-assessments', async (req, res) => {
  try {
    const query = `
      SELECT 
        assessment_id,
        nation_key,
        nation_name,
        region_name,
        risk_score,
        risk_level,
        confidence_score,
        top_risk_factor_1,
        top_risk_factor_1_importance,
        top_risk_factor_2,
        top_risk_factor_2_importance,
        top_risk_factor_3,
        top_risk_factor_3_importance,
        model_version,
        assessed_at
      FROM RISK_ASSESSMENT
      ORDER BY risk_score DESC
    `;

    const rows = await executeQuery(query);
    
    res.json({
      success: true,
      count: rows.length,
      data: rows,
      source: 'SIGNALMESH_AI.DISASTER_RISK.RISK_ASSESSMENT',
      timestamp: new Date().toISOString(),
      note: rows.length === 0 ? 'Risk assessment table is empty. Run ML model to populate.' : null
    });
  } catch (error) {
    console.error('Error fetching risk assessments:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      hint: connectionStatus.error || 'Check Snowflake connection and credentials'
    });
  }
});

/**
 * Get combined nation summary (features + risk assessments)
 * Uses NATION_RISK_SUMMARY view with LEFT JOIN
 */
app.get('/api/nation-summary', async (req, res) => {
  try {
    const query = `
      SELECT * FROM NATION_RISK_SUMMARY
      ORDER BY nation_name
    `;

    const rows = await executeQuery(query);
    
    res.json({
      success: true,
      count: rows.length,
      data: rows,
      source: 'SIGNALMESH_AI.DISASTER_RISK.NATION_RISK_SUMMARY (view)',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching nation summary:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      hint: connectionStatus.error || 'Check Snowflake connection and credentials'
    });
  }
});

/**
 * Get single nation by nation_key
 */
app.get('/api/nation/:nationKey', async (req, res) => {
  try {
    const nationKey = parseInt(req.params.nationKey);
    
    if (isNaN(nationKey)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid nation_key. Must be an integer.'
      });
    }

    const query = `
      SELECT * FROM NATION_RISK_SUMMARY
      WHERE nation_key = ?
    `;

    const rows = await executeQuery(query, [nationKey]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Nation with key ${nationKey} not found`
      });
    }

    res.json({
      success: true,
      data: rows[0],
      source: 'SIGNALMESH_AI.DISASTER_RISK.NATION_RISK_SUMMARY',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching nation by key:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      hint: connectionStatus.error || 'Check Snowflake connection and credentials'
    });
  }
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    availableEndpoints: [
      'GET /health',
      'GET /api',
      'GET /api/nation-features',
      'GET /api/risk-assessments',
      'GET /api/nation-summary',
      'GET /api/nation/:nationKey'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// =============================================================================
// SERVER INITIALIZATION
// =============================================================================

// Initialize Snowflake connection on startup
initializeSnowflake();

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 SignalMesh AI Backend Server');
  console.log('='.repeat(60));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log('='.repeat(60));
  console.log('\nAvailable endpoints:');
  console.log('  GET /health              — Health check & Snowflake status');
  console.log('  GET /api                 — API information');
  console.log('  GET /api/nation-features — All nations with environmental data');
  console.log('  GET /api/risk-assessments — ML-generated risk assessments');
  console.log('  GET /api/nation-summary  — Combined features + assessments');
  console.log('  GET /api/nation/:key     — Single nation by nation_key');
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  if (snowflakeConnection) {
    snowflakeConnection.destroy((err) => {
      if (err) {
        console.error('Error closing Snowflake connection:', err);
      } else {
        console.log('✅ Snowflake connection closed');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
