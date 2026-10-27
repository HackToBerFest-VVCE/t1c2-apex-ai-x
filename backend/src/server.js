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
 * Initialize Snowflake connection with password authentication
 */
async function initializeSnowflake() {
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
  console.log(`   Account: ${process.env.SNOWFLAKE_ACCOUNT}`);
  console.log(`   User: ${process.env.SNOWFLAKE_USERNAME}`);
  console.log(`   Warehouse: ${process.env.SNOWFLAKE_WAREHOUSE}`);
  console.log(`   Database: ${process.env.SNOWFLAKE_DATABASE}`);
  console.log(`   Schema: ${process.env.SNOWFLAKE_SCHEMA}`);
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

  // Use standard connect() for password authentication
  snowflakeConnection.connect((err, conn) => {
    if (err) {
      console.error('❌ Failed to connect to Snowflake:', err.message);
      console.error('   Error code:', err.code);
      connectionStatus.connected = false;
      connectionStatus.error = err.message;
      
      // Provide helpful guidance based on error
      if (err.message.includes('Incorrect username or password')) {
        console.error('\n⚠️  Authentication Failed:');
        console.error('   Please verify your SNOWFLAKE_USERNAME and SNOWFLAKE_PASSWORD in .env');
        console.error('   Username should be: kushalmys55 (not the email)');
      } else if (err.message.includes('does not exist') || err.message.includes('not authorized')) {
        console.error('\n⚠️  Database/Schema Access Issue:');
        console.error('   Verify the database and schema exist and you have access');
      }
    } else {
      console.log('✅ Connected to Snowflake successfully');
      console.log(`   Session ID: ${conn.getId()}`);
      connectionStatus.connected = true;
      connectionStatus.error = null;
      
      // Execute test queries to verify access
      testSnowflakeConnection();
    }
  });
}

/**
 * Test Snowflake connection with real queries
 */
