#!/usr/bin/env node
/**
 * Create ALERT_HISTORY table in Snowflake
 */

require('dotenv').config();
const snowflake = require('snowflake-sdk');

const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA
});

function executeQuery(conn, sql) {
  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText: sql,
      complete: (err, stmt, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    });
  });
}

async function main() {
  return new Promise((resolve, reject) => {
    connection.connect(async (err) => {
      if (err) {
        console.error('❌ Connection error:', err.message);
        reject(err);
        return;
      }

      console.log('✅ Connected to Snowflake');

      try {
        // Use database and schema
        await executeQuery(connection, 'USE DATABASE SIGNALMESH_AI');
        await executeQuery(connection, 'USE SCHEMA DISASTER_RISK');
        console.log('✅ Using database SIGNALMESH_AI.DISASTER_RISK');

        // Create table
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS ALERT_HISTORY (
            ALERT_ID VARCHAR(100) PRIMARY KEY,
            LOCATION VARCHAR(200) NOT NULL,
            COORDINATES VARIANT,
            RISK_SCORE NUMBER(5,2) NOT NULL,
            RISK_LEVEL VARCHAR(20) NOT NULL,
            TRIGGER_FACTORS VARIANT,
            DISTRICT_ID NUMBER(10,0),
            EVACUATION_DIRECTION VARCHAR(1000),
            RECIPIENT_PHONE VARCHAR(50),
            STATUS VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
            ACKNOWLEDGED_AT TIMESTAMP_NTZ,
            CREATED_AT TIMESTAMP_NTZ NOT NULL DEFAULT CURRENT_TIMESTAMP()
          )
        `;
        await executeQuery(connection, createTableSQL);
        console.log('✅ ALERT_HISTORY table created');

        // Create indexes
        await executeQuery(connection, 'CREATE INDEX IF NOT EXISTS IDX_ALERT_HISTORY_CREATED ON ALERT_HISTORY(CREATED_AT)');
        console.log('✅ Index IDX_ALERT_HISTORY_CREATED created');

        await executeQuery(connection, 'CREATE INDEX IF NOT EXISTS IDX_ALERT_HISTORY_LEVEL ON ALERT_HISTORY(RISK_LEVEL, CREATED_AT)');
        console.log('✅ Index IDX_ALERT_HISTORY_LEVEL created');

        await executeQuery(connection, 'CREATE INDEX IF NOT EXISTS IDX_ALERT_HISTORY_DISTRICT ON ALERT_HISTORY(DISTRICT_ID, CREATED_AT)');
        console.log('✅ Index IDX_ALERT_HISTORY_DISTRICT created');

        // Add comment
        await executeQuery(connection, "COMMENT ON TABLE ALERT_HISTORY IS 'Emergency alert history triggered by AI/ML model predictions'");
        console.log('✅ Table comment added');

        console.log('\n🎉 Alert History table setup completed successfully!');
        
        connection.destroy();
        resolve();
      } catch (error) {
        console.error('❌ Error:', error.message);
        connection.destroy();
        reject(error);
      }
    });
  });
}

main().catch(err => process.exit(1));
