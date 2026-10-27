/**
 * Load India District Features into Snowflake
 * Executes the SQL file to create and populate the table
 */

require('dotenv').config();
const snowflake = require('snowflake-sdk');
const fs = require('fs');
const path = require('path');

const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA,
  application: 'SignalMeshAI_DataLoader'
});

function executeQuery(sqlText) {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText,
      complete: (err, stmt, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    });
  });
}

async function main() {
  console.log('🚀 SignalMesh AI - Loading India District Data');
  console.log('='.repeat(60));
  
  try {
    // Connect to Snowflake
    await new Promise((resolve, reject) => {
      connection.connect((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });
    
    console.log('✅ Connected to Snowflake');
    console.log(`   Database: ${process.env.SNOWFLAKE_DATABASE}`);
    console.log(`   Schema: ${process.env.SNOWFLAKE_SCHEMA}\n`);
    
    // Step 1: Drop table if exists (for clean reload)
    console.log('[1/5] Preparing database...');
    try {
      await executeQuery('DROP TABLE IF EXISTS INDIA_DISTRICT_FEATURES');
      console.log('   ✅ Cleaned up existing table');
    } catch (err) {
      console.log('   ℹ️  No existing table to clean');
    }
    
    // Step 2: Create table
    console.log('[2/5] Creating INDIA_DISTRICT_FEATURES table...');
    await executeQuery(`
      CREATE TABLE INDIA_DISTRICT_FEATURES (
        DISTRICT_ID INTEGER AUTOINCREMENT PRIMARY KEY,
        STATE_NAME VARCHAR(50) NOT NULL,
        DISTRICT_NAME VARCHAR(100) NOT NULL,
        RAINFALL_MM NUMBER(5,0) NOT NULL,
        TERRAIN_SLOPE_FACTOR NUMBER(3,1) NOT NULL,
        SOIL_STABILITY_INDEX NUMBER(3,0) NOT NULL,
        SEISMIC_ACTIVITY_LEVEL NUMBER(1,0) NOT NULL,
        VEGETATION_COVER NUMBER(3,0) NOT NULL,
        RISK_SCORE NUMBER(5,2) NOT NULL,
        RISK_LEVEL VARCHAR(20) NOT NULL,
        DATA_SOURCE VARCHAR(50) NOT NULL,
        DATA_TYPE VARCHAR(20) NOT NULL,
        UPDATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
        CONSTRAINT valid_risk_level CHECK (RISK_LEVEL IN ('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'EXTREME'))
      )
    `);
    console.log('   ✅ Table created successfully');
    
    // Step 3: Read and execute INSERT statements from SQL file
    console.log('[3/5] Loading district data...');
    const sqlPath = path.join(__dirname, '../sql/01_create_india_district_features.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Extract all INSERT statements
    const insertMatches = sqlContent.match(/INSERT INTO INDIA_DISTRICT_FEATURES[\s\S]*?;/g);
    
    if (insertMatches) {
      for (let i = 0; i < insertMatches.length; i++) {
        const insertStmt = insertMatches[i].replace(/;$/, '').trim();
        await executeQuery(insertStmt);
        console.log(`   ✅ Batch ${i + 1}/${insertMatches.length} inserted`);
      }
    }
    
    console.log('\n[4/5] Verifying data...');
    
    const totalCount = await executeQuery('SELECT COUNT(*) as count FROM INDIA_DISTRICT_FEATURES');
    console.log(`   Total Districts: ${totalCount[0].COUNT}`);
    
    const stateCount = await executeQuery('SELECT COUNT(DISTINCT STATE_NAME) as count FROM INDIA_DISTRICT_FEATURES');
    console.log(`   Total States: ${stateCount[0].COUNT}`);
    
    const riskDist = await executeQuery(`
      SELECT RISK_LEVEL, COUNT(*) as count 
      FROM INDIA_DISTRICT_FEATURES 
      GROUP BY RISK_LEVEL 
      ORDER BY 
        CASE RISK_LEVEL
          WHEN 'EXTREME' THEN 1
          WHEN 'VERY_HIGH' THEN 2
          WHEN 'HIGH' THEN 3
          WHEN 'MODERATE' THEN 4
          WHEN 'LOW' THEN 5
        END
    `);
    console.log('\n   Risk Distribution:');
    riskDist.forEach(row => {
      console.log(`     ${row.RISK_LEVEL}: ${row.COUNT} districts`);
    });
    
    console.log('\n[5/5] State coverage:');
    const stateCoverage = await executeQuery(`
      SELECT STATE_NAME, COUNT(*) as district_count
      FROM INDIA_DISTRICT_FEATURES
      GROUP BY STATE_NAME
      ORDER BY STATE_NAME
    `);
    stateCoverage.forEach(row => {
      console.log(`     ${row.STATE_NAME}: ${row.DISTRICT_COUNT} districts`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Data loading complete!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    connection.destroy((err) => {
      if (err) {
        console.error('Error closing connection:', err);
      }
      process.exit(0);
    });
  }
}

main();
