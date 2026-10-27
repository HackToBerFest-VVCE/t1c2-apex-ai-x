-- ============================================================================
-- SignalMesh AI - Database Schema Creation
-- ============================================================================
-- Purpose: Create disaster risk assessment schema and tables in Snowflake
-- Context: NATION/REGION from TPCH_SF1 provide geographic framework
-- Approach: Hybrid real (geographic) + synthetic (environmental features)
--
-- Instructions:
-- 1. Execute this entire script in Snowflake Worksheets
-- 2. Verify all objects created successfully
-- 3. Confirm 25 rows inserted into NATION_FEATURES
-- 4. Report completion status
-- ============================================================================

-- Set context
USE ROLE ACCOUNTADMIN;  -- If you don't have ACCOUNTADMIN, try PUBLIC role
USE WAREHOUSE SNOWFLAKE_LEARNING_WH;

-- ============================================================================
-- SECTION 1: Create Database and Schema
-- ============================================================================
-- Note: SNOWFLAKE_SAMPLE_DATA is typically read-only
-- We need a writable database for our disaster risk tables

CREATE DATABASE IF NOT EXISTS SIGNALMESH_AI
    COMMENT = 'SignalMesh AI - Disaster intelligence platform database';

USE DATABASE SIGNALMESH_AI;

-- Create schema for disaster risk data
CREATE SCHEMA IF NOT EXISTS DISASTER_RISK
    COMMENT = 'SignalMesh AI disaster risk assessment tables and views';

USE SCHEMA DISASTER_RISK;

-- ============================================================================
-- SECTION 2: Create NATION_FEATURES Table
-- ============================================================================
-- Stores environmental risk factors for each nation
-- Features are synthetic/demonstrative for hackathon prototype

CREATE OR REPLACE TABLE NATION_FEATURES (
    nation_key INTEGER PRIMARY KEY,
    nation_name VARCHAR(100) NOT NULL,
    region_name VARCHAR(100),
    
    -- Synthetic environmental risk factors (0-100 scale)
    precipitation_index FLOAT COMMENT 'Annual rainfall intensity (synthetic, 0-100)',
    terrain_slope_factor FLOAT COMMENT 'Average terrain slope steepness (synthetic, 0-100)',
    soil_stability_index FLOAT COMMENT 'Soil composition stability (synthetic, 0-100, lower = more unstable)',
    seismic_activity_level FLOAT COMMENT 'Earthquake frequency indicator (synthetic, 0-100)',
    vegetation_cover FLOAT COMMENT 'Forest/plant coverage (synthetic, 0-100, higher = more stable)',
    
    -- Derived data availability indicator
    customer_count INTEGER COMMENT 'Number of customers in TPCH data (proxy for population/data density)',
    
    -- Metadata
    data_source VARCHAR(50) DEFAULT 'SYNTHETIC_DEMO',
    created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    
    COMMENT 'Environmental risk factors per nation for landslide risk modeling'
);

-- ============================================================================
-- SECTION 3: Create RISK_ASSESSMENT Table
-- ============================================================================
-- Stores ML-generated risk scores and predictions

CREATE OR REPLACE TABLE RISK_ASSESSMENT (
    assessment_id INTEGER AUTOINCREMENT PRIMARY KEY,
    nation_key INTEGER NOT NULL,
    nation_name VARCHAR(100) NOT NULL,
    region_name VARCHAR(100),
    
    -- Risk assessment outputs
    risk_score FLOAT COMMENT 'ML-generated risk score (0-100)',
    risk_level VARCHAR(20) COMMENT 'LOW, MEDIUM, HIGH, or EXTREME',
    confidence_score FLOAT COMMENT 'Model confidence (0-1)',
    
    -- Feature importance for explainability
    top_risk_factor_1 VARCHAR(100),
    top_risk_factor_1_importance FLOAT,
    top_risk_factor_2 VARCHAR(100),
    top_risk_factor_2_importance FLOAT,
    top_risk_factor_3 VARCHAR(100),
    top_risk_factor_3_importance FLOAT,
    
    -- Metadata
    model_version VARCHAR(50) DEFAULT 'v1.0_random_forest',
    assessed_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
    
    COMMENT 'ML-generated landslide risk assessments per nation'
);

-- ============================================================================
-- SECTION 4: Populate NATION_FEATURES with Synthetic Data
-- ============================================================================
-- Insert synthetic environmental features for all 25 TPCH nations
-- Features are demonstrative and designed to create realistic risk variation

-- Approach: Generate features that correlate with general geographic knowledge
-- High-risk nations get: high precipitation, steep terrain, low soil stability
-- Low-risk nations get: moderate values across factors