async function testSnowflakeConnection() {
  console.log('\n🧪 Testing Snowflake connection...');
  
  try {
    // Test 1: Get current session details
    const sessionQuery = `
      SELECT 
        CURRENT_USER() as current_user,
        CURRENT_DATABASE() as current_database,
        CURRENT_SCHEMA() as current_schema,
        CURRENT_WAREHOUSE() as current_warehouse,
        CURRENT_ROLE() as current_role
    `;
    
    const sessionInfo = await executeQuery(sessionQuery);
    console.log('✅ Session Info:', sessionInfo[0]);
    
    // Test 2: Query NATION_FEATURES table
    const tableQuery = `
      SELECT COUNT(*) as row_count, 
             COUNT(DISTINCT nation_name) as nation_count
      FROM NATION_FEATURES
    `;
    
    const tableInfo = await executeQuery(tableQuery);
    console.log('✅ NATION_FEATURES Table:', tableInfo[0]);
    
    // Test 3: Sample data from NATION_FEATURES
    const sampleQuery = `
      SELECT nation_name, region_name, precipitation_index
      FROM NATION_FEATURES
      ORDER BY nation_name
      LIMIT 5
    `;
    
    const sampleData = await executeQuery(sampleQuery);
    console.log('✅ Sample Nations:');
    sampleData.forEach(row => {
      console.log(`   - ${row.NATION_NAME} (${row.REGION_NAME})`);
    });
    
    console.log('\n✅ All Snowflake connection tests passed!\n');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('   Ensure SIGNALMESH_AI.DISASTER_RISK.NATION_FEATURES table exists');
  }
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
    description: 'Secure backend API for disaster intelligence platform - India landslide risk monitoring',
    team: 'Apex-AI-X',
    focus: 'Northeast India - 8 states, 69 districts',
    endpoints: {
      health: 'GET /health',
      indiaDistricts: 'GET /api/india-districts',
      indiaDistrictById: 'GET /api/india-districts/:districtId',
      indiaDistrictSummary: 'GET /api/india-district-summary',
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

// Import live monitoring routes
const liveMonitoringRoutes = require('./routes/liveMonitoring');

// Configure live monitoring routes with Snowflake query executor
liveMonitoringRoutes.setExecuteQuery(executeQuery);
app.use('/api/live', liveMonitoringRoutes.router);

// -----------------------------------------------------------------------------
// INDIA DISTRICT ENDPOINTS (Primary Focus)
// -----------------------------------------------------------------------------

/**
 * Get all India districts with landslide risk data
 * Focus: Northeast India - 8 states, 69 districts
 */
app.get('/api/india-districts', async (req, res) => {
  try {
    const query = `
      SELECT 
        DISTRICT_ID,
        STATE_NAME,
        DISTRICT_NAME,
        RAINFALL_MM,
        TERRAIN_SLOPE_FACTOR,
        SOIL_STABILITY_INDEX,
        SEISMIC_ACTIVITY_LEVEL,
        VEGETATION_COVER,
        RISK_SCORE,
        RISK_LEVEL,
        DATA_SOURCE,
        DATA_TYPE,
        UPDATED_AT
      FROM INDIA_DISTRICT_FEATURES
      ORDER BY STATE_NAME, DISTRICT_NAME
    `;

    const rows = await executeQuery(query);
    
    res.json({
      success: true,
      count: rows.length,
      data: rows,
      source: 'SIGNALMESH_AI.DISASTER_RISK.INDIA_DISTRICT_FEATURES',
      timestamp: new Date().toISOString(),
      metadata: {
        states: 8,
        focus: 'Northeast India',
        dataType: 'SYNTHETIC_DEMO - Hackathon demonstration'
      }
    });
  } catch (error) {
    console.error('Error fetching India districts:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      hint: connectionStatus.error || 'Check Snowflake connection and credentials'
    });
  }
});

/**
 * Get single district by ID
 */
app.get('/api/india-districts/:districtId', async (req, res) => {
  try {
    const districtId = parseInt(req.params.districtId);
    
    if (isNaN(districtId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid district_id. Must be an integer.'
      });
    }

    const query = `
      SELECT 
        DISTRICT_ID,
        STATE_NAME,
        DISTRICT_NAME,
        RAINFALL_MM,
        TERRAIN_SLOPE_FACTOR,
        SOIL_STABILITY_INDEX,
        SEISMIC_ACTIVITY_LEVEL,
        VEGETATION_COVER,
        RISK_SCORE,
        RISK_LEVEL,
        DATA_SOURCE,
        DATA_TYPE,
        UPDATED_AT
      FROM INDIA_DISTRICT_FEATURES
      WHERE DISTRICT_ID = ?
    `;

    const rows = await executeQuery(query, [districtId]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `District with ID ${districtId} not found`
      });
    }

    res.json({
      success: true,
      data: rows[0],
      source: 'SIGNALMESH_AI.DISASTER_RISK.INDIA_DISTRICT_FEATURES',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching district by ID:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      hint: connectionStatus.error || 'Check Snowflake connection and credentials'
    });
  }
});

/**
 * Get India district summary with aggregated statistics
 */
