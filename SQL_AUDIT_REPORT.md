# SQL Safety and Correctness Audit Report
## sql/02_create_schema.sql

**Audit Date**: Pre-execution safety check  
**Script Purpose**: Create disaster risk schema and tables in Snowflake  
**Audit Status**: ⚠️ ISSUES FOUND - CORRECTIONS NEEDED

---

## 1. Database, Schema, and Table Inventory

### Objects Created or Modified:

**Database**: NONE created (uses existing SNOWFLAKE_SAMPLE_DATA)

**Schema**:
- `SNOWFLAKE_SAMPLE_DATA.DISASTER_RISK` (created if not exists)

**Tables** (in DISASTER_RISK schema):
1. `NATION_FEATURES` - Environmental risk factors per nation
2. `RISK_ASSESSMENT` - ML-generated risk scores (created empty)

**Views**:
1. `NATION_RISK_SUMMARY` - Combined view of features and assessments

### Source Tables Referenced:
- `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.NATION` ✅ Verified accessible (25 rows)
- `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.REGION` ✅ Verified accessible (5 rows)
- `SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.CUSTOMER` ✅ Verified accessible

---

## 2. Permission and Infrastructure Checks

### ✅ NO Permission Changes
- Script does NOT grant or revoke permissions
- Script does NOT modify roles
- Script does NOT change ownership

### ✅ NO Warehouse Operations
- Script does NOT create warehouses
- Script does NOT modify warehouse size or settings
- Script USES existing SNOWFLAKE_LEARNING_WH (does not modify it)

### ⚠️ USES ACCOUNTADMIN Role
- Line 17: `USE ROLE ACCOUNTADMIN;`
- **Risk**: High-privilege role
- **Assessment**: Acceptable for hackathon/learning environment
- **Recommendation**: User should verify they have ACCOUNTADMIN access

---

## 3. Row Loading Verification

### ✅ CONFIRMED: 25 Rows Will Be Loaded

**INSERT statement** (Lines 103-154):
```sql
INSERT INTO NATION_FEATURES (...)
SELECT 
    N.N_NATIONKEY,
    N.N_NAME,
    R.R_NAME,
    [synthetic features]
FROM 
    SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.NATION N
    LEFT JOIN SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.REGION R 
        ON N.N_REGIONKEY = R.R_REGIONKEY
    LEFT JOIN (
        SELECT C_NATIONKEY, COUNT(*) AS customer_count
        FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.CUSTOMER
        GROUP BY C_NATIONKEY
    ) C ON N.N_NATIONKEY = C.C_NATIONKEY;
```

**Analysis**:
- ✅ Sources from TPCH_SF1.NATION (confirmed 25 nations available)
- ✅ Joins to REGION for region names
- ✅ Joins to CUSTOMER aggregate for customer counts
- ✅ All 25 nations from NATION table will be inserted

### ✅ CONFIRMED: INDIA Will Be Included

**Evidence**:
- Line 111: `CASE WHEN N.N_NAME IN ('INDIA', 'INDONESIA', 'VIETNAM', 'CHINA', 'JAPAN')`
- Line 117: `CASE WHEN N.N_NAME IN ('PERU', 'ARGENTINA', 'INDIA', 'CHINA', 'JAPAN')`
- Line 123: `CASE WHEN N.N_NAME IN ('INDIA', 'CHINA', 'INDONESIA', 'BRAZIL')`
- Line 177: `SELECT * FROM NATION_FEATURES WHERE nation_name = 'INDIA';`

**Verification query included**: Line 177 explicitly checks for INDIA

---

## 4. Destructive Statement Check

### ⚠️ FOUND: CREATE OR REPLACE Statements

**Line 34**: `CREATE OR REPLACE TABLE NATION_FEATURES`
- **Effect**: Will DROP existing NATION_FEATURES table if it exists
- **Risk**: Loss of data if table already exists from prior execution
- **Assessment**: Acceptable for initial setup, but user should be warned

**Line 57**: `CREATE OR REPLACE TABLE RISK_ASSESSMENT`
- **Effect**: Will DROP existing RISK_ASSESSMENT table if it exists
- **Risk**: Loss of previously loaded ML predictions
- **Assessment**: Acceptable for initial setup, problematic for re-runs

**Line 200**: `CREATE OR REPLACE VIEW NATION_RISK_SUMMARY`
- **Effect**: Will replace view if it exists
- **Risk**: Low (views are just queries, no data loss)
- **Assessment**: Safe

### ❌ NO DROP, TRUNCATE, or DELETE Statements
- Script does not use DROP SCHEMA
- Script does not use DROP DATABASE
- Script does not use TRUNCATE
- Script does not use DELETE

### ⚠️ WARNING: Re-execution Behavior
If this script is run multiple times:
1. NATION_FEATURES will be recreated and repopulated (25 rows again)
2. RISK_ASSESSMENT will be recreated and emptied (ML predictions lost)
3. User must be aware of this behavior

---

## 5. Synthetic Data Labeling

### ✅ EXCELLENT: Synthetic Features Clearly Labeled

**Column Comments** (Lines 39-43):
- `precipitation_index FLOAT COMMENT 'Annual rainfall intensity (synthetic, 0-100)'`
- `terrain_slope_factor FLOAT COMMENT 'Average terrain slope steepness (synthetic, 0-100)'`
- `soil_stability_index FLOAT COMMENT 'Soil composition stability (synthetic, 0-100, lower = more unstable)'`
- `seismic_activity_level FLOAT COMMENT 'Earthquake frequency indicator (synthetic, 0-100)'`
- `vegetation_cover FLOAT COMMENT 'Forest/plant coverage (synthetic, 0-100, higher = more stable)'`

