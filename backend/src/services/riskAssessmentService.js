/**
 * SignalMesh AI - Risk Assessment Service
 * Calculates landslide risk scores based on available environmental data
 * 
 * DISCLAIMER: This is a heuristic demonstration model for hackathon purposes.
 * NOT validated for operational landslide prediction.
 * Real-world deployment requires geological expert validation.
 */

const { v4: uuidv4 } = require('crypto').randomUUID ? require('crypto') : { v4: () => require('crypto').randomBytes(16).toString('hex') };

/**
 * Risk Assessment Calculator
 * Uses transparent weighted scoring based on available environmental factors
 */
class RiskAssessmentCalculator {
  constructor() {
    // Factor weights (must sum to 1.0)
    this.weights = {
      rainfall: 0.30,        // 30% - Recent rainfall accumulation
      forecast: 0.15,        // 15% - Forecasted rainfall
      slope: 0.25,           // 25% - Terrain slope susceptibility
      soil: 0.20,            // 20% - Soil stability
      seismic: 0.05,         // 5% - Seismic activity
      vegetation: 0.05       // 5% - Vegetation cover (protective)
    };

    // Assessment version for tracking changes
    this.version = '1.0';
  }

  /**
   * Normalize input values to 0-100 scale
   */
  normalizeInputs(rawInputs) {
    const normalized = {};

    // Rainfall: 0-300mm -> 0-100
    if (rawInputs.rainfall !== undefined && rawInputs.rainfall !== null) {
      normalized.rainfall = Math.min(100, (rawInputs.rainfall / 300) * 100);
    }

    // Forecast rainfall: 0-200mm -> 0-100
    if (rawInputs.forecastRainfall !== undefined && rawInputs.forecastRainfall !== null) {
      normalized.forecast = Math.min(100, (rawInputs.forecastRainfall / 200) * 100);
    }

    // Slope: assumed already 0-100
    if (rawInputs.slope !== undefined && rawInputs.slope !== null) {
      normalized.slope = rawInputs.slope;
    }

    // Soil stability: 0-100, but we want LOWER stability = HIGHER risk
    if (rawInputs.soilStability !== undefined && rawInputs.soilStability !== null) {
      normalized.soil = 100 - rawInputs.soilStability; // Invert
    }

    // Seismic activity: assumed 0-100
    if (rawInputs.seismicActivity !== undefined && rawInputs.seismicActivity !== null) {
      normalized.seismic = rawInputs.seismicActivity;
    }

    // Vegetation: 0-100, but HIGHER vegetation = LOWER risk
    if (rawInputs.vegetation !== undefined && rawInputs.vegetation !== null) {
      normalized.vegetation = 100 - rawInputs.vegetation; // Invert
    }

    return normalized;
  }

  /**
   * Calculate weighted risk score
   */
  calculateScore(normalizedInputs, availableFactors) {
    let totalScore = 0;
    let totalWeight = 0;
    const contributions = {};

    // Calculate contribution from each available factor
    for (const [factor, weight] of Object.entries(this.weights)) {
      if (normalizedInputs[factor] !== undefined && availableFactors.includes(factor)) {
        const contribution = normalizedInputs[factor] * weight;
        totalScore += contribution;
        totalWeight += weight;
        contributions[factor] = {
          value: normalizedInputs[factor],
          weight: weight,
          contribution: contribution
        };
      }
    }

    // Normalize score if some factors are missing
    if (totalWeight > 0) {
      totalScore = (totalScore / totalWeight) * 100;
    }

    return {
      score: Math.round(totalScore * 100) / 100,
      contributions,
      totalWeight,
      missingWeight: 1 - totalWeight
    };
  }

