"""
SignalMesh AI - Landslide Risk Assessment Model
Demonstration ML model using synthetic environmental features
DISCLAIMER: This is a demonstration model for architecture purposes only.
Risk scores are based on synthetic data and do not represent real-world accuracy.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')


# Reproducible random seed
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)


class LandslideRiskModel:
    """
    Demonstration landslide risk assessment model.
    
    Uses RandomForestRegressor to predict risk scores from environmental features.
    Provides feature importance for explainability.
    
    DISCLAIMER: Synthetic demonstration model - not for real-world predictions.
    """
    
    def __init__(self, random_state=RANDOM_SEED):
        """Initialize model with reproducible random state."""
        self.random_state = random_state
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = [
            'precipitation_index',
            'terrain_slope_factor',
            'soil_stability_index',
            'seismic_activity_level',
            'vegetation_cover'
        ]
        self.feature_importance = None
        
    def _compute_synthetic_risk_targets(self, df):
        """
        Compute synthetic risk targets based on environmental factors.
        
        Higher risk when:
        - High precipitation (triggers landslides)
        - Steep terrain (gravitational force)
        - Low soil stability (weak soil)
        - High seismic activity (earthquakes trigger landslides)
        - Low vegetation (roots stabilize soil)
        
        Args:
            df: DataFrame with environmental features
            
        Returns:
            np.array: Synthetic risk scores (0-100)
        """
        # Weights for each factor (demonstrative, not validated)
        weights = {
            'precipitation_index': 0.25,       # High precipitation = high risk
            'terrain_slope_factor': 0.30,      # Steep slopes = high risk
            'soil_instability': 0.25,          # Low stability = high risk
            'seismic_activity_level': 0.15,    # High seismic = high risk
            'vegetation_penalty': 0.05         # Low vegetation = high risk
        }
        
        # Calculate risk components
        precip_risk = df['precipitation_index'] * weights['precipitation_index']
        terrain_risk = df['terrain_slope_factor'] * weights['terrain_slope_factor']
        
        # Invert soil stability (low stability = high risk)
        soil_risk = (100 - df['soil_stability_index']) * weights['soil_instability']
        
        seismic_risk = df['seismic_activity_level'] * weights['seismic_activity_level']
        
        # Invert vegetation (low vegetation = high risk)
        veg_risk = (100 - df['vegetation_cover']) * weights['vegetation_penalty']
        
        # Combine all risk factors
        total_risk = precip_risk + terrain_risk + soil_risk + seismic_risk + veg_risk
        
        # Add small random noise for variation (reproducible with seed)
        noise = np.random.normal(0, 3, size=len(df))
        total_risk = total_risk + noise
        
        # Clip to 0-100 range
        total_risk = np.clip(total_risk, 0, 100)
        
        return total_risk.values
    
    def train(self, df):
        """
        Train the risk assessment model on synthetic data.
        
        Args:
            df: DataFrame with environmental features
            
        Returns:
            dict: Training metrics
        """
        # Validate input
        assert all(col in df.columns for col in self.feature_names), \
            f"Missing required features: {self.feature_names}"
        
        # Extract features
        X = df[self.feature_names].values
        
        # Generate synthetic risk targets
        y = self._compute_synthetic_risk_targets(df)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Random Forest Regressor
        # n_estimators=100 for good performance, max_depth=10 to prevent overfitting
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=2,
            min_samples_leaf=1,
            random_state=self.random_state,
            n_jobs=-1
        )
        
        self.model.fit(X_scaled, y)
        
        # Extract feature importance
        self.feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        # Calculate training metrics
        train_predictions = self.model.predict(X_scaled)
        mae = np.mean(np.abs(train_predictions - y))
        rmse = np.sqrt(np.mean((train_predictions - y) ** 2))
        
        metrics = {
            'mae': mae,
            'rmse': rmse,
            'n_samples': len(df),
            'n_features': len(self.feature_names)
        }
        
        return metrics
    
    def predict(self, df):
        """
        Predict risk scores for nations.
        
        Args:
            df: DataFrame with environmental features
            
        Returns:
            pd.DataFrame: Predictions with risk scores and levels
        """
        assert self.model is not None, "Model must be trained before prediction"
        
        # Validate input
        assert all(col in df.columns for col in self.feature_names), \
            f"Missing required features: {self.feature_names}"
        
        # Extract and scale features
        X = df[self.feature_names].values
        X_scaled = self.scaler.transform(X)
        
        # Predict risk scores
        risk_scores = self.model.predict(X_scaled)
        
        # Clip to 0-100 range
        risk_scores = np.clip(risk_scores, 0, 100)
        
        # Assign risk levels based on thresholds
        risk_levels = pd.cut(
            risk_scores,
            bins=[0, 25, 50, 75, 100],
            labels=['LOW', 'MEDIUM', 'HIGH', 'EXTREME'],
            include_lowest=True
        )
        
        # Calculate confidence score
        # DISCLAIMER: This is a demonstration heuristic, not a calibrated uncertainty estimate
        # Uses variance across ensemble trees as a proxy for prediction uncertainty
        # Lower variance = higher confidence, but this is NOT statistically calibrated
        tree_predictions = np.array([tree.predict(X_scaled) for tree in self.model.estimators_])
        prediction_std = np.std(tree_predictions, axis=0)
        # Convert to 0-1 scale (uncalibrated demonstration metric)
        confidence = 1 - np.clip(prediction_std / 50, 0, 1)
        
        # Create results dataframe
        results = df[['nation_key', 'nation_name', 'region_name']].copy()
        results['risk_score'] = risk_scores.round(2)
        results['risk_level'] = risk_levels
        results['confidence_score'] = confidence.round(3)
        
        # Add top 3 global feature importances
        # NOTE: These are GLOBAL importance weights from the Random Forest model,
        # NOT nation-specific explanations. All nations show the same top factors.
        # This demonstrates which features the model considers most important overall.
        top_3 = self.feature_importance.head(3)
        
        results['top_risk_factor_1'] = top_3.iloc[0]['feature']
        results['top_risk_factor_1_importance'] = round(top_3.iloc[0]['importance'], 3)
        results['top_risk_factor_2'] = top_3.iloc[1]['feature']
        results['top_risk_factor_2_importance'] = round(top_3.iloc[1]['importance'], 3)
        results['top_risk_factor_3'] = top_3.iloc[2]['feature']
        results['top_risk_factor_3_importance'] = round(top_3.iloc[2]['importance'], 3)
        
        results['model_version'] = 'v1.0_random_forest'
        
        return results
    
    def get_feature_importance(self):
        """Get feature importance for explainability."""
        assert self.feature_importance is not None, "Model must be trained first"
        return self.feature_importance


def validate_predictions(predictions):
    """
    Validate prediction results meet requirements.
    
    Args:
        predictions: DataFrame with predictions
        
    Returns:
        dict: Validation results
    """
    validation = {
        'total_records': len(predictions),
        'unique_nations': predictions['nation_key'].nunique(),
        'india_present': 'INDIA' in predictions['nation_name'].values,
        'risk_scores_valid': (
            (predictions['risk_score'] >= 0).all() and 
            (predictions['risk_score'] <= 100).all()
        ),
        'risk_levels_valid': predictions['risk_level'].isin(['LOW', 'MEDIUM', 'HIGH', 'EXTREME']).all(),
        'confidence_valid': (
            (predictions['confidence_score'] >= 0).all() and 
            (predictions['confidence_score'] <= 1).all()
        ),
        'no_missing_values': not predictions.isnull().any().any()
    }
    
    validation['all_valid'] = all([
        validation['total_records'] == 25,
        validation['unique_nations'] == 25,
        validation['india_present'],
        validation['risk_scores_valid'],
        validation['risk_levels_valid'],
        validation['confidence_valid'],
        validation['no_missing_values']
    ])
    
    return validation


if __name__ == '__main__':
    from synthetic_data import generate_synthetic_nation_features
    
    print("SignalMesh AI - Risk Assessment Model")
    print("=" * 60)
    print("DISCLAIMER: Demonstration model using synthetic data")
    print("Not for real-world landslide risk prediction")
    print("=" * 60)
    
    # Load synthetic data
    print("\n1. Loading synthetic nation features...")
    df = generate_synthetic_nation_features()
    print(f"   ✅ Loaded {len(df)} nations")
    
    # Train model
    print("\n2. Training Random Forest risk model...")
    model = LandslideRiskModel(random_state=RANDOM_SEED)
    metrics = model.train(df)
    print(f"   ✅ Model trained")
    print(f"   - Samples: {metrics['n_samples']}")
    print(f"   - Features: {metrics['n_features']}")
    print(f"   - MAE: {metrics['mae']:.2f}")
    print(f"   - RMSE: {metrics['rmse']:.2f}")
    
    # Feature importance
    print("\n3. Feature importance (explainability):")
    feature_imp = model.get_feature_importance()
    for _, row in feature_imp.iterrows():
        print(f"   - {row['feature']}: {row['importance']:.3f}")
    
    # Predict risk scores
    print("\n4. Generating risk assessments for all nations...")
    predictions = model.predict(df)
    
    # Validate predictions
    validation = validate_predictions(predictions)
    print(f"\n5. Validation results:")
    print(f"   ✅ Total records: {validation['total_records']}")
    print(f"   ✅ Unique nations: {validation['unique_nations']}")
    print(f"   ✅ INDIA present: {validation['india_present']}")
    print(f"   ✅ Risk scores valid (0-100): {validation['risk_scores_valid']}")
    print(f"   ✅ Risk levels valid: {validation['risk_levels_valid']}")
    print(f"   ✅ Confidence scores valid: {validation['confidence_valid']}")
    print(f"   ✅ No missing values: {validation['no_missing_values']}")
    
    if validation['all_valid']:
        print(f"\n   ✅ All validations passed")
    else:
        print(f"\n   ⚠️ Some validations failed")
    
    # Display sample predictions
    print("\n6. Sample predictions:")
    print(predictions[['nation_name', 'risk_score', 'risk_level', 'confidence_score']].head(10))
    
    # Show INDIA specifically
    print("\n7. ✅ INDIA risk assessment:")
    india = predictions[predictions['nation_name'] == 'INDIA']
    print(india[['nation_name', 'region_name', 'risk_score', 'risk_level', 
                  'confidence_score', 'top_risk_factor_1', 'top_risk_factor_2']])
    
    # Risk level distribution
    print("\n8. Risk level distribution:")
    print(predictions['risk_level'].value_counts().sort_index())