app.get('/api/india-district-summary', async (req, res) => {
  try {
    // Get overall statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_districts,
        COUNT(DISTINCT STATE_NAME) as total_states,
        AVG(RAINFALL_MM) as avg_rainfall,
        AVG(TERRAIN_SLOPE_FACTOR) as avg_slope,
        AVG(SOIL_STABILITY_INDEX) as avg_soil_stability,
        AVG(RISK_SCORE) as avg_risk_score
      FROM INDIA_DISTRICT_FEATURES
    `;
    
    // Get risk level distribution
    const riskDistQuery = `
      SELECT 
        RISK_LEVEL,
        COUNT(*) as count
      FROM INDIA_DISTRICT_FEATURES
      GROUP BY RISK_LEVEL
      ORDER BY 
        CASE RISK_LEVEL
          WHEN 'EXTREME' THEN 1
          WHEN 'VERY_HIGH' THEN 2
          WHEN 'HIGH' THEN 3
          WHEN 'MODERATE' THEN 4
          WHEN 'LOW' THEN 5
        END
    `;
    
    // Get state-wise distribution
    const stateDistQuery = `
      SELECT 
        STATE_NAME,
        COUNT(*) as district_count,
        AVG(RISK_SCORE) as avg_risk_score,
        COUNT(CASE WHEN RISK_LEVEL IN ('VERY_HIGH', 'EXTREME') THEN 1 END) as high_risk_count
      FROM INDIA_DISTRICT_FEATURES
      GROUP BY STATE_NAME
      ORDER BY avg_risk_score DESC
    `;
    
    // Get top high-risk districts
    const topRiskQuery = `
      SELECT 
        DISTRICT_ID,
        STATE_NAME,
        DISTRICT_NAME,
        RISK_SCORE,
        RISK_LEVEL
      FROM INDIA_DISTRICT_FEATURES
      ORDER BY RISK_SCORE DESC
      LIMIT 10
    `;

    const [stats, riskDist, stateDist, topRisk] = await Promise.all([
      executeQuery(statsQuery),
      executeQuery(riskDistQuery),
      executeQuery(stateDistQuery),
      executeQuery(topRiskQuery)
    ]);
    
    res.json({
      success: true,
      summary: {
        totalDistricts: stats[0].TOTAL_DISTRICTS,
        totalStates: stats[0].TOTAL_STATES,
        averageRainfall: Math.round(stats[0].AVG_RAINFALL),
        averageSlope: parseFloat(stats[0].AVG_SLOPE).toFixed(1),
        averageSoilStability: Math.round(stats[0].AVG_SOIL_STABILITY),
        averageRiskScore: parseFloat(stats[0].AVG_RISK_SCORE).toFixed(2)
      },
      riskDistribution: riskDist.map(r => ({
        level: r.RISK_LEVEL,
        count: r.COUNT
      })),
      stateDistribution: stateDist.map(s => ({
        state: s.STATE_NAME,
        districtCount: s.DISTRICT_COUNT,
        avgRiskScore: parseFloat(s.AVG_RISK_SCORE).toFixed(2),
        highRiskCount: s.HIGH_RISK_COUNT
      })),
      topHighRiskDistricts: topRisk.map(d => ({
        id: d.DISTRICT_ID,
        state: d.STATE_NAME,
        district: d.DISTRICT_NAME,
        riskScore: d.RISK_SCORE,
        riskLevel: d.RISK_LEVEL
      })),
      source: 'SIGNALMESH_AI.DISASTER_RISK.INDIA_DISTRICT_FEATURES',
      timestamp: new Date().toISOString(),
      metadata: {
        dataType: 'SYNTHETIC_DEMO',
        purpose: 'Hackathon demonstration',
        focus: 'Northeast India landslide risk assessment'
      }
    });
  } catch (error) {
    console.error('Error fetching India district summary:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      hint: connectionStatus.error || 'Check Snowflake connection and credentials'
    });
  }
});

// -----------------------------------------------------------------------------
// NATION-LEVEL ENDPOINTS (Legacy/Global Data)
// -----------------------------------------------------------------------------

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
        data_source
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
      'GET /api/india-districts',
      'GET /api/india-districts/:districtId',
      'GET /api/india-district-summary',
      'GET /api/live/status',
      'GET /api/live/overview',
      'GET /api/live/districts/:districtId',
      'POST /api/live/refresh',
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
  console.log('\n🇮🇳 India District Endpoints (Primary):');
  console.log('  GET /api/india-districts        — All districts (69 districts, 8 states)');
  console.log('  GET /api/india-districts/:id    — Single district by ID');
  console.log('  GET /api/india-district-summary — Aggregated statistics & risk distribution');
  console.log('\n🔴 Live Monitoring Endpoints (Feature 2):');
  console.log('  GET /api/live/status            — Live system status & data sources');
  console.log('  GET /api/live/overview          — All districts live summary');
  console.log('  GET /api/live/districts/:id     — District live data & assessment');
  console.log('  POST /api/live/refresh          — Manual data refresh');
  console.log('\n🌏 Global Nation Endpoints (Legacy):');
  console.log('  GET /health                     — Health check & Snowflake status');
  console.log('  GET /api                        — API information');
  console.log('  GET /api/nation-features        — All nations with environmental data');
  console.log('  GET /api/risk-assessments       — ML-generated risk assessments');
  console.log('  GET /api/nation-summary         — Combined features + assessments');
  console.log('  GET /api/nation/:key            — Single nation by nation_key');
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
