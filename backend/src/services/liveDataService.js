/**
 * SignalMesh AI - Live Data Service
 * Integrates external data sources for live monitoring
 * 
 * IMPORTANT: This service provides interfaces for live data integration.
 * Actual API keys and credentials must be configured in environment variables.
 * 
 * Data Sources (when configured):
 * - India Meteorological Department (IMD) - Official weather data
 * - NASA GPM - Precipitation data
 * - Mock/Demo sources for development
 */

const axios = require('axios');
const NodeCache = require('node-cache');

// Cache for external API responses (5 minute TTL by default)
const dataCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Data freshness classification
 */
function classifyFreshness(observationTime) {
  if (!observationTime) return 'UNAVAILABLE';
  
  const now = new Date();
  const obsTime = new Date(observationTime);
  const ageHours = (now - obsTime) / (1000 * 60 * 60);
  
  if (ageHours < 1) return 'LIVE';
  if (ageHours < 24) return 'RECENT';
  return 'STALE';
}

/**
 * IMD (India Meteorological Department) Integration
 * Official weather observations and forecasts
 * 
 * NOTE: This is a placeholder implementation. Actual IMD API integration
 * requires proper authentication and endpoint configuration.
 */
class IMDService {
  constructor() {
    this.baseURL = process.env.IMD_API_URL || null;
    this.apiKey = process.env.IMD_API_KEY || null;
    this.enabled = !!(this.baseURL && this.apiKey);
  }

  /**
   * Get latest rainfall observations for a district
   */
  async getRainfallObservation(district, state) {
    if (!this.enabled) {
      return {
        available: false,
        reason: 'IMD API not configured',
        requiresSetup: true
      };
    }

    const cacheKey = `imd_rainfall_${state}_${district}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;

    try {
      // TODO: Replace with actual IMD API endpoint when credentials are available
      // Example: const response = await axios.get(`${this.baseURL}/rainfall`, {
      //   params: { district, state },
      //   headers: { 'Authorization': `Bearer ${this.apiKey}` },
      //   timeout: 10000
      // });
      
      // For now, return unavailable with clear status
      const result = {
        available: false,
        reason: 'IMD API endpoint not implemented',
        requiresSetup: true,
        setupInstructions: 'Set IMD_API_URL and IMD_API_KEY environment variables'
      };
      
      dataCache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error('IMD API Error:', error.message);
      return {
        available: false,
        error: error.message,
        reason: 'API request failed'
      };
    }
  }

  /**
   * Get rainfall forecast for a district
   */
  async getRainfallForecast(district, state) {
    if (!this.enabled) {
      return {
        available: false,
        reason: 'IMD API not configured',
        requiresSetup: true
      };
    }

    const cacheKey = `imd_forecast_${state}_${district}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;

    try {
      // TODO: Implement actual IMD forecast API call
      const result = {
        available: false,
        reason: 'IMD forecast API not implemented',
        requiresSetup: true
      };
      
      dataCache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error('IMD Forecast Error:', error.message);
      return {
        available: false,
        error: error.message
      };
    }
  }

