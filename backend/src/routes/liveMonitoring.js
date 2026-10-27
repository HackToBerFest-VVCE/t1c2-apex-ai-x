/**
 * SignalMesh AI - Live Monitoring Endpoints
 * Real-time environmental data and risk assessment
 */

const express = require('express');
const router = express.Router();
const liveDataService = require('../services/liveDataService');
const riskAssessmentService = require('../services/riskAssessmentService');

/**
 * Helper to execute Snowflake query
 * Passed in from server.js to avoid circular dependencies
 */
let executeQuery = null;

function setExecuteQuery(fn) {
  executeQuery = fn;
}

/**
 * GET /api/live/status
 * Get live monitoring system status
 */
router.get('/status', async (req, res) => {
  try {
    const dataSourceStatus = liveDataService.getStatus();
    
    res.json({
      success: true,
      status: 'operational',
      dataSources: dataSourceStatus,
      features: {
        liveRainfall: dataSourceStatus.imd.enabled || true, // Demo available
        forecasts: dataSourceStatus.imd.enabled || true,
        warnings: dataSourceStatus.imd.enabled || true,
        riskAssessment: true,
        historicalTrending: true
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Live status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/live/overview
 * Get overview of all monitored districts with latest status
 */
router.get('/overview', async (req, res) => {
  try {
    const { allowDemo = 'true' } = req.query;
    const useDemoData = allowDemo === 'true';

    // Get all districts from Snowflake
    const query = `
      SELECT 
        DISTRICT_ID,
        STATE_NAME,
        DISTRICT_NAME,
        TERRAIN_SLOPE_FACTOR,
        SOIL_STABILITY_INDEX,
        SEISMIC_ACTIVITY_LEVEL,
        VEGETATION_COVER,
        RISK_LEVEL as BASELINE_RISK_LEVEL
      FROM INDIA_DISTRICT_FEATURES
      ORDER BY STATE_NAME, DISTRICT_NAME
      LIMIT 20
    `;

    const districts = await executeQuery(query);

    // Get live data summary for each (sample for demo)
    const districtSummaries = districts.slice(0, 10).map(d => {
      const demoRainfall = liveDataService.demo.getRainfallObservation(
        d.DISTRICT_NAME,
        d.STATE_NAME
      );

      return {
        districtId: d.DISTRICT_ID,
        state: d.STATE_NAME,
        district: d.DISTRICT_NAME,
        baselineRisk: d.BASELINE_RISK_LEVEL,
        liveRainfall: demoRainfall.value,
        dataFreshness: 'DEMO',
        lastUpdated: demoRainfall.observationTime
      };
    });

    res.json({
      success: true,
      count: districtSummaries.length,
      totalDistricts: districts.length,
      data: districtSummaries,
      dataMode: useDemoData ? 'DEMO' : 'LIVE_ONLY',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Live overview error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/live/districts/:districtId
 * Get comprehensive live monitoring data for a specific district
 */
router.get('/districts/:districtId', async (req, res) => {
  try {
    const districtId = parseInt(req.params.districtId);
    const { allowDemo = 'true' } = req.query;
    const useDemoData = allowDemo === 'true';

    if (isNaN(districtId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid district_id'
      });
    }

    // Get district baseline data from Snowflake
    const districtQuery = `
      SELECT 
        DISTRICT_ID,
        STATE_NAME,
        DISTRICT_NAME,
        TERRAIN_SLOPE_FACTOR,
        SOIL_STABILITY_INDEX,
        SEISMIC_ACTIVITY_LEVEL,
        VEGETATION_COVER,
        RISK_LEVEL as BASELINE_RISK_LEVEL,
        RISK_SCORE as BASELINE_RISK_SCORE
      FROM INDIA_DISTRICT_FEATURES
      WHERE DISTRICT_ID = ?
    `;

    const districts = await executeQuery(districtQuery, [districtId]);

    if (districts.length === 0) {
      return res.status(404).json({
        success: false,
        error: `District ${districtId} not found`
      });
    }

    const district = districts[0];

    // Get live environmental data
    const liveData = await liveDataService.getDistrictLiveData(
      district.DISTRICT_NAME,
      district.STATE_NAME,
      useDemoData
    );

    // Perform live risk assessment
    const assessment = riskAssessmentService.assess({
      districtId: district.DISTRICT_ID,
      state: district.STATE_NAME,
      district: district.DISTRICT_NAME,
      rainfall: liveData.rainfall.available ? liveData.rainfall.value : null,
      forecastRainfall: liveData.forecast.available ? liveData.forecast.forecast24h : null,
      slope: district.TERRAIN_SLOPE_FACTOR,
      soilStability: district.SOIL_STABILITY_INDEX,
      seismicActivity: district.SEISMIC_ACTIVITY_LEVEL,
      vegetation: district.VEGETATION_COVER,
      rainfallFreshness: liveData.rainfall.freshness || 'UNAVAILABLE',
      previousRiskLevel: district.BASELINE_RISK_LEVEL
    });

    res.json({
      success: true,
      data: {
        district: {
          id: district.DISTRICT_ID,
          name: district.DISTRICT_NAME,
          state: district.STATE_NAME
        },
        baseline: {
          riskLevel: district.BASELINE_RISK_LEVEL,
          riskScore: district.BASELINE_RISK_SCORE,
          source: 'INDIA_DISTRICT_FEATURES'
        },
        liveData: {
          rainfall: liveData.rainfall,
          forecast: liveData.forecast,
          warnings: liveData.warnings,
          retrievedAt: liveData.retrievedAt
        },
        assessment: {
          riskScore: assessment.riskScore,
          riskLevel: assessment.riskLevel,
          riskChange: assessment.riskChange,
          confidence: assessment.confidence,
          dataFreshness: assessment.dataFreshness,
          topFactors: assessment.topFactors,
          availableFactors: assessment.availableFactors,
          missingFactors: assessment.missingFactors,
          timestamp: assessment.timestamp,
          disclaimer: assessment.disclaimer
        }
      },
      dataMode: useDemoData ? 'DEMO' : 'LIVE_ONLY',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Live district error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/live/refresh
 * Manually trigger data refresh for specific districts
 */
router.post('/refresh', async (req, res) => {
  try {
    const { districtIds, allowDemo = true } = req.body;

    if (!Array.isArray(districtIds) || districtIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'districtIds array is required'
      });
    }

    if (districtIds.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 districts per refresh request'
      });
    }

    // Get districts from Snowflake
    const placeholders = districtIds.map(() => '?').join(',');
    const query = `
      SELECT 
        DISTRICT_ID,
        STATE_NAME,
        DISTRICT_NAME,
        TERRAIN_SLOPE_FACTOR,
        SOIL_STABILITY_INDEX,
        SEISMIC_ACTIVITY_LEVEL,
        VEGETATION_COVER,
        RISK_LEVEL as BASELINE_RISK_LEVEL
      FROM INDIA_DISTRICT_FEATURES
      WHERE DISTRICT_ID IN (${placeholders})
    `;

    const districts = await executeQuery(query, districtIds);

    // Refresh data for each district
    const results = await Promise.all(
      districts.map(async (district) => {
        try {
          const liveData = await liveDataService.getDistrictLiveData(
            district.DISTRICT_NAME,
            district.STATE_NAME,
            allowDemo
          );

          const assessment = riskAssessmentService.assess({
            districtId: district.DISTRICT_ID,
            state: district.STATE_NAME,
            district: district.DISTRICT_NAME,
            rainfall: liveData.rainfall.available ? liveData.rainfall.value : null,
            forecastRainfall: liveData.forecast.available ? liveData.forecast.forecast24h : null,
            slope: district.TERRAIN_SLOPE_FACTOR,
            soilStability: district.SOIL_STABILITY_INDEX,
            seismicActivity: district.SEISMIC_ACTIVITY_LEVEL,
            vegetation: district.VEGETATION_COVER,
            rainfallFreshness: liveData.rainfall.freshness || 'UNAVAILABLE',
            previousRiskLevel: district.BASELINE_RISK_LEVEL
          });

          return {
            districtId: district.DISTRICT_ID,
            district: district.DISTRICT_NAME,
            state: district.STATE_NAME,
            success: true,
            riskLevel: assessment.riskLevel,
            riskScore: assessment.riskScore,
            riskChange: assessment.riskChange,
            dataFreshness: assessment.dataFreshness
          };
        } catch (error) {
          return {
            districtId: district.DISTRICT_ID,
            district: district.DISTRICT_NAME,
            state: district.STATE_NAME,
            success: false,
            error: error.message
          };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      refreshed: successCount,
      total: districtIds.length,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = { router, setExecuteQuery };
