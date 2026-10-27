-- SignalMesh AI - Snowflake Environment Check
-- Purpose: Verify Snowflake account access and TPCH sample data availability
-- Instructions: Run this in Snowflake Worksheets to validate your environment
-- Expected: All queries should return results without errors

-- ============================================================================
-- SECTION 1: Account and Session Information
-- ============================================================================

-- Check current account information
SELECT 
    CURRENT_ACCOUNT() AS account_name,
    CURRENT_REGION() AS region,
    CURRENT_VERSION() AS snowflake_version;

-- Check current session context
SELECT 
    CURRENT_USER() AS current_user,
    CURRENT_ROLE() AS current_role,
    CURRENT_WAREHOUSE() AS current_warehouse,
    CURRENT_DATABASE() AS current_database,
    CURRENT_SCHEMA() AS current_schema;

-- ============================================================================
-- SECTION 2: Warehouse Validation
-- ============================================================================

-- Verify SNOWFLAKE_LEARNING_WH warehouse exists and is accessible
SHOW WAREHOUSES LIKE 'SNOWFLAKE_LEARNING_WH';

-- Check warehouse state
SELECT 
    "name" AS warehouse_name,
    "state" AS warehouse_state,
    "size" AS warehouse_size,
    "type" AS warehouse_type
FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()));

-- ============================================================================
-- SECTION 3: Database and Schema Validation
-- ============================================================================

-- Check if SNOWFLAKE_SAMPLE_DATA database is accessible
SHOW DATABASES LIKE 'SNOWFLAKE_SAMPLE_DATA';

-- Check if TPCH_SF1 schema exists
SHOW SCHEMAS IN SNOWFLAKE_SAMPLE_DATA LIKE 'TPCH_SF1';

-- List all tables in TPCH_SF1 schema
SHOW TABLES IN SNOWFLAKE_SAMPLE_DATA.TPCH_SF1;

-- ============================================================================
-- SECTION 4: Table Accessibility Checks (Small Samples)
-- ============================================================================

-- ORDERS table validation (limit to 5 rows)
SELECT 
    O_ORDERKEY,
    O_CUSTKEY,
    O_ORDERSTATUS,
    O_TOTALPRICE,
    O_ORDERDATE
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.ORDERS
LIMIT 5;

-- Get basic stats on ORDERS table (efficient metadata query)
SELECT 
    'ORDERS' AS table_name,
    COUNT(*) AS row_count
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.ORDERS
LIMIT 1;

-- LINEITEM table validation (limit to 5 rows)
SELECT 
    L_ORDERKEY,
    L_PARTKEY,
    L_SUPPKEY,
    L_LINENUMBER,
    L_QUANTITY,
    L_EXTENDEDPRICE,
    L_DISCOUNT
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.LINEITEM
LIMIT 5;

-- Get basic stats on LINEITEM table
SELECT 
    'LINEITEM' AS table_name,
    COUNT(*) AS row_count
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.LINEITEM
LIMIT 1;

-- SUPPLIER table validation (limit to 5 rows)
SELECT 
    S_SUPPKEY,
    S_NAME,
    S_ADDRESS,
    S_NATIONKEY,
    S_PHONE,
    S_ACCTBAL
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.SUPPLIER
LIMIT 5;

-- Get basic stats on SUPPLIER table
SELECT 
    'SUPPLIER' AS table_name,
    COUNT(*) AS row_count
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.SUPPLIER
LIMIT 1;

-- PART table validation (limit to 5 rows)
SELECT 
    P_PARTKEY,
    P_NAME,
    P_MFGR,
    P_BRAND,
    P_TYPE,
    P_SIZE,
    P_RETAILPRICE
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.PART
LIMIT 5;

-- Get basic stats on PART table
SELECT 
    'PART' AS table_name,
    COUNT(*) AS row_count
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.PART
LIMIT 1;

-- ============================================================================
-- SECTION 5: Data Quality Quick Check
-- ============================================================================

-- Verify data relationships (small sample join)
SELECT 
    o.O_ORDERKEY,
    o.O_ORDERDATE,
    o.O_TOTALPRICE,
    l.L_LINENUMBER,
    l.L_QUANTITY,
    l.L_EXTENDEDPRICE
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.ORDERS o
JOIN SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.LINEITEM l 
    ON o.O_ORDERKEY = l.L_ORDERKEY
LIMIT 10;

-- Check date range in ORDERS (useful for understanding data timeframe)
SELECT 
    MIN(O_ORDERDATE) AS earliest_order,
    MAX(O_ORDERDATE) AS latest_order,
    DATEDIFF(day, MIN(O_ORDERDATE), MAX(O_ORDERDATE)) AS date_range_days
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.ORDERS;

-- ============================================================================
-- SECTION 6: Cortex AI Availability Check (Optional)
-- ============================================================================

-- List available functions (including Cortex functions if enabled)
-- Note: This is metadata only, not executing Cortex functions
SHOW FUNCTIONS IN ACCOUNT;

-- ============================================================================
-- END OF ENVIRONMENT CHECK
-- ============================================================================

-- SUCCESS CRITERIA:
-- ✓ All queries complete without errors
-- ✓ Account and role information displays correctly
-- ✓ SNOWFLAKE_LEARNING_WH warehouse is visible
-- ✓ SNOWFLAKE_SAMPLE_DATA.TPCH_SF1 tables return data
-- ✓ ORDERS, LINEITEM, SUPPLIER, and PART tables are accessible
-- ✓ Table joins work correctly
-- ✓ Row counts are > 0 for all tables

-- If any query fails:
-- 1. Check that you're using the correct role (ACCOUNTADMIN or PUBLIC)
-- 2. Verify SNOWFLAKE_LEARNING_WH is started or set to auto-resume
-- 3. Ensure SNOWFLAKE_SAMPLE_DATA is available in your account
-- 4. Contact your Snowflake administrator if access issues persist