  /**
   * Get weather warnings/advisories for a state or district
   */
  async getWeatherWarnings(district, state) {
    if (!this.enabled) {
      return {
        available: false,
        warnings: [],
        reason: 'IMD API not configured'
      };
    }

    const cacheKey = `imd_warnings_${state}_${district}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;

    try {
      // TODO: Implement actual IMD warnings API
      const result = {
        available: false,
        warnings: [],
        reason: 'IMD warnings API not implemented'
      };
      
      dataCache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error('IMD Warnings Error:', error.message);
      return {
        available: false,
        warnings: [],
        error: error.message
      };
    }
  }
}

/**
 * Demo Data Service
 * Provides synthetic data for demonstration when live sources are unavailable
 */
class DemoDataService {
  /**
   * Generate realistic demo rainfall observation
   */
  getRainfallObservation(district, state) {
    // Generate consistent but varied rainfall based on district name
    const districtCode = district.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const baseRainfall = (districtCode % 100) + 50;
    const variation = Math.sin(Date.now() / 10000) * 30;
    
    return {
      available: true,
      value: Math.max(0, Math.round(baseRainfall + variation)),
      unit: 'mm',
      source: 'SYNTHETIC_DEMO',
      observationTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
      retrievalTime: new Date().toISOString(),
      freshness: 'LIVE',
      isDemo: true,
      disclaimer: 'Demonstration data for prototype purposes'
    };
  }

  /**
   * Generate demo forecast
   */
  getRainfallForecast(district, state) {
    const districtCode = district.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const forecast24h = (districtCode % 80) + 20;
    
    return {
      available: true,
      forecast24h: Math.round(forecast24h),
      forecast48h: Math.round(forecast24h * 1.2),
      forecast72h: Math.round(forecast24h * 0.9),
      unit: 'mm',
      source: 'SYNTHETIC_DEMO',
      forecastTime: new Date().toISOString(),
      validFrom: new Date().toISOString(),
      isDemo: true,
      disclaimer: 'Demonstration forecast for prototype purposes'
    };
  }

  /**
   * Generate demo weather warnings
   */
  getWeatherWarnings(district, state) {
    const now = Date.now();
    const shouldHaveWarning = (now % 10000) < 3000; // 30% chance
    
    if (!shouldHaveWarning) {
      return {
        available: true,
        warnings: [],
        source: 'SYNTHETIC_DEMO',
        isDemo: true
      };
    }

    return {
      available: true,
      warnings: [
        {
          type: 'HEAVY_RAINFALL',
          severity: 'MODERATE',
          message: `Heavy rainfall expected in ${district}, ${state}`,
          validFrom: new Date().toISOString(),
          validUntil: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
          source: 'SYNTHETIC_DEMO'
        }
      ],
      source: 'SYNTHETIC_DEMO',
      isDemo: true,
      disclaimer: 'Demonstration warnings for prototype purposes'
    };
  }
}

/**
 * Live Data Coordinator
 * Manages multiple data sources with fallback logic
 */
class LiveDataCoordinator {
  constructor() {
    this.imd = new IMDService();
    this.demo = new DemoDataService();
  }

  /**
   * Get rainfall observation with automatic fallback
   */
  async getRainfallData(district, state, allowDemo = false) {
    // Try IMD first
    const imdData = await this.imd.getRainfallObservation(district, state);
    if (imdData.available) {
      return {
        ...imdData,
        dataSource: 'IMD',
        freshness: classifyFreshness(imdData.observationTime)
      };
    }

    // Fall back to demo if allowed
    if (allowDemo) {
      const demoData = this.demo.getRainfallObservation(district, state);
      return {
        ...demoData,
        dataSource: 'DEMO',
        usedFallback: true,
        liveSourceStatus: imdData.reason || 'unavailable'
      };
    }

    // Return unavailable
    return {
      available: false,
      reason: imdData.reason || 'No live data source available',
      requiresSetup: imdData.requiresSetup,
      setupInstructions: imdData.setupInstructions
    };
  }

  /**
   * Get rainfall forecast with automatic fallback
   */
  async getForecastData(district, state, allowDemo = false) {
    const imdForecast = await this.imd.getRainfallForecast(district, state);
    if (imdForecast.available) {
      return {
        ...imdForecast,
        dataSource: 'IMD_FORECAST'
      };
    }

    if (allowDemo) {
      const demoForecast = this.demo.getRainfallForecast(district, state);
      return {
        ...demoForecast,
        dataSource: 'DEMO_FORECAST',
        usedFallback: true
      };
    }

    return {
      available: false,
      reason: imdForecast.reason || 'No forecast source available'
    };
  }

  /**
   * Get weather warnings with fallback
   */
  async getWarningsData(district, state, allowDemo = false) {
    const imdWarnings = await this.imd.getWeatherWarnings(district, state);
    if (imdWarnings.available) {
      return {
        ...imdWarnings,
        dataSource: 'IMD_WARNINGS'
      };
    }

    if (allowDemo) {
      const demoWarnings = this.demo.getWeatherWarnings(district, state);
      return {
        ...demoWarnings,
        dataSource: 'DEMO_WARNINGS',
        usedFallback: true
      };
    }

    return {
      available: false,
      warnings: [],
      reason: imdWarnings.reason || 'No warnings source available'
    };
  }

  /**
   * Get comprehensive live data for a district
   */
  async getDistrictLiveData(district, state, allowDemo = false) {
    const [rainfall, forecast, warnings] = await Promise.all([
      this.getRainfallData(district, state, allowDemo),
      this.getForecastData(district, state, allowDemo),
      this.getWarningsData(district, state, allowDemo)
    ]);

    return {
      district,
      state,
      rainfall,
      forecast,
      warnings,
      retrievedAt: new Date().toISOString(),
      dataMode: allowDemo ? 'LIVE_WITH_DEMO_FALLBACK' : 'LIVE_ONLY'
    };
  }

  /**
   * Get integration status
   */
  getStatus() {
    return {
      imd: {
        enabled: this.imd.enabled,
        configured: !!(this.imd.baseURL && this.imd.apiKey),
        requiresSetup: !this.imd.enabled,
        setupInstructions: this.imd.enabled ? null : 'Set IMD_API_URL and IMD_API_KEY'
      },
      demo: {
        available: true,
        purpose: 'Fallback for development and demonstration'
      },
      cacheStats: {
        keys: dataCache.keys().length,
        hits: dataCache.getStats().hits,
        misses: dataCache.getStats().misses
      }
    };
  }
}

// Export singleton instance
module.exports = new LiveDataCoordinator();
