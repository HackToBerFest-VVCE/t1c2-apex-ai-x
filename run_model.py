#!/usr/bin/env python3
"""
SignalMesh AI - Run Complete ML Pipeline
Generates risk assessments and exports to CSV and SQL
"""

import os
import sys

# Add ml directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ml'))

from ml.synthetic_data import generate_synthetic_nation_features, validate_features
from ml.risk_model import LandslideRiskModel, validate_predictions, RANDOM_SEED
from ml.export_to_snowflake import generate_insert_sql


def main():
    """Run complete ML pipeline."""
    
    print("=" * 70)
    print("SignalMesh AI - Landslide Risk Assessment Pipeline")
    print("=" * 70)
    print("DISCLAIMER: Demonstration model using synthetic environmental features")
    print("Not for real-world landslide risk prediction")
    print("=" * 70)
    
    # Create output directory
    os.makedirs('output', exist_ok=True)
    
    # Step 1: Load synthetic data
    print("\n[Step 1/6] Loading synthetic nation features...")
    df = generate_synthetic_nation_features()
    feature_validation = validate_features(df)
    
    if feature_validation['all_valid']:
        print(f"  ✅ Loaded {feature_validation['total_nations']} nations")
        print(f"  ✅ INDIA present: {feature_validation['india_present']}")
    else:
        print(f"  ❌ Feature validation failed")
        return 1
    
    # Step 2: Train model
    print("\n[Step 2/6] Training Random Forest risk model...")
    model = LandslideRiskModel(random_state=RANDOM_SEED)
    metrics = model.train(df)
    print(f"  ✅ Model trained on {metrics['n_samples']} samples")
    print(f"  ✅ MAE: {metrics['mae']:.2f}, RMSE: {metrics['rmse']:.2f}")
    
    # Step 3: Feature importance
    print("\n[Step 3/6] Extracting feature importance for explainability...")
    feature_imp = model.get_feature_importance()
    print("  Top 3 risk factors:")
    for i, row in feature_imp.head(3).iterrows():
        print(f"    {i+1}. {row['feature']}: {row['importance']:.3f}")
    
    # Step 4: Generate predictions
    print("\n[Step 4/6] Generating risk assessments for all nations...")
    predictions = model.predict(df)
    
    prediction_validation = validate_predictions(predictions)
    if prediction_validation['all_valid']:
        print(f"  ✅ Generated {prediction_validation['total_records']} risk assessments")
        print(f"  ✅ INDIA present: {prediction_validation['india_present']}")
        print(f"  ✅ All validations passed")
    else:
        print(f"  ❌ Prediction validation failed")
        return 1
    
    # Step 5: Export to CSV
    print("\n[Step 5/6] Exporting results to CSV...")
    csv_file = 'output/risk_assessments.csv'
    predictions.to_csv(csv_file, index=False)
    print(f"  ✅ Saved to: {csv_file}")
    
    # Step 6: Generate SQL for Snowflake
    print("\n[Step 6/6] Generating SQL INSERT statements for Snowflake...")
    sql_file = generate_insert_sql(predictions)
    print(f"  ✅ Saved to: {sql_file}")
    
    # Summary
    print("\n" + "=" * 70)
    print("PIPELINE COMPLETE")
    print("=" * 70)
    
    # Risk level distribution
    print("\nRisk Level Distribution:")
    risk_dist = predictions['risk_level'].value_counts().sort_index()
    for level, count in risk_dist.items():
        print(f"  {level}: {count} nations")
    
    # Top 5 highest risk
    print("\nTop 5 Highest Risk Nations:")
    top5 = predictions.nlargest(5, 'risk_score')[['nation_name', 'risk_score', 'risk_level']]
    for _, row in top5.iterrows():
        print(f"  - {row['nation_name']}: {row['risk_score']:.1f} ({row['risk_level']})")
    
    # INDIA specific
    india = predictions[predictions['nation_name'] == 'INDIA'].iloc[0]
    print(f"\n✅ INDIA Risk Assessment:")
    print(f"  - Risk Score: {india['risk_score']:.1f}")
    print(f"  - Risk Level: {india['risk_level']}")
    print(f"  - Confidence: {india['confidence_score']:.2f}")
    print(f"  - Top Factor: {india['top_risk_factor_1']}")
    
    # Output files
    print("\n" + "=" * 70)
    print("OUTPUT FILES:")
    print("=" * 70)
    print(f"1. CSV: {csv_file}")
    print(f"2. SQL: {sql_file}")
    
    print("\n" + "=" * 70)
    print("NEXT STEP:")
    print("=" * 70)
    print("Execute the SQL file in Snowflake Worksheets:")
    print(f"1. Open {sql_file}")
    print("2. Copy entire contents")
    print("3. Paste into Snowflake Worksheets")
    print("4. Execute script")
    print("5. Verify 25 rows inserted")
    print("=" * 70)
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
