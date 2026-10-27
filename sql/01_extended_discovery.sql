-- ============================================================================
-- SignalMesh AI - Extended Database Discovery
-- ============================================================================
-- Purpose: Search for disaster-relevant datasets across all accessible databases
-- Context: TPCH_SF1.NATION and REGION confirmed accessible (25 countries, 5 regions)
-- Target: Find weather, climate, terrain, geographic, or hazard-related data
--
-- Instructions:
-- Execute each section separately in Snowflake Worksheets
-- Review results before proceeding to the next section
-- Report findings after each section
-- ============================================================================

-- ============================================================================
-- SECTION 1: Complete Database Inventory
-- ============================================================================
-- List ALL databases accessible to your current role
-- This may include sample data, shared databases, and Marketplace datasets

SHOW DATABASES;

-- Extract and categorize database names
SELECT 
    "name" AS database_name,
    "owner" AS owner,
    "origin" AS origin,
    "comment" AS description,
    CASE 
        WHEN LOWER("name") LIKE '%weather%' THEN 'WEATHER_RELATED'
        WHEN LOWER("name") LIKE '%climate%' THEN 'CLIMATE_RELATED'
        WHEN LOWER("name") LIKE '%geo%' THEN 'GEOGRAPHIC_RELATED'
        WHEN LOWER("name") LIKE '%env%' THEN 'ENVIRONMENTAL_RELATED'
        WHEN LOWER("name") LIKE '%hazard%' OR LOWER("name") LIKE '%disaster%' THEN 'HAZARD_RELATED'
        WHEN LOWER("name") LIKE '%noaa%' THEN 'NOAA_DATA'
        WHEN LOWER("name") LIKE '%usgs%' THEN 'USGS_DATA'
        WHEN LOWER("name") LIKE '%open%street%' THEN 'MAPPING_DATA'
        WHEN LOWER("name") LIKE '%sample%' THEN 'SAMPLE_DATA'
        ELSE 'OTHER'
    END AS category
FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()))
ORDER BY category, "name";

-- ⚠️ STOP HERE ⚠️
-- REVIEW: Note all database names, especially any in categories other than 'OTHER' or 'SAMPLE_DATA'
-- ACTION: If you see databases with relevant keywords, note them for Section 2

-- ============================================================================
-- SECTION 2: Search for Disaster-Relevant Keywords in Database Comments
-- ============================================================================
-- Check if any database descriptions mention relevant keywords

SELECT 
    "name" AS database_name,
    "comment" AS description,
    'KEYWORD_MATCH' AS match_reason
FROM TABLE(INFORMATION_SCHEMA.DATABASES)
WHERE 
    LOWER(COALESCE("comment", '')) LIKE '%weather%'
    OR LOWER(COALESCE("comment", '')) LIKE '%climate%'
    OR LOWER(COALESCE("comment", '')) LIKE '%precipitation%'
    OR LOWER(COALESCE("comment", '')) LIKE '%rain%'
    OR LOWER(COALESCE("comment", '')) LIKE '%temperature%'
    OR LOWER(COALESCE("comment", '')) LIKE '%geographic%'
    OR LOWER(COALESCE("comment", '')) LIKE '%terrain%'
    OR LOWER(COALESCE("comment", '')) LIKE '%elevation%'
    OR LOWER(COALESCE("comment", '')) LIKE '%hazard%'
    OR LOWER(COALESCE("comment", '')) LIKE '%disaster%'
    OR LOWER(COALESCE("comment", '')) LIKE '%flood%'
    OR LOWER(COALESCE("comment", '')) LIKE '%landslide%'
    OR LOWER(COALESCE("comment", '')) LIKE '%environmental%';

-- If this returns NO ROWS: No database descriptions match disaster keywords
-- If this returns ROWS: Investigate those databases in Section 3

-- ============================================================================
-- SECTION 3: Explore Discovered Databases (CONDITIONAL)
-- ============================================================================
-- ⚠️ ONLY RUN THIS SECTION if Section 1 or 2 found relevant databases
-- Replace <DATABASE_NAME> with actual database names from Section 1/2

-- Example: If you found a database called "WEATHER_DATA" in Section 1:
-- SHOW SCHEMAS IN WEATHER_DATA;
--
-- SELECT "name" AS schema_name
-- FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()))
-- ORDER BY "name";

