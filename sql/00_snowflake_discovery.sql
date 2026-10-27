-- ============================================================================
-- SignalMesh AI - Snowflake Data Discovery Script
-- ============================================================================
-- Purpose: Discover available datasets for disaster intelligence analysis
-- Focus: Environmental, geographic, weather, and hazard-related data
-- Target Use Case: Landslide and flood risk assessment
--
-- Instructions:
-- 1. Open this file in Snowflake Worksheets
-- 2. Set your role: USE ROLE ACCOUNTADMIN; (or PUBLIC)
-- 3. Set your warehouse: USE WAREHOUSE SNOWFLAKE_LEARNING_WH;
-- 4. Execute each section sequentially
-- 5. Review results to identify usable datasets
-- ============================================================================

-- ============================================================================
-- SECTION 1: Account and Session Context
-- ============================================================================
-- Verify current session configuration and available resources

-- Current session information
SELECT 
    CURRENT_ACCOUNT() AS account_name,
    CURRENT_REGION() AS region,
    CURRENT_USER() AS user_name,
    CURRENT_ROLE() AS active_role,
    CURRENT_WAREHOUSE() AS active_warehouse,
    CURRENT_DATABASE() AS active_database,
    CURRENT_SCHEMA() AS active_schema,
    CURRENT_VERSION() AS snowflake_version;

-- ============================================================================
-- SECTION 2: Available Databases Discovery
-- ============================================================================
-- List all databases visible to your current role

SHOW DATABASES;

-- Extract database information from SHOW result
SELECT 
    "name" AS database_name,
    "owner" AS owner,
    "comment" AS description
FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()))
ORDER BY "name";

-- ============================================================================
-- SECTION 3: Snowflake Sample Data Exploration
-- ============================================================================
-- Check if SNOWFLAKE_SAMPLE_DATA is accessible and explore its contents

-- Verify SNOWFLAKE_SAMPLE_DATA accessibility
SHOW DATABASES LIKE 'SNOWFLAKE_SAMPLE_DATA';

-- List all schemas in SNOWFLAKE_SAMPLE_DATA
SHOW SCHEMAS IN SNOWFLAKE_SAMPLE_DATA;

-- Extract schema information
SELECT 
    "name" AS schema_name,
    "database_name" AS database,
    "comment" AS description
FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()))
ORDER BY "name";

-- ============================================================================
-- SECTION 4: Sample Data Tables Discovery
-- ============================================================================
-- Explore tables in potentially relevant schemas

-- Check WEATHER schema (if exists - contains weather data)
SHOW TABLES IN SNOWFLAKE_SAMPLE_DATA.WEATHER;

-- Check TPCH_SF1 schema (general business data, may have geographic info)
SHOW TABLES IN SNOWFLAKE_SAMPLE_DATA.TPCH_SF1;

-- Check TPCDS_SF1 schema (decision support, may have regional data)
SHOW TABLES IN SNOWFLAKE_SAMPLE_DATA.TPCDS_SF1;

-- ============================================================================
-- SECTION 5: Weather Data Validation (If Available)
-- ============================================================================
-- The WEATHER schema may contain climate and precipitation data useful for
-- landslide and flood risk assessment

-- Sample weather data (if WEATHER schema exists)
-- Note: Adjust table name based on actual schema contents
SELECT *
FROM SNOWFLAKE_SAMPLE_DATA.WEATHER.DAILY_14_TOTAL
LIMIT 10;

-- Check weather data date range
SELECT 
    MIN(T) AS earliest_date,
    MAX(T) AS latest_date,
    COUNT(DISTINCT V02001) AS station_count,
    COUNT(*) AS total_records
FROM SNOWFLAKE_SAMPLE_DATA.WEATHER.DAILY_14_TOTAL
LIMIT 1;

-- Sample precipitation data
SELECT 
    T AS observation_date,
    V02001 AS station_id,
    V02002 AS latitude,
    V02003 AS longitude,
    V02005 AS elevation,
    V02046 AS precipitation_mm
FROM SNOWFLAKE_SAMPLE_DATA.WEATHER.DAILY_14_TOTAL
WHERE V02046 IS NOT NULL  -- Filter for records with precipitation data
LIMIT 20;

-- ============================================================================
-- SECTION 6: Geographic Data Discovery
-- ============================================================================
-- Check TPCH data for geographic information (nations, regions)

-- Nations table (may provide geographic reference points)
SELECT 
    N_NATIONKEY,
    N_NAME AS nation_name,
    N_REGIONKEY,
    N_COMMENT
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.NATION
ORDER BY N_NAME;

