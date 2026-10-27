/**
 * Snowflake Connection Test Script
 * Tests different authentication methods to diagnose connection issues
 * 
 * Usage: node test-connection.js
 */

require('dotenv').config();
const snowflake = require('snowflake-sdk');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function testConnection(config, description) {
  return new Promise((resolve) => {
    log(`\n${'='.repeat(60)}`, colors.blue);
    log(`Testing: ${description}`, colors.blue);
    log('='.repeat(60), colors.blue);
    
    log(`Account: ${config.account}`, colors.gray);
    log(`Username: ${config.username}`, colors.gray);
    log(`Warehouse: ${config.warehouse}`, colors.gray);
    log(`Database: ${config.database}`, colors.gray);
    log(`Schema: ${config.schema}`, colors.gray);
    log(`Authenticator: ${config.authenticator || 'SNOWFLAKE (password)'}`, colors.gray);
    
    const connection = snowflake.createConnection(config);
    
    connection.connect((err, conn) => {
      if (err) {
        log(`\n❌ Connection Failed`, colors.red);
        log(`Error Code: ${err.code}`, colors.red);
        log(`Error Message: ${err.message}`, colors.red);
        
        if (err.message.includes('Incorrect username or password')) {
          log('\n💡 Suggestions:', colors.yellow);
          log('  1. Verify password in .env file is correct', colors.yellow);
          log('  2. Try using full email as username', colors.yellow);
          log('  3. Check if MFA is enabled on your account', colors.yellow);
          log('  4. Verify account is not locked', colors.yellow);
        } else if (err.message.includes('proofKey')) {
          log('\n💡 Suggestions:', colors.yellow);
          log('  1. Upgrade snowflake-sdk: npm install snowflake-sdk@latest', colors.yellow);
          log('  2. Verify SSO/SAML is enabled on your Snowflake account', colors.yellow);
        } else if (err.message.includes('does not exist')) {
          log('\n💡 Suggestions:', colors.yellow);
          log('  1. Verify database SIGNALMESH_AI exists', colors.yellow);
          log('  2. Check if you have access permissions', colors.yellow);
        }
        
        resolve({ success: false, error: err.message });
      } else {
        log(`\n✅ Connection Successful!`, colors.green);
        log(`Session ID: ${conn.getId()}`, colors.green);
        
        // Test a simple query
        connection.execute({
          sqlText: 'SELECT CURRENT_USER(), CURRENT_ACCOUNT(), CURRENT_DATABASE(), CURRENT_WAREHOUSE(), CURRENT_ROLE()',
          complete: (err, stmt, rows) => {
            if (err) {
              log(`\n⚠️  Query Failed: ${err.message}`, colors.yellow);
              connection.destroy(() => {});
              resolve({ success: true, query: false });
            } else {
              log(`\n✅ Query Successful!`, colors.green);
              log('Session Info:', colors.gray);
              const row = rows[0];
              log(`  User: ${row['CURRENT_USER()']}`, colors.gray);
              log(`  Account: ${row['CURRENT_ACCOUNT()']}`, colors.gray);
              log(`  Database: ${row['CURRENT_DATABASE()']}`, colors.gray);
              log(`  Warehouse: ${row['CURRENT_WAREHOUSE()']}`, colors.gray);
              log(`  Role: ${row['CURRENT_ROLE()']}`, colors.gray);
              
              // Try to query NATION_FEATURES
              connection.execute({
                sqlText: 'SELECT COUNT(*) as row_count FROM NATION_FEATURES',
                complete: (err, stmt, rows) => {
                  if (err) {
                    log(`\n⚠️  NATION_FEATURES query failed: ${err.message}`, colors.yellow);
                  } else {
                    log(`\n✅ NATION_FEATURES table accessible!`, colors.green);
                    log(`  Row count: ${rows[0].ROW_COUNT}`, colors.gray);
                  }
                  
                  connection.destroy(() => {});
                  resolve({ success: true, query: true });
                }
              });
            }
          }
        });
      }
    });
  });
}

async function main() {
  log('\n🔍 Snowflake Connection Diagnostic Tool', colors.blue);
  log('SignalMesh AI Backend - Connection Testing\n', colors.blue);
  
  // Check required environment variables
  const required = ['SNOWFLAKE_ACCOUNT', 'SNOWFLAKE_USERNAME'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    log(`❌ Missing required environment variables: ${missing.join(', ')}`, colors.red);
    log('Please configure backend/.env file', colors.yellow);
    process.exit(1);
  }
  
  const baseConfig = {
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USERNAME,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    database: process.env.SNOWFLAKE_DATABASE,
    schema: process.env.SNOWFLAKE_SCHEMA,
    application: 'SignalMeshAI_ConnectionTest'
  };
  
  const tests = [];
  
  // Test 1: Password authentication with username
  if (process.env.SNOWFLAKE_PASSWORD) {
    tests.push({
      config: {
        ...baseConfig,
        password: process.env.SNOWFLAKE_PASSWORD
      },
      description: 'Password Authentication (username from .env)'
    });
  }
  
  // Test 2: Password authentication with email format
  if (process.env.SNOWFLAKE_PASSWORD) {
    const emailUsername = baseConfig.username.includes('@') 
      ? baseConfig.username 
      : `${baseConfig.username}@gmail.com`;
      
    tests.push({
      config: {
        ...baseConfig,
        username: emailUsername,
        password: process.env.SNOWFLAKE_PASSWORD
      },
      description: 'Password Authentication (trying email format)'
    });
  }
  
  if (tests.length === 0) {
    log('❌ No authentication credentials found in .env file', colors.red);
    log('\nPlease add one of the following to backend/.env:', colors.yellow);
    log('  - SNOWFLAKE_PASSWORD for password authentication', colors.yellow);
    process.exit(1);
  }
  
  // Run all tests
  const results = [];
  for (const test of tests) {
    const result = await testConnection(test.config, test.description);
    results.push({ ...test, result });
    
    // If successful, no need to test other methods
    if (result.success) {
      break;
    }
    
    // Wait a bit between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  log(`\n${'='.repeat(60)}`, colors.blue);
  log('Test Summary', colors.blue);
  log('='.repeat(60), colors.blue);
  
  const successful = results.filter(r => r.result.success);
  
  if (successful.length > 0) {
    log(`\n✅ ${successful.length} test(s) passed!`, colors.green);
    log('\nWorking configuration:', colors.green);
    const working = successful[0];
    log(`  Description: ${working.description}`, colors.gray);
    log(`  Username: ${working.config.username}`, colors.gray);
    log(`  Authenticator: ${working.config.authenticator || 'SNOWFLAKE (password)'}`, colors.gray);
    
    log('\n✅ Backend server can now use this configuration!', colors.green);
    log('Update backend/.env if needed and restart the server.', colors.gray);
  } else {
    log(`\n❌ All tests failed`, colors.red);
    log('\nPlease check:', colors.yellow);
    log('  1. Verify credentials by logging into Snowflake web UI', colors.yellow);
    log('  2. Check if MFA is enabled (may need different auth method)', colors.yellow);
    log('  3. Verify account, database, and warehouse exist', colors.yellow);
    log('  4. Check user permissions', colors.yellow);
  }
  
  log(''); // Empty line at end
}

// Run tests
main().catch(err => {
  log(`\n❌ Unexpected error: ${err.message}`, colors.red);
  process.exit(1);
});