-- Template for exploring discovered databases:
-- SHOW SCHEMAS IN <DATABASE_NAME>;
-- 
-- SELECT 
--     "name" AS schema_name,
--     "database_name" AS database
-- FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()))
-- ORDER BY "name";

-- ============================================================================
-- SECTION 4: Search TPCH and TPCDS Schemas for Useful Geographic Data
-- ============================================================================
-- Check if TPCH/TPCDS schemas contain any additional location-related tables

-- 4A: List all tables in TPCH_SF1 to identify potential geographic/location data
SHOW TABLES IN SNOWFLAKE_SAMPLE_DATA.TPCH_SF1;

SELECT 
    "name" AS table_name,
    "rows" AS approx_rows,
    "comment" AS description,
    CASE 
        WHEN LOWER("name") LIKE '%nation%' THEN 'GEOGRAPHIC'
        WHEN LOWER("name") LIKE '%region%' THEN 'GEOGRAPHIC'
        WHEN LOWER("name") LIKE '%location%' THEN 'GEOGRAPHIC'
        WHEN LOWER("name") LIKE '%address%' THEN 'LOCATION_INFO'
        WHEN LOWER("name") LIKE '%customer%' THEN 'HAS_LOCATION_FK'
        WHEN LOWER("name") LIKE '%supplier%' THEN 'HAS_LOCATION_FK'
        ELSE 'BUSINESS_DATA'
    END AS data_category
FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()))
ORDER BY data_category, "name";

-- 4B: Check TPCDS_SF1 schema (if it exists)
-- SHOW TABLES IN SNOWFLAKE_SAMPLE_DATA.TPCDS_SF1;
-- 
-- SELECT 
--     "name" AS table_name,
--     "rows" AS approx_rows
-- FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()))
-- WHERE LOWER("name") LIKE '%location%'
--    OR LOWER("name") LIKE '%address%'
--    OR LOWER("name") LIKE '%geo%'
--    OR LOWER("name") LIKE '%region%'
-- ORDER BY "name";

-- ============================================================================
-- SECTION 5: Sample CUSTOMER and SUPPLIER for Geographic References
-- ============================================================================
-- Check if CUSTOMER/SUPPLIER tables have useful location fields

-- 5A: Examine CUSTOMER table structure (small sample)
SELECT 
    C_CUSTKEY,
    C_NAME,
    C_ADDRESS,
    C_NATIONKEY,
    C_PHONE,
    C_MKTSEGMENT
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.CUSTOMER
LIMIT 5;

-- 5B: Examine SUPPLIER table structure (small sample)
SELECT 
    S_SUPPKEY,
    S_NAME,
    S_ADDRESS,
    S_NATIONKEY,
    S_PHONE,
    S_ACCTBAL
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.SUPPLIER
LIMIT 5;

-- 5C: Count records per nation in CUSTOMER table
-- This shows data distribution across the 25 nations
SELECT 
    C_NATIONKEY,
    COUNT(*) AS customer_count
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.CUSTOMER
GROUP BY C_NATIONKEY
ORDER BY C_NATIONKEY;

-- 5D: Join CUSTOMER with NATION to see country names and data availability
SELECT 
    N.N_NAME AS nation_name,
    N.N_REGIONKEY,
    R.R_NAME AS region_name,
    COUNT(C.C_CUSTKEY) AS customer_count
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.NATION N
LEFT JOIN SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.REGION R 
    ON N.N_REGIONKEY = R.R_REGIONKEY
LEFT JOIN SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.CUSTOMER C 
    ON N.N_NATIONKEY = C.C_NATIONKEY
GROUP BY N.N_NAME, N.N_REGIONKEY, R.R_NAME
ORDER BY region_name, nation_name;

-- ⚠️ ANALYZE RESULTS ⚠️
-- This shows which of the 25 nations have data records
-- We can use these nations as our geographic framework for risk mapping

-- ============================================================================
-- SECTION 6: Check for Shared or External Databases
-- ============================================================================
-- Identify databases that might be from Snowflake Marketplace

SELECT 
    DATABASE_NAME,
    DATABASE_OWNER,
    IS_TRANSIENT,
    COMMENT