-- Regions table
SELECT 
    R_REGIONKEY,
    R_NAME AS region_name,
    R_COMMENT
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.REGION
ORDER BY R_NAME;

-- ============================================================================
-- SECTION 7: Additional Dataset Discovery
-- ============================================================================
-- Search for other potentially relevant databases and schemas

-- Look for databases with environmental, geographic, or hazard keywords
-- (This will show results from SHOW DATABASES earlier)
SELECT 
    "name" AS database_name,
    "comment" AS description
FROM TABLE(INFORMATION_SCHEMA.DATABASES)
WHERE LOWER("name") LIKE ANY ('%weather%', '%geo%', '%climate%', '%env%', '%hazard%', '%disaster%')
   OR LOWER("comment") LIKE ANY ('%weather%', '%geo%', '%climate%', '%environmental%');

-- ============================================================================
-- SECTION 8: Warehouse and Resource Check
-- ============================================================================
-- Verify compute resources available for data processing

SHOW WAREHOUSES;

-- Extract warehouse information
SELECT 
    "name" AS warehouse_name,
    "state" AS current_state,
    "size" AS warehouse_size,
    "type" AS warehouse_type,
    "auto_suspend" AS auto_suspend_seconds,
    "auto_resume" AS auto_resume_enabled
FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()))
ORDER BY "name";

-- ============================================================================
-- SECTION 9: Snowflake Marketplace Check (Manual)
-- ============================================================================
-- NOTE: These queries check for shared databases that might be from Marketplace
-- To browse available disaster/environmental datasets in Snowflake Marketplace:
-- 1. Navigate to Data > Marketplace in Snowflake UI
-- 2. Search for: "weather", "climate", "environmental", "disaster", "NOAA", "USGS"
-- 3. Look for free or trial datasets related to:
--    - Weather and precipitation data
--    - Elevation and terrain data (USGS, NASA)
--    - Historical disaster records
--    - Geological survey data

-- Check for any shared databases (may indicate Marketplace installs)
SELECT 
    DATABASE_NAME,
    DATABASE_OWNER,
    COMMENT
FROM INFORMATION_SCHEMA.DATABASES
WHERE IS_TRANSIENT = 'NO'
ORDER BY DATABASE_NAME;

-- ============================================================================
-- SECTION 10: Data Assessment Summary
-- ============================================================================
-- Summarize findings for SignalMesh AI planning

-- Weather Data Assessment
SELECT 
    'WEATHER_DATA' AS dataset_type,
    COUNT(*) AS sample_record_count,
    MIN(T) AS earliest_record,
    MAX(T) AS latest_record
FROM SNOWFLAKE_SAMPLE_DATA.WEATHER.DAILY_14_TOTAL
UNION ALL
SELECT 
    'GEOGRAPHIC_NATIONS' AS dataset_type,
    COUNT(*) AS sample_record_count,
    NULL AS earliest_record,
    NULL AS latest_record
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.NATION;

-- ============================================================================
-- DISCOVERY SCRIPT COMPLETE
-- ============================================================================

-- NEXT STEPS:
-- 1. Review the results from each section
-- 2. Identify which datasets contain usable data for disaster risk analysis
-- 3. Note any missing data types (e.g., elevation, historical hazards, soil data)
-- 4. Check Snowflake Marketplace for additional free datasets if needed
-- 5. Document available data sources for ML feature engineering

-- KEY QUESTIONS TO ANSWER:
-- ✓ Is weather/precipitation data available? (Critical for landslide/flood risk)
-- ✓ Is geographic/location data available? (Needed for risk mapping)
-- ✓ What is the temporal coverage of available data?
-- ✓ What is the geographic coverage of available data?
-- ✓ Are there any pre-existing environmental or hazard datasets?

-- LIMITATIONS TO NOTE:
-- • SNOWFLAKE_SAMPLE_DATA may not contain disaster-specific historical events
-- • Elevation/terrain data may not be included in sample datasets
-- • Soil composition data likely not available
-- • Historical landslide/flood records probably not included
-- • May need to supplement with synthetic data or Marketplace sources

-- FOR SIGNALMESH AI DEVELOPMENT:
-- If comprehensive disaster data is unavailable:
-- • Option 1: Use weather + geographic data to build a demonstrative model
-- • Option 2: Generate synthetic training data based on known risk factors
-- • Option 3: Acquire free datasets from Snowflake Marketplace
-- • Option 4: Use available data to demonstrate the platform architecture
--           and show how real disaster data would be integrated
