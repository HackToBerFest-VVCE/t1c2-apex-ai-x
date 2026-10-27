"""
SignalMesh AI - Export Risk Assessments to Snowflake
Generates SQL INSERT statements for RISK_ASSESSMENT table
Does NOT execute SQL - requires manual execution in Snowflake Worksheets
"""

import pandas as pd
from datetime import datetime


def generate_insert_sql(predictions, output_file='output/risk_assessment_insert.sql'):
    """
    Generate SQL INSERT statements for RISK_ASSESSMENT table.
    
    Args:
        predictions: DataFrame with risk assessment results
        output_file: Path to output SQL file
        
    Returns:
        str: Path to generated SQL file
    """
    
    # Validate predictions
    required_cols = [
        'nation_key', 'nation_name', 'region_name', 
        'risk_score', 'risk_level', 'confidence_score',
        'top_risk_factor_1', 'top_risk_factor_1_importance',
        'top_risk_factor_2', 'top_risk_factor_2_importance',
        'top_risk_factor_3', 'top_risk_factor_3_importance',
        'model_version'
    ]
    
    missing = [col for col in required_cols if col not in predictions.columns]
    assert not missing, f"Missing required columns: {missing}"
    
    # Open SQL file
    with open(output_file, 'w') as f:
        f.write("-- ========================================================================\n")
        f.write("-- SignalMesh AI - Risk Assessment Data Load\n")
        f.write("-- ========================================================================\n")
        f.write("-- Generated: {}\n".format(datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
        f.write("-- Total Records: {}\n".format(len(predictions)))
        f.write("--\n")
        f.write("-- INSTRUCTIONS:\n")
        f.write("-- 1. Open Snowflake Worksheets\n")
        f.write("-- 2. Set context:\n")
        f.write("--    USE ROLE ACCOUNTADMIN;\n")
        f.write("--    USE WAREHOUSE SNOWFLAKE_LEARNING_WH;\n")
        f.write("--    USE DATABASE SIGNALMESH_AI;\n")
        f.write("--    USE SCHEMA DISASTER_RISK;\n")
        f.write("-- 3. Execute this entire script\n")
        f.write("-- 4. Verify 25 rows inserted\n")
        f.write("--\n")
        f.write("-- SAFETY: This script checks for existing data before inserting\n")
        f.write("-- to avoid duplicates. Safe to re-run.\n")
        f.write("-- ========================================================================\n\n")
        
        # Set context
        f.write("-- Set context\n")
        f.write("USE ROLE ACCOUNTADMIN;\n")
        f.write("USE WAREHOUSE SNOWFLAKE_LEARNING_WH;\n")
        f.write("USE DATABASE SIGNALMESH_AI;\n")
        f.write("USE SCHEMA DISASTER_RISK;\n\n")
        
        # Check for existing data
        f.write("-- ========================================================================\n")
        f.write("-- SECTION 1: Check for existing risk assessments\n")
        f.write("-- ========================================================================\n")
        f.write("SELECT COUNT(*) AS existing_assessments FROM RISK_ASSESSMENT;\n\n")
        f.write("-- If count > 0, you may want to delete existing records first:\n")
        f.write("-- DELETE FROM RISK_ASSESSMENT WHERE model_version = 'v1.0_random_forest';\n\n")
        
        # Begin transaction
        f.write("-- ========================================================================\n")
        f.write("-- SECTION 2: Insert risk assessment data\n")
        f.write("-- ========================================================================\n")
        f.write("-- Using MERGE to avoid duplicates on nation_key\n\n")
        
        f.write("BEGIN TRANSACTION;\n\n")
        
        # Create temporary table for staging
        f.write("-- Create temporary staging table\n")
        f.write("CREATE TEMPORARY TABLE risk_assessment_staging (\n")
        f.write("    nation_key INTEGER,\n")
        f.write("    nation_name VARCHAR(100),\n")
        f.write("    region_name VARCHAR(100),\n")
        f.write("    risk_score FLOAT,\n")
        f.write("    risk_level VARCHAR(20),\n")
        f.write("    confidence_score FLOAT,\n")
        f.write("    top_risk_factor_1 VARCHAR(100),\n")
        f.write("    top_risk_factor_1_importance FLOAT,\n")
        f.write("    top_risk_factor_2 VARCHAR(100),\n")
        f.write("    top_risk_factor_2_importance FLOAT,\n")
        f.write("    top_risk_factor_3 VARCHAR(100),\n")
        f.write("    top_risk_factor_3_importance FLOAT,\n")
        f.write("    model_version VARCHAR(50)\n")
        f.write(");\n\n")
        
        # Insert data into staging table
        f.write("-- Insert data into staging table\n")
        for idx, row in predictions.iterrows():
            f.write("INSERT INTO risk_assessment_staging VALUES (\n")
            f.write(f"    {row['nation_key']},\n")
            f.write(f"    '{row['nation_name']}',\n")
            f.write(f"    '{row['region_name']}',\n")
            f.write(f"    {row['risk_score']},\n")
            f.write(f"    '{row['risk_level']}',\n")
            f.write(f"    {row['confidence_score']},\n")
            f.write(f"    '{row['top_risk_factor_1']}',\n")
            f.write(f"    {row['top_risk_factor_1_importance']},\n")
            f.write(f"    '{row['top_risk_factor_2']}',\n")
            f.write(f"    {row['top_risk_factor_2_importance']},\n")
            f.write(f"    '{row['top_risk_factor_3']}',\n")
            f.write(f"    {row['top_risk_factor_3_importance']},\n")
            f.write(f"    '{row['model_version']}'\n")
            f.write(");\n")
        
        f.write("\n")
        
        # Merge staging into target
        f.write("-- Merge staging data into RISK_ASSESSMENT table\n")
        f.write("-- This avoids duplicates by updating existing nation_key records\n")
        f.write("MERGE INTO RISK_ASSESSMENT AS target\n")
        f.write("USING risk_assessment_staging AS source\n")
        f.write("ON target.nation_key = source.nation_key\n")
        f.write("WHEN MATCHED THEN\n")
        f.write("    UPDATE SET\n")
        f.write("        nation_name = source.nation_name,\n")
        f.write("        region_name = source.region_name,\n")
        f.write("        risk_score = source.risk_score,\n")
        f.write("        risk_level = source.risk_level,\n")
        f.write("        confidence_score = source.confidence_score,\n")
        f.write("        top_risk_factor_1 = source.top_risk_factor_1,\n")
        f.write("        top_risk_factor_1_importance = source.top_risk_factor_1_importance,\n")
        f.write("        top_risk_factor_2 = source.top_risk_factor_2,\n")
        f.write("        top_risk_factor_2_importance = source.top_risk_factor_2_importance,\n")
        f.write("        top_risk_factor_3 = source.top_risk_factor_3,\n")
        f.write("        top_risk_factor_3_importance = source.top_risk_factor_3_importance,\n")
        f.write("        model_version = source.model_version,\n")
        f.write("        assessed_at = CURRENT_TIMESTAMP()\n")
        f.write("WHEN NOT MATCHED THEN\n")
        f.write("    INSERT (\n")
        f.write("        nation_key, nation_name, region_name,\n")
        f.write("        risk_score, risk_level, confidence_score,\n")
        f.write("        top_risk_factor_1, top_risk_factor_1_importance,\n")
        f.write("        top_risk_factor_2, top_risk_factor_2_importance,\n")
        f.write("        top_risk_factor_3, top_risk_factor_3_importance,\n")
        f.write("        model_version\n")
        f.write("    ) VALUES (\n")
        f.write("        source.nation_key, source.nation_name, source.region_name,\n")
        f.write("        source.risk_score, source.risk_level, source.confidence_score,\n")
        f.write("        source.top_risk_factor_1, source.top_risk_factor_1_importance,\n")
        f.write("        source.top_risk_factor_2, source.top_risk_factor_2_importance,\n")
        f.write("        source.top_risk_factor_3, source.top_risk_factor_3_importance,\n")
        f.write("        source.model_version\n")
        f.write("    );\n\n")
        
        f.write("COMMIT;\n\n")
        
        # Verification queries
        f.write("-- ========================================================================\n")
        f.write("-- SECTION 3: Verification Queries\n")
        f.write("-- ========================================================================\n\n")
        
        f.write("-- Count total assessments\n")
        f.write("SELECT COUNT(*) AS total_assessments FROM RISK_ASSESSMENT;\n\n")
        
        f.write("-- Verify INDIA is present\n")
        f.write("SELECT * FROM RISK_ASSESSMENT WHERE nation_name = 'INDIA';\n\n")
        
        f.write("-- Risk level distribution\n")
        f.write("SELECT risk_level, COUNT(*) AS nation_count\n")
        f.write("FROM RISK_ASSESSMENT\n")
        f.write("GROUP BY risk_level\n")
        f.write("ORDER BY risk_level;\n\n")
        
        f.write("-- Top 10 highest risk nations\n")
        f.write("SELECT nation_name, region_name, risk_score, risk_level\n")
        f.write("FROM RISK_ASSESSMENT\n")
        f.write("ORDER BY risk_score DESC\n")
        f.write("LIMIT 10;\n\n")
        
        f.write("-- Sample complete record\n")
        f.write("SELECT *\n")
        f.write("FROM RISK_ASSESSMENT\n")
        f.write("LIMIT 5;\n\n")
        
        f.write("-- ========================================================================\n")
        f.write("-- COMPLETION\n")
        f.write("-- ========================================================================\n")
        f.write("-- ✅ Expected result: 25 risk assessments loaded\n")
        f.write("-- ✅ INDIA should be present in results\n")
        f.write("-- ✅ Risk levels should be: LOW, MEDIUM, HIGH, or EXTREME\n")
        f.write("-- ✅ Risk scores should be between 0 and 100\n")
        f.write("--\n")
        f.write("-- NEXT STEP: Confirm results and proceed to Phase 3 (React frontend)\n")
        f.write("-- ========================================================================\n")
    
    return output_file


if __name__ == '__main__':
    from synthetic_data import generate_synthetic_nation_features
    from risk_model import LandslideRiskModel, RANDOM_SEED
    
    print("SignalMesh AI - Export to Snowflake")
    print("=" * 60)
    
    # Load and prepare data
    print("\n1. Loading synthetic nation features...")
    df = generate_synthetic_nation_features()
    
    # Train and predict
    print("2. Training model and generating predictions...")
    model = LandslideRiskModel(random_state=RANDOM_SEED)
    model.train(df)
    predictions = model.predict(df)
    
    # Generate SQL
    print("3. Generating SQL INSERT statements...")
    sql_file = generate_insert_sql(predictions)
    
    print(f"\n✅ SQL file generated: {sql_file}")
    print(f"✅ Contains INSERT statements for {len(predictions)} nations")
    print(f"✅ INDIA included: {'INDIA' in predictions['nation_name'].values}")
    print("\n" + "=" * 60)
    print("NEXT STEP:")
    print("1. Open Snowflake Worksheets")
    print(f"2. Execute {sql_file}")
    print("3. Verify 25 rows inserted")
    print("4. Confirm INDIA risk assessment present")
    print("=" * 60)