  /**
   * Classify risk level based on score
   */
  classifyRisk(score) {
    if (score >= 80) return 'EXTREME';
    if (score >= 60) return 'VERY_HIGH';
    if (score >= 40) return 'HIGH';
    if (score >= 20) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Get top contributing factors
   */
  getTopFactors(contributions) {
    const factors = Object.entries(contributions)
      .map(([name, data]) => ({
        name: this.formatFactorName(name),
        contribution: Math.round(data.contribution * 100) / 100,
        percentage: Math.round((data.contribution / 100) * 100)
      }))
      .sort((a, b) => b.contribution - a.contribution);

    return factors.slice(0, 3);
  }

  /**
   * Format factor name for display
   */
  formatFactorName(factor) {
    const names = {
      rainfall: 'Recent Rainfall',
      forecast: 'Forecast Rainfall',
      slope: 'Terrain Slope',
      soil: 'Soil Instability',
      seismic: 'Seismic Activity',
      vegetation: 'Vegetation Loss'
    };
    return names[factor] || factor;
  }

  /**
   * Calculate confidence score based on data availability and freshness
   */
  calculateConfidence(availableFactors, dataFreshness) {
    // Base confidence from data availability
    const availabilityScore = (availableFactors.length / Object.keys(this.weights).length) * 100;

    // Adjust for data freshness
    let freshnessMultiplier = 1.0;
    if (dataFreshness === 'LIVE') freshnessMultiplier = 1.0;
    else if (dataFreshness === 'RECENT') freshnessMultiplier = 0.8;
    else if (dataFreshness === 'STALE') freshnessMultiplier = 0.5;
    else freshnessMultiplier = 0.3;

    return Math.round(availabilityScore * freshnessMultiplier);
  }

  /**
   * Main assessment function
   */
  assess(inputs) {
    const {
      districtId,
      state,
      district,
      rainfall,
      forecastRainfall,
      slope,
      soilStability,
      seismicActivity,
      vegetation,
      rainfallFreshness = 'UNAVAILABLE',
      previousRiskLevel = null
    } = inputs;

    // Track which factors are actually available
    const availableFactors = [];
    const missingFactors = [];
    const dataSources = [];

    if (rainfall !== undefined && rainfall !== null) {
      availableFactors.push('rainfall');
    } else {
      missingFactors.push('rainfall');
    }

    if (forecastRainfall !== undefined && forecastRainfall !== null) {
      availableFactors.push('forecast');
    } else {
      missingFactors.push('forecast');
    }

    if (slope !== undefined && slope !== null) {
      availableFactors.push('slope');
    } else {
      missingFactors.push('slope');
    }

    if (soilStability !== undefined && soilStability !== null) {
      availableFactors.push('soil');
    } else {
      missingFactors.push('soil');
    }

    if (seismicActivity !== undefined && seismicActivity !== null) {
      availableFactors.push('seismic');
    } else {
      missingFactors.push('seismic');
    }

    if (vegetation !== undefined && vegetation !== null) {
      availableFactors.push('vegetation');
    } else {
      missingFactors.push('vegetation');
    }

    // Normalize inputs
    const normalizedInputs = this.normalizeInputs({
      rainfall,
      forecastRainfall,
      slope,
      soilStability,
      seismicActivity,
      vegetation
    });

    // Calculate score
    const { score, contributions, totalWeight, missingWeight } = this.calculateScore(
      normalizedInputs,
      availableFactors
    );

    // Classify risk
    const riskLevel = this.classifyRisk(score);

    // Determine risk change
    let riskChange = 'STABLE';
    if (previousRiskLevel) {
      const levels = ['LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'EXTREME'];
      const prevIndex = levels.indexOf(previousRiskLevel);
      const currIndex = levels.indexOf(riskLevel);
      if (currIndex > prevIndex) riskChange = 'INCREASED';
      else if (currIndex < prevIndex) riskChange = 'DECREASED';
    }

    // Get top contributing factors
    const topFactors = this.getTopFactors(contributions);

    // Calculate confidence
    const confidence = this.calculateConfidence(availableFactors, rainfallFreshness);

    // Determine data freshness overall
    const dataFreshness = rainfallFreshness; // Primary indicator

    // Generate assessment ID
    const assessmentId = `ASSESS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      assessmentId,
      districtId,
      state,
      district,
      riskScore: score,
      riskLevel,
      riskChange,
      previousRiskLevel,
      confidence,
      dataFreshness,
      availableFactors,
      missingFactors,
      topFactors,
      version: this.version,
      timestamp: new Date().toISOString(),
      disclaimer: 'DEMONSTRATION MODEL - Not validated for operational use',
      methodology: 'Weighted heuristic scoring based on available environmental factors'
    };
  }
}

// Export singleton
module.exports = new RiskAssessmentCalculator();