FROM INFORMATION_SCHEMA.DATABASES
WHERE DATABASE_NAME NOT IN ('SNOWFLAKE_SAMPLE_DATA', 'SNOWFLAKE')
  AND DATABASE_NAME NOT LIKE 'UTIL%'
  AND DATABASE_NAME NOT LIKE 'SNOWFLAKE%'
ORDER BY DATABASE_NAME;

-- If this returns databases other than your personal ones, investigate them
-- They might be Marketplace datasets or shared databases

-- ============================================================================
-- SECTION 7: Search for Functions (Including Cortex if Available)
-- ============================================================================
-- Check if any environmental or geographic functions are available

SHOW FUNCTIONS IN ACCOUNT;

-- Filter for potentially useful functions
SELECT 
    "name" AS function_name,
    "schema_name" AS schema,
    "arguments" AS parameters
FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()))
WHERE LOWER("name") LIKE '%geo%'
   OR LOWER("name") LIKE '%distance%'
   OR LOWER("name") LIKE '%location%'
   OR LOWER("name") LIKE '%coordinate%'
   OR LOWER("name") LIKE '%weather%'
LIMIT 50;

-- ============================================================================
-- SECTION 8: Final Assessment - What Data is Available
-- ============================================================================
-- Summarize confirmed accessible data

SELECT 'CONFIRMED: TPCH_SF1.NATION' AS dataset, 25 AS record_count, 'Basic nation/country framework' AS notes
UNION ALL
SELECT 'CONFIRMED: TPCH_SF1.REGION', 5, 'Five broad geographic regions'
UNION ALL
SELECT 'CONFIRMED: TPCH_SF1.CUSTOMER', 
    (SELECT COUNT(*) FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.CUSTOMER LIMIT 1), 
    'Has nation_key foreign key'
UNION ALL
SELECT 'CONFIRMED: TPCH_SF1.SUPPLIER', 
    (SELECT COUNT(*) FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.SUPPLIER LIMIT 1), 
    'Has nation_key foreign key';

-- ============================================================================
-- EXECUTION SUMMARY
-- ============================================================================

/*
WHAT TO RUN AND REPORT:

STEP 1: Execute Section 1
- Run both queries in Section 1
- REPORT: List all database names and their categories
- NOTE: Any databases with relevant keywords (weather, geo, climate, etc.)

STEP 2: Execute Section 2
- Run the keyword search query
- REPORT: How many rows returned? If >0, list the database names

STEP 3: Execute Section 4A
- Run both queries in Section 4A
- REPORT: How many tables are in TPCH_SF1? Any besides NATION/REGION with location data?

STEP 4: Execute Section 5D
- Run query 5D (nation summary with customer counts)
- REPORT: All 25 nations visible? Which have the most data?
- NOTE: Confirm INDIA is present (mentioned in your requirements)

STEP 5: Execute Section 6
- Run the external database search
- REPORT: Any databases found besides SNOWFLAKE_SAMPLE_DATA?

STEP 6: Review Results
- REPORT: Final summary of all accessible data sources

DO NOT EXECUTE SECTION 3 unless Section 1 or 2 found relevant databases
DO NOT EXECUTE SECTION 7 unless you want to check for geographic functions

ESTIMATED TIME: 10 minutes to run all queries and collect results
*/

-- ============================================================================
-- DECISION POINTS BASED ON RESULTS
-- ============================================================================

/*
SCENARIO A: Only TPCH_SF1 data available (MOST LIKELY)
- Use 25 NATION records as geographic entities
- INDIA confirmed present (your requirement)
- Generate synthetic environmental/risk features per nation
- Proceed with Option A: NATION framework + synthetic risk model

SCENARIO B: Additional databases found with environmental keywords
- Investigate those databases immediately (Section 3)
- Check for precipitation, temperature, coordinates, elevation data
- If useful data found: integrate into risk model
- If not useful: fall back to Scenario A

SCENARIO C: Marketplace or shared databases discovered
- These could contain weather, terrain, or disaster data
- Investigate schemas and tables
- Assess data quality and relevance
- Consider integration if data is suitable

NEXT STEP AFTER DISCOVERY:
Report all findings and we will design the appropriate data architecture
and begin SignalMesh AI implementation.
*/
