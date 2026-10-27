/**
 * SignalMesh AI - Mobile Phone Alert Trigger
 * Sends alerts directly to Android phones via ADB or Network
 */

const { exec } = require('child_process');
const axios = require('axios');
const util = require('util');
const execPromise = util.promisify(exec);

// Configuration
const config = {
  // Backend API URL
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
  
  // Frontend alert URL (for opening on phone)
  alertBaseUrl: process.env.ALERT_BASE_URL || 'http://192.168.1.100:3000', // Change to your machine's IP
  
  // ADB device (leave empty to use first connected device)
  adbDevice: process.env.ADB_DEVICE || '',
  
  // Network-based alert (phone IP address)
  phoneIP: process.env.PHONE_IP || null,
  phonePort: process.env.PHONE_PORT || 8080
};

/**
 * Check if ADB is available
 */
async function checkADB() {
  try {
    await execPromise('adb version');
    return true;
  } catch (error) {
    console.error('❌ ADB not found. Install from: https://developer.android.com/tools/adb');
    return false;
  }
}

/**
 * Get connected ADB devices
 */
async function getADBDevices() {
  try {
    const { stdout } = await execPromise('adb devices');
    const lines = stdout.split('\n').slice(1); // Skip header
    const devices = lines
      .map(line => line.trim())
      .filter(line => line && line.includes('device'))
      .map(line => line.split('\t')[0]);
    
    return devices;
  } catch (error) {
    console.error('Failed to get ADB devices:', error.message);
    return [];
  }
}

/**
 * Wake up phone screen via ADB
 */
async function wakeScreen(device) {
  try {
    const deviceFlag = device ? `-s ${device}` : '';
    
    // Check if screen is off
    const { stdout } = await execPromise(`adb ${deviceFlag} shell dumpsys power | grep "mWakefulness="`);
    const isAsleep = stdout.includes('Asleep') || stdout.includes('Dozing');
    
    if (isAsleep) {
      console.log('📱 Waking up phone screen...');
      // Press power button
      await execPromise(`adb ${deviceFlag} shell input keyevent 26`);
      // Unlock screen (swipe up)
      await execPromise(`adb ${deviceFlag} shell input keyevent 82`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to wake screen:', error.message);
    return false;
  }
}

/**
 * Vibrate phone via ADB
 */
async function vibratePhone(device, durationMs = 1000) {
  try {
    const deviceFlag = device ? `-s ${device}` : '';
    await execPromise(`adb ${deviceFlag} shell input keyevent KEYCODE_VIBRATE`);
    console.log(`📳 Phone vibrating for ${durationMs}ms`);
    return true;
  } catch (error) {
    console.error('Failed to vibrate phone:', error.message);
    return false;
  }
}

/**
 * Open alert URL on phone via ADB
 */
async function openAlertOnPhone(device, alertUrl) {
  try {
    const deviceFlag = device ? `-s ${device}` : '';
    
    console.log(`📲 Opening alert on phone: ${alertUrl}`);
    
    // Open URL in default browser
    await execPromise(`adb ${deviceFlag} shell am start -a android.intent.action.VIEW -d "${alertUrl}"`);
    
    console.log('✅ Alert opened on phone successfully');
    return true;
  } catch (error) {
    console.error('Failed to open alert on phone:', error.message);
    return false;
  }
}

/**
 * Send notification via network (if phone has web server or webhook)
 */
async function sendNetworkNotification(alertUrl) {
  if (!config.phoneIP) {
    console.log('⚠️  Phone IP not configured, skipping network notification');
    return false;
  }

  try {
    const webhookUrl = `http://${config.phoneIP}:${config.phonePort}/alert`;
    console.log(`📡 Sending network notification to ${webhookUrl}`);
    
    await axios.post(webhookUrl, {
      alertUrl,
      timestamp: new Date().toISOString()
    }, {
      timeout: 5000
    });
    
    console.log('✅ Network notification sent');
    return true;
  } catch (error) {
    console.error('Network notification failed:', error.message);
    return false;
  }
}

/**
 * Main function: Trigger alert on phone
 */
async function triggerMobileAlert(alertData) {
  console.log('\n🚨 ===== TRIGGERING MOBILE ALERT =====\n');
  
  // Generate alert URL
  const params = new URLSearchParams({
    location: alertData.location,
    lat: alertData.coordinates?.lat || 0,
    lng: alertData.coordinates?.lng || 0,
    risk_score: alertData.risk_score,
    level: alertData.level,
    factors: JSON.stringify(alertData.factors || []),
    evacuation: alertData.evacuation_direction || 'Move to safe location'
  });
  
  const alertUrl = `${config.alertBaseUrl}/emergency-alert.html?${params.toString()}`;
  console.log(`🔗 Alert URL: ${alertUrl}\n`);

  // Try ADB method
  const adbAvailable = await checkADB();
  if (adbAvailable) {
    const devices = await getADBDevices();
    
    if (devices.length > 0) {
      const device = config.adbDevice || devices[0];
      console.log(`📱 Using ADB device: ${device}\n`);
      
      // Wake screen
      await wakeScreen(device);
      
      // Vibrate
      await vibratePhone(device);
      
      // Open alert
      const opened = await openAlertOnPhone(device, alertUrl);
      
      if (opened) {
        console.log('\n✅ Mobile alert triggered successfully via ADB!');
        return true;
      }
    } else {
      console.log('⚠️  No ADB devices connected');
    }
  }

  // Try network method as fallback
  const networkSent = await sendNetworkNotification(alertUrl);
  if (networkSent) {
    console.log('\n✅ Mobile alert triggered successfully via Network!');
    return true;
  }

  // Fallback: Print QR code or manual instruction
  console.log('\n⚠️  Could not automatically trigger alert on phone');
  console.log('\n📱 MANUAL STEPS:');
  console.log('1. Open your phone browser');
  console.log('2. Navigate to:');
  console.log(`   ${alertUrl}`);
  console.log('\n   OR scan this URL as QR code\n');
  
  return false;
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Demo alert
    const demoAlert = {
      location: 'Cherrapunji, Meghalaya',
      coordinates: { lat: 25.2639, lng: 91.7320 },
      risk_score: 0.89,
      level: 'CRITICAL',
      factors: [
        { name: 'Rainfall', value: 285, unit: 'mm', severity: 'EXTREME' },
        { name: 'Soil Saturation', value: 95, unit: '%', severity: 'CRITICAL' }
      ],
      evacuation_direction: 'EVACUATE IMMEDIATELY - Move to Community Center'
    };
    
    triggerMobileAlert(demoAlert)
      .then(success => process.exit(success ? 0 : 1))
      .catch(error => {
        console.error('Error:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage: node trigger-mobile-alert.js');
    console.log('   or: node trigger-mobile-alert.js --alert-id <ALERT_ID>');
    process.exit(1);
  }
}

module.exports = { triggerMobileAlert, openAlertOnPhone, wakeScreen };