INSERT INTO NATION_FEATURES (
    nation_key, 
    nation_name, 
    region_name,
    precipitation_index,
    terrain_slope_factor,
    soil_stability_index,
    seismic_activity_level,
    vegetation_cover,
    customer_count
)
SELECT 
    N.N_NATIONKEY,
    N.N_NAME,
    R.R_NAME,
    -- Synthetic environmental features (designed for demonstration)
    -- Using nation key and region to create varied but consistent values
    CASE 
        WHEN N.N_NAME IN ('INDIA', 'INDONESIA', 'VIETNAM', 'CHINA', 'JAPAN') 
        THEN 75 + (N.N_NATIONKEY % 20) -- High precipitation regions
        ELSE 40 + (N.N_NATIONKEY % 40)
    END AS precipitation_index,
    CASE 
        WHEN N.N_NAME IN ('PERU', 'ARGENTINA', 'INDIA', 'CHINA', 'JAPAN')
        THEN 70 + (N.N_NATIONKEY % 25) -- Mountainous regions
        ELSE 35 + (N.N_NATIONKEY % 45)
    END AS terrain_slope_factor,
    CASE 
        WHEN N.N_NAME IN ('INDIA', 'CHINA', 'INDONESIA', 'BRAZIL')
        THEN 30 + (N.N_NATIONKEY % 30) -- Lower soil stability (higher risk)
        ELSE 50 + (N.N_NATIONKEY % 40)
    END AS soil_stability_index,
    CASE 
        WHEN N.N_NAME IN ('JAPAN', 'INDONESIA', 'PERU', 'ARGENTINA')
        THEN 65 + (N.N_NATIONKEY % 30) -- High seismic activity
        ELSE 20 + (N.N_NATIONKEY % 40)
    END AS seismic_activity_level,
    CASE 
        WHEN N.N_NAME IN ('BRAZIL', 'CANADA', 'RUSSIA', 'ARGENTINA')
        THEN 70 + (N.N_NATIONKEY % 25) -- High forest cover (protective)
        ELSE 45 + (N.N_NATIONKEY % 35)
    END AS vegetation_cover,
    COALESCE(C.customer_count, 0) AS customer_count
FROM 
    SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.NATION N
    LEFT JOIN SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.REGION R 
        ON N.N_REGIONKEY = R.R_REGIONKEY
    LEFT JOIN (
        SELECT C_NATIONKEY, COUNT(*) AS customer_count
        FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.CUSTOMER
        GROUP BY C_NATIONKEY
    ) C ON N.N_NATIONKEY = C.C_NATIONKEY;

-- ============================================================================
-- SECTION 5: Verification Queries
-- ============================================================================

-- Verify schema created
SELECT 'Schema created: DISASTER_RISK' AS status;

-- Verify tables created
SHOW TABLES IN SCHEMA DISASTER_RISK;

-- Verify NATION_FEATURES populated
SELECT COUNT(*) AS total_nations FROM NATION_FEATURES;

-- Display sample data
SELECT 
    nation_name,
    region_name,
    precipitation_index,
    terrain_slope_factor,
    soil_stability_index,
    seismic_activity_level,
    vegetation_cover,
    customer_count
FROM NATION_FEATURES
ORDER BY nation_name
LIMIT 10;

-- Verify INDIA is present
SELECT * FROM NATION_FEATURES WHERE nation_name = 'INDIA';

-- Show nations with highest synthetic risk indicators
SELECT 
    nation_name,
    region_name,
    precipitation_index,
    terrain_slope_factor,
    100 - soil_stability_index AS soil_instability,
    seismic_activity_level
FROM NATION_FEATURES
ORDER BY 
    (precipitation_index + terrain_slope_factor + (100 - soil_stability_index) + seismic_activity_level) DESC
LIMIT 10;

-- ============================================================================
-- SECTION 6: Create View for Frontend Data Export
-- ============================================================================

CREATE OR REPLACE VIEW NATION_RISK_SUMMARY AS
SELECT 
    NF.nation_key,
    NF.nation_name,
    NF.region_name,
    NF.precipitation_index,
    NF.terrain_slope_factor,
    NF.soil_stability_index,
    NF.seismic_activity_level,
    NF.vegetation_cover,
    NF.customer_count,
    RA.risk_score,
    RA.risk_level,
    RA.confidence_score,
    RA.top_risk_factor_1,
    RA.top_risk_factor_1_importance,
    RA.top_risk_factor_2,
    RA.top_risk_factor_2_importance,
    RA.top_risk_factor_3,
    RA.top_risk_factor_3_importance
FROM NATION_FEATURES NF
LEFT JOIN RISK_ASSESSMENT RA 
    ON NF.nation_key = RA.nation_key
ORDER BY NF.nation_name;

-- ============================================================================
-- COMPLETION STATUS
-- ============================================================================

SELECT 'SignalMesh AI schema creation complete!' AS status,
       (SELECT COUNT(*) FROM NATION_FEATURES) AS nations_loaded,
       (SELECT COUNT(*) FROM RISK_ASSESSMENT) AS risk_assessments_loaded;

-- ============================================================================
-- NEXT STEPS
-- ============================================================================

/*
✅ Schema DISASTER_RISK created
✅ Table NATION_FEATURES created and populated with 25 nations
✅ Table RISK_ASSESSMENT created (empty, will be populated by ML model)
✅ View NATION_RISK_SUMMARY created for frontend data export

REPORT BACK:
1. Confirm "25 nations loaded" in final query result
2. Confirm INDIA is present in NATION_FEATURES
3. Note any errors or issues

NEXT PHASE:
Once confirmed, Python ML model development will begin to:
- Generate risk scores for all 25 nations
- Calculate feature importance for explainability
- Export INSERT statements to populate RISK_ASSESSMENT table
*/