**Metadata Column** (Line 49):
- `data_source VARCHAR(50) DEFAULT 'SYNTHETIC_DEMO'`

**Section Comments** (Lines 88-91):
- "Insert synthetic environmental features for all 25 TPCH nations"
- "Features are demonstrative and designed to create realistic risk variation"
- "Generate features that correlate with general geographic knowledge"

**Assessment**: ✅ Synthetic nature is transparently documented

---

## 6. SQL Syntax Verification

### ✅ Snowflake-Specific Syntax Correct

- `AUTOINCREMENT` (Line 58): ✅ Valid in Snowflake
- `TIMESTAMP_NTZ` (Line 50, 73): ✅ Valid (No Time Zone)
- `COALESCE` (Line 144): ✅ Valid
- `LEFT JOIN` (Lines 147-153): ✅ Valid
- `CASE WHEN ... IN (...)` (Lines 111+): ✅ Valid
- `COUNT(*) ... GROUP BY` (Line 151): ✅ Valid
- Subquery in JOIN (Lines 150-153): ✅ Valid

### ⚠️ Context Setting

**Lines 17-19**:
```sql
USE ROLE ACCOUNTADMIN;
USE WAREHOUSE SNOWFLAKE_LEARNING_WH;
USE DATABASE SNOWFLAKE_SAMPLE_DATA;
```

**Issue**: Assumes user has ACCOUNTADMIN role access
**Recommendation**: Add note that user may need PUBLIC or another role if ACCOUNTADMIN not available

---

## 7. Issues Found & Corrections Needed

### Issue #1: ⚠️ Schema Creation in Wrong Database

**Current** (Line 19):
```sql
USE DATABASE SNOWFLAKE_SAMPLE_DATA;
CREATE SCHEMA IF NOT EXISTS DISASTER_RISK
```

**Problem**: Creates schema inside SNOWFLAKE_SAMPLE_DATA (read-only or managed database)

**Fix Needed**: Create schema in user's writable database or create new database

---

### Issue #2: ⚠️ No Explicit Database for Schema

**Problem**: Schema DISASTER_RISK will be created in SNOWFLAKE_SAMPLE_DATA, which may not allow schema creation

**Fix Needed**: Either:
- Option A: Create in user's personal database
- Option B: Create a new database first
- Option C: Check permissions before proceeding

---

## 8. Critical Finding: Schema Creation Will Likely FAIL

### Root Cause Analysis

**SNOWFLAKE_SAMPLE_DATA** is typically:
- Provided by Snowflake
- Read-only for most users
- Does not allow CREATE SCHEMA

**Expected Error**:
```
SQL access control error: Insufficient privileges to operate on database 'SNOWFLAKE_SAMPLE_DATA'
```

### Required Fix

The script must be modified to create the schema in a writable database.

---

## 9. Recommended Corrections

### Correction #1: Modify Database Context

**Replace Lines 17-24 with**:
```sql
-- Set context
USE ROLE ACCOUNTADMIN;  -- Or PUBLIC if ACCOUNTADMIN not available
USE WAREHOUSE SNOWFLAKE_LEARNING_WH;

-- Create or use a writable database
-- Option A: Use existing user database (replace YOUR_DB with actual name)
-- Option B: Create new database
CREATE DATABASE IF NOT EXISTS SIGNALMESH_AI
    COMMENT = 'SignalMesh AI disaster intelligence platform data';

USE DATABASE SIGNALMESH_AI;

-- Create schema
CREATE SCHEMA IF NOT EXISTS DISASTER_RISK
    COMMENT = 'SignalMesh AI disaster risk assessment tables';

USE SCHEMA DISASTER_RISK;
```

### Correction #2: Update All References

Ensure all subsequent table/view creations reference the correct schema (already correct - they use current schema context).

---

## 10. Final Safety Assessment

### ❌ UNSAFE TO RUN AS-IS

**Reason**: Schema creation in SNOWFLAKE_SAMPLE_DATA will likely fail due to permissions

### ✅ SAFE AFTER CORRECTIONS

**After applying corrections**:
- ✅ No permission changes
- ✅ No warehouse modifications
- ✅ No data deletion from existing tables
- ✅ Creates objects in appropriate writable location
- ✅ 25 rows will be loaded
- ✅ INDIA will be included
- ✅ Synthetic data clearly labeled
- ✅ All source tables verified

---

## 11. Execution Recommendations

### Before Execution:
1. Apply corrections (create schema in writable database)
2. Verify user has ACCOUNTADMIN or appropriate role
3. Verify SNOWFLAKE_LEARNING_WH is available and running
4. Confirm TPCH_SF1 tables are accessible

### During Execution:
1. Run entire script as one block
2. Watch for any errors in schema creation
3. Verify "25 nations loaded" in final output

### After Execution:
1. Confirm INDIA present
2. Verify synthetic features are labeled
3. Check that RISK_ASSESSMENT is empty (as expected)

---

## Summary

**Must Fix**: Schema creation database location  
**Safe Elements**: Table structures, INSERT logic, synthetic data labeling  
**Verified**: 25 nations will load, INDIA included, synthetic features clearly marked  
**Recommendation**: Apply corrections, then safe to execute
