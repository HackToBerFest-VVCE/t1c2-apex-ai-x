/**
 * SignalMesh AI — API Service Layer
 * Secure interface to backend API (no Snowflake credentials exposed)
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;
      throw new Error(errorData.error || errorData.message || 'API request failed');
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Backend server not responding. Ensure backend is running on ' + API_BASE_URL);
    } else {
      // Something else happened
      throw new Error(error.message || 'Unknown error occurred');
    }
  }
);

/**
 * SignalMesh AI Backend API
 */
export const snowflakeAPI = {
  /**
   * Get backend health status and Snowflake connection state
   */
  getHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  /**
   * Get API information
   */
  getInfo: async () => {
    const response = await apiClient.get('/api');
    return response.data;
  },

  /**
   * Get all nation features (environmental risk factors)
   * Returns 25 nations from Snowflake NATION_FEATURES table
   */
  getNationFeatures: async () => {
    const response = await apiClient.get('/api/nation-features');
    return response.data;
  },

  /**
   * Get ML-generated risk assessments
   * Returns nations from Snowflake RISK_ASSESSMENT table
   * May be empty if ML model hasn't been run yet
   */
  getRiskAssessments: async () => {
    const response = await apiClient.get('/api/risk-assessments');
    return response.data;
  },

  /**
   * Get combined nation summary (features + assessments)
   * Uses Snowflake NATION_RISK_SUMMARY view (LEFT JOIN)
   * Returns all 25 nations, with null risk scores if not assessed yet
   */
  getNationSummary: async () => {
    const response = await apiClient.get('/api/nation-summary');
    return response.data;
  },

  /**
   * Get single nation by nation_key
   * @param {number} nationKey - Nation key (0-24)
   */
  getNation: async (nationKey) => {
    const response = await apiClient.get(`/api/nation/${nationKey}`);
    return response.data;
  },

  /**
   * Get INDIA nation data specifically (nation_key = 8)
   */
  getIndiaNation: async () => {
    const response = await apiClient.get('/api/nation/8');
    return response.data;
  },
};

/**
 * Helper to check if Snowflake integration is available
 */
export const checkSnowflakeConnection = async () => {
  try {
    const health = await snowflakeAPI.getHealth();
    return {
      available: health.snowflake.connected,
      configured: health.snowflake.configured,
      error: health.snowflake.error,
    };
  } catch (error) {
    return {
      available: false,
      configured: false,
      error: error.message,
    };
  }
};

export default snowflakeAPI;
