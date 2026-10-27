#!/usr/bin/env python3
"""
SignalMesh AI - Emergency Alert Trigger from ML Model
Trigger emergency alerts when AI/ML model predicts high/critical risk
"""

import requests
import json
import sys
import subprocess
import time
from urllib.parse import urlencode
from typing import Dict, List, Optional

# Configuration
BACKEND_URL = "http://localhost:5000"
ALERT_BASE_URL = "http://192.168.1.100:3000"  # Change to your machine's IP
ADB_AVAILABLE = True

class EmergencyAlertSystem:
    def __init__(self, backend_url: str = BACKEND_URL):
        self.backend_url = backend_url
        self.alert_base_url = ALERT_BASE_URL
    
    def trigger_alert(
        self,
        location: str,
        risk_score: float,
        level: str,
        coordinates: Optional[Dict[str, float]] = None,
        factors: Optional[List[Dict]] = None,
        evacuation_direction: Optional[str] = None,
        district_id: Optional[int] = None,
        recipient_phone: Optional[str] = None
    ) -> Dict:
        """
        Trigger emergency alert
        
        Args:
            location: Location name (e.g., "Cherrapunji, Meghalaya")
            risk_score: Risk score 0.0-1.0
            level: Risk level (HIGH, CRITICAL, EXTREME)
            coordinates: {lat: float, lng: float}
            factors: List of trigger factors
            evacuation_direction: Evacuation instructions
            district_id: District ID from database
            recipient_phone: Phone number for SMS
        
        Returns:
            API response dict
        """
        # Validate risk level
        if level.upper() not in ['LOW', 'MODERATE', 'HIGH', 'CRITICAL', 'EXTREME']:
            raise ValueError(f"Invalid risk level: {level}")
        
        # Prepare payload
        payload = {
            'location': location,
            'risk_score': risk_score,
            'level': level.upper(),
            'coordinates': coordinates or {'lat': 0, 'lng': 0},
            'factors': factors or [],
            'evacuation_direction': evacuation_direction,
            'district_id': district_id,
            'recipient_phone': recipient_phone,
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S.000Z')
        }
        
        # Send to backend API
        try:
            response = requests.post(
                f"{self.backend_url}/api/alerts/trigger",
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            result = response.json()
            
            print(f"✅ Alert triggered successfully!")
            print(f"   Alert ID: {result['alert']['id']}")
            print(f"   Location: {result['alert']['location']}")
            print(f"   Level: {result['alert']['level']}")
            print(f"   Risk Score: {result['alert']['riskScore']*100:.0f}%")
            print(f"   Alert URL: {result['alert']['url']}")
            print(f"   Broadcast to {result['broadcast']['webSocketClients']} clients")
            
            return result
        
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to trigger alert: {e}")
            raise
    
    def trigger_mobile_alert(self, alert_url: str) -> bool:
        """
        Trigger alert on connected Android phone via ADB
        
        Args:
            alert_url: Full URL to emergency alert page
        
        Returns:
            True if successful
        """
        try:
            # Check ADB
            result = subprocess.run(['adb', 'version'], capture_output=True)
            if result.returncode != 0:
                print("⚠️  ADB not available")
                return False
            
            # Get devices
            result = subprocess.run(['adb', 'devices'], capture_output=True, text=True)
            devices = [line.split('\t')[0] for line in result.stdout.split('\n')[1:] 
                      if line.strip() and 'device' in line]
            
            if not devices:
                print("⚠️  No ADB devices connected")
                return False
            
            device = devices[0]
            print(f"📱 Using device: {device}")
            
            # Wake screen
            print("📱 Waking up screen...")
            subprocess.run(['adb', '-s', device, 'shell', 'input', 'keyevent', '26'], 
                          capture_output=True)
            subprocess.run(['adb', '-s', device, 'shell', 'input', 'keyevent', '82'], 
                          capture_output=True)
            time.sleep(0.5)
            
            # Vibrate
            print("📳 Vibrating phone...")
            subprocess.run(['adb', '-s', device, 'shell', 'input', 'keyevent', 'KEYCODE_VIBRATE'],
                          capture_output=True)
            
            # Open URL
            print(f"📲 Opening alert: {alert_url}")
            subprocess.run([
                'adb', '-s', device, 'shell', 'am', 'start',
                '-a', 'android.intent.action.VIEW',
                '-d', alert_url
            ], capture_output=True)
            
            print("✅ Alert opened on phone successfully!")
            return True
        
        except FileNotFoundError:
            print("❌ ADB not found. Install Android SDK Platform Tools")
            return False
        except Exception as e:
            print(f"❌ Failed to trigger mobile alert: {e}")
            return False
    
    def trigger_from_model_prediction(
        self,
        prediction: Dict
    ) -> Optional[Dict]:
        """
        Trigger alert from ML model prediction
        Automatically triggers if risk_score >= 0.75 or level is HIGH/CRITICAL
        
        Args:
            prediction: Model prediction dict with required fields
        
        Returns:
            Alert result or None if not triggered
        """
        risk_score = prediction.get('risk_score', 0)
        level = prediction.get('level', 'LOW').upper()
        
        # Check if alert should be triggered
        should_trigger = (
            risk_score >= 0.75 or 
            level in ['HIGH', 'CRITICAL', 'EXTREME']
        )
        
        if not should_trigger:
            print(f"ℹ️  Risk score {risk_score:.2f} / Level {level} - No alert triggered")
            return None
        
        print(f"🚨 HIGH RISK DETECTED: Score={risk_score:.2f}, Level={level}")
        print("   Triggering emergency alert...")
        
        # Trigger alert
        result = self.trigger_alert(
            location=prediction.get('location', 'Unknown Location'),
            risk_score=risk_score,
            level=level,
            coordinates=prediction.get('coordinates'),
            factors=prediction.get('factors', []),
            evacuation_direction=prediction.get('evacuation_direction'),
            district_id=prediction.get('district_id'),
            recipient_phone=prediction.get('recipient_phone')
        )
        
        # Try to open on mobile if available
        if result and result.get('alert', {}).get('url'):
            self.trigger_mobile_alert(result['alert']['url'])
        
        return result


def main():
    """Command line usage"""
    if len(sys.argv) < 3:
        print("Usage: python trigger_alert.py <location> <risk_score> [level]")
        print("\nExample:")
        print("  python trigger_alert.py 'Cherrapunji, Meghalaya' 0.89 CRITICAL")
        print("\nOr with full prediction:")
        print("  python trigger_alert.py --from-json prediction.json")
        sys.exit(1)
    
    alert_system = EmergencyAlertSystem()
    
    if sys.argv[1] == '--from-json':
        # Load from JSON file
        with open(sys.argv[2], 'r') as f:
            prediction = json.load(f)
        result = alert_system.trigger_from_model_prediction(prediction)
    else:
        # Command line arguments
        location = sys.argv[1]
        risk_score = float(sys.argv[2])
        level = sys.argv[3] if len(sys.argv) > 3 else 'HIGH'
        
        result = alert_system.trigger_alert(
            location=location,
            risk_score=risk_score,
            level=level,
            factors=[
                {'name': 'Model Prediction', 'value': risk_score * 100, 
                 'unit': '%', 'severity': level}
            ]
        )
        
        if result:
            alert_system.trigger_mobile_alert(result['alert']['url'])


if __name__ == '__main__':
    main()
