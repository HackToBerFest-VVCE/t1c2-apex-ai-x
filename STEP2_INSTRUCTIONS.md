# SignalMesh AI - Step 2 Extended Discovery Instructions

## ✅ Step 1 Recap

**Confirmed**:
- SNOWFLAKE_SAMPLE_DATA accessible
- TPCH_SF1.NATION: 25 countries (INDIA present)
- TPCH_SF1.REGION: 5 regions
- NO weather/disaster data found yet

---

## 🔍 Step 2: Extended Discovery

### File to Use
**sql/01_extended_discovery.sql**

### Time Required
10-15 minutes

---

## Execution Order

### 1️⃣ Query Set 1: Database Inventory (Section 1)

**Run**:
```sql
SHOW DATABASES;

SELECT 
    "name" AS database_name,
    "owner", "comment",
    CASE 
        WHEN LOWER("name") LIKE '%weather%' THEN 'WEATHER_RELATED'
        WHEN LOWER("name") LIKE '%climate%' THEN 'CLIMATE_RELATED'
        WHEN LOWER("name") LIKE '%geo%' THEN 'GEOGRAPHIC_RELATED'
        WHEN LOWER("name") LIKE '%hazard%' OR LOWER("name") LIKE '%disaster%' THEN 'HAZARD_RELATED'
        WHEN LOWER("name") LIKE '%sample%' THEN 'SAMPLE_DATA'
        ELSE 'OTHER'
    END AS category
FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()))
ORDER BY category, "name";
```

**Report**:
- How many databases total?
- List all database names
- Any with relevant keywords (weather, geo, climate, hazard)?

---

### 2️⃣ Query Set 2: Keyword Search (Section 2)

**Run**:
```sql
SELECT 
    "name", "comment"
FROM TABLE(INFORMATION_SCHEMA.DATABASES)
WHERE 
    LOWER(COALESCE("comment", '')) LIKE '%weather%'
    OR LOWER(COALESCE("comment", '')) LIKE '%climate%'
    OR LOWER(COALESCE("comment", '')) LIKE '%rain%'
    OR LOWER(COALESCE("comment", '')) LIKE '%terrain%'
    OR LOWER(COALESCE("comment", '')) LIKE '%disaster%'
    OR LOWER(COALESCE("comment", '')) LIKE '%flood%'
    OR LOWER(COALESCE("comment", '')) LIKE '%landslide%';
```

**Report**:
- How many rows? (likely 0)
- If >0: which databases?

---

### 3️⃣ Query Set 3: TPCH Tables (Section 4A)

**Run**:
```sql
SHOW TABLES IN SNOWFLAKE_SAMPLE_DATA.TPCH_SF1;

SELECT "name", "rows"
FROM TABLE(RESULT_SCAN(LAST_QUERY_ID()))
ORDER BY "name";
```

**Report**:
- How many tables?
- Confirm: NATION, REGION, CUSTOMER, SUPPLIER present

---

### 4️⃣ Query Set 4: Nation Summary (Section 5D)

**Run**:
```sql
SELECT 
    N.N_NAME AS nation_name,
    R.R_NAME AS region_name,
    COUNT(C.C_CUSTKEY) AS customer_count
FROM SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.NATION N
LEFT JOIN SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.REGION R 
    ON N.N_REGIONKEY = R.R_REGIONKEY
LEFT JOIN SNOWFLAKE_SAMPLE_DATA.TPCH_SF1.CUSTOMER C 
    ON N.N_NATIONKEY = C.C_NATIONKEY
GROUP BY N.N_NAME, R.R_NAME
ORDER BY region_name, nation_name;
```

**Report**:
- All 25 nations visible?
- Confirm INDIA present
- Which nations have most customer data?

---

### 5️⃣ Query Set 5: External Databases (Section 6)

**Run**:
```sql
SELECT DATABASE_NAME, DATABASE_OWNER, COMMENT
FROM INFORMATION_SCHEMA.DATABASES
WHERE DATABASE_NAME NOT IN ('SNOWFLAKE_SAMPLE_DATA', 'SNOWFLAKE')
  AND DATABASE_NAME NOT LIKE 'SNOWFLAKE%'
ORDER BY DATABASE_NAME;
```

**Report**:
- Any databases found?
- If yes: list names

---

## What to Report Back

After running all 5 query sets, provide:

1. **Database count and names** (Query 1)
2. **Any keyword matches** (Query 2) 
3. **TPCH table count** (Query 3)
4. **Nation list with INDIA confirmation** (Query 4)
5. **Any external databases** (Query 5)

---

## Expected Outcome

**Most Likely**: 
- Only SNOWFLAKE_SAMPLE_DATA found
- No weather/disaster data
- TPCH_SF1 with 8 tables (NATION, REGION, CUSTOMER, SUPPLIER, ORDERS, LINEITEM, PART, PARTSUPP)
- All 25 nations with INDIA present
- No external databases

**If This Is The Case**:
→ Proceed immediately with **Option A** (NATION + Synthetic Risk)

---

## Next Action After Reporting

Once you provide the Step 2 results, I will:

1. **Confirm data strategy** (likely Option A)
2. **Design Snowflake schema** for disaster risk tables
3. **Begin implementation**:
   - Python ML environment setup
   - Synthetic feature generation
   - ML model development
   - React frontend
   - Risk visualization

**No further discovery needed after this step.**

---

## Timeline

- Step 2 Discovery: 10-15 min (current)
- Implementation: 3-3.5 hours
- Testing & Documentation: 30 min
- **Total Remaining**: ~4 hours

Ready when you are! 🚀
