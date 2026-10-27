/**
 * SignalMesh AI - Emergency Alert Modal
 * Zero-login, high-priority emergency alert system
 * Features: Audio siren, visual alerts, instant actions
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Phone, MapPin, Navigation, Share2, CheckCircle, X } from 'lucide-react';

export default function EmergencyAlert() {
  const [searchParams] = useSearchParams();
  const [alertData, setAlertData] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [sirenActive, setSirenActive] = useState(true);
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Parse alert data from URL params or fetch from API
  useEffect(() => {
    const alertId = searchParams.get('id');
    const location = searchParams.get('location');
    const riskScore = searchParams.get('risk_score');
    const level = searchParams.get('level');

    if (alertId) {
      // Fetch from API
      fetchAlertData(alertId);
    } else if (location && riskScore) {
      // Use URL params directly
      setAlertData({
        id: Date.now().toString(),
        location: location || 'Unknown Location',
        coordinates: {
          lat: parseFloat(searchParams.get('lat')) || 0,
          lng: parseFloat(searchParams.get('lng')) || 0
        },
        riskScore: parseFloat(riskScore) || 0,
        level: level || 'HIGH',
        factors: parseFactors(searchParams.get('factors')),
        timestamp: new Date().toISOString(),
        evacuationDirection: searchParams.get('evacuation') || 'Move to higher ground immediately'
      });
    } else {
      // Demo alert
      setAlertData({
        id: 'DEMO_' + Date.now(),
        location: 'Cherrapunji, Meghalaya',
        coordinates: { lat: 25.2639, lng: 91.7320 },
        riskScore: 0.89,
        level: 'CRITICAL',
        factors: [
          { name: 'Rainfall', value: 285, unit: 'mm', severity: 'EXTREME' },
          { name: 'Soil Saturation', value: 95, unit: '%', severity: 'CRITICAL' },
          { name: 'Terrain Slope', value: 78, unit: '°', severity: 'HIGH' },
          { name: 'Seismic Activity', value: 4.2, unit: 'ML', severity: 'MODERATE' }
        ],
        timestamp: new Date().toISOString(),
        evacuationDirection: 'EVACUATE IMMEDIATELY - Move to designated safe zone at Community Center, 2.3 km North'
      });
    }
  }, [searchParams]);

  // Initialize audio siren
  useEffect(() => {
    if (!alertData || !sirenActive) return;

    try {
      // Create Web Audio API context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Create oscillator and gain nodes
      oscillatorRef.current = audioContextRef.current.createOscillator();
      gainNodeRef.current = audioContextRef.current.createGain();

      // Configure oscillator (850 Hz emergency siren)
      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.frequency.setValueAtTime(850, audioContextRef.current.currentTime);

      // Configure gain (volume)
      gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);

      // Connect audio graph
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);

      // Start oscillator
      oscillatorRef.current.start();

      // Pulse pattern (0.5s on, 0.5s off)
      let isPulsing = true;
      const pulseInterval = setInterval(() => {
        if (!audioContextRef.current) return;
        
        const now = audioContextRef.current.currentTime;
        if (isPulsing) {
          gainNodeRef.current.gain.setValueAtTime(0.3, now);
          gainNodeRef.current.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        }
        isPulsing = !isPulsing;
      }, 500);

      // Cleanup
      return () => {
        clearInterval(pulseInterval);
        if (oscillatorRef.current) {
          try {
            oscillatorRef.current.stop();
          } catch (e) {
            // Already stopped
          }
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
    } catch (error) {
      console.error('Audio siren initialization failed:', error);
    }
  }, [alertData, sirenActive]);

  const fetchAlertData = async (alertId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/alerts/${alertId}`);
      const data = await response.json();
      if (data.success) {
        setAlertData(data.alert);
      }
    } catch (error) {
      console.error('Failed to fetch alert:', error);
    }
  };

  const parseFactors = (factorsStr) => {
    if (!factorsStr) return [];
    try {
      return JSON.parse(decodeURIComponent(factorsStr));
    } catch {
      return [];
    }
  };

  const stopSiren = () => {
    setSirenActive(false);
  };

  const handleAcknowledge = async () => {
    setAcknowledged(true);
    stopSiren();
    
    // Send acknowledgment to backend
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/alerts/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: alertData.id,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Acknowledgment failed:', error);
    }
  };

  const handleCallEmergency = () => {
    // Emergency numbers for India
    window.location.href = 'tel:112'; // Single Emergency Number in India
  };

  const handleShareAlert = async () => {
    const shareUrl = window.location.href;
    const shareText = `🚨 EMERGENCY ALERT: ${alertData.level} Risk at ${alertData.location}\nRisk Score: ${(alertData.riskScore * 100).toFixed(0)}%\n${alertData.evacuationDirection}\n\nView Alert: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency Alert - SignalMesh AI',
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        // User cancelled or share failed
        fallbackShare(shareText);
      }
    } else {
      fallbackShare(shareText);
    }
  };

  const fallbackShare = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Alert link copied to clipboard!');
    } else {
      prompt('Copy this alert link:', text);
    }
  };

  const getSeverityColor = (level) => {
    switch (level) {
      case 'CRITICAL':
      case 'EXTREME':
        return 'bg-red-600';
      case 'HIGH':
        return 'bg-orange-600';
      case 'MODERATE':
        return 'bg-yellow-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getFactorSeverityColor = (severity) => {
    switch (severity) {
      case 'EXTREME':
        return 'text-red-500';
      case 'CRITICAL':
        return 'text-orange-500';
      case 'HIGH':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  if (!alertData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading emergency alert...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Pulsing background animation */}
      {!acknowledged && (
        <div 
          className="absolute inset-0 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, rgba(0,0,0,0.9) 70%)',
            animation: 'pulse-red 1s ease-in-out infinite'
          }}
        />
      )}

      {/* Alert Container */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Emergency Banner */}
        <div className={`${getSeverityColor(alertData.level)} text-white text-center py-4 px-6 rounded-t-2xl shadow-2xl ${!acknowledged ? 'animate-pulse-fast' : ''}`}>
          <div className="flex items-center justify-center gap-3 mb-2">
            <AlertTriangle className="h-8 w-8 animate-bounce" />
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
              {alertData.level} RISK ALERT
            </h1>
            <AlertTriangle className="h-8 w-8 animate-bounce" />
          </div>
          <p className="text-sm md:text-base font-semibold opacity-90">
            IMMEDIATE ACTION REQUIRED
          </p>
        </div>

        {/* Alert Content */}
        <div className="bg-gray-800 text-white p-6 md:p-8 shadow-2xl rounded-b-2xl">
          {/* Siren Control */}
          {sirenActive && !acknowledged && (
            <button
              onClick={stopSiren}
              className="absolute top-6 right-6 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition"
              title="Stop Siren"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Location & Coordinates */}
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-3">
              <MapPin className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-1">{alertData.location}</h2>
                <p className="text-gray-400 text-sm">
                  📍 {alertData.coordinates.lat.toFixed(4)}°N, {alertData.coordinates.lng.toFixed(4)}°E
                </p>
                <p className="text-gray-400 text-sm">
                  🕐 {new Date(alertData.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Risk Score */}
          <div className="mb-6 p-4 bg-gray-900 rounded-lg border-2 border-red-500">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">REAL-TIME RISK SCORE</p>
              <p className="text-5xl md:text-6xl font-black text-red-500">
                {(alertData.riskScore * 100).toFixed(0)}%
              </p>
              <p className="text-gray-300 text-sm mt-2">
                Confidence: HIGH | Model: AI/ML v2.0
              </p>
            </div>
          </div>

          {/* Trigger Factors */}
          {alertData.factors && alertData.factors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="text-yellow-500">⚠️</span> Trigger Factors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alertData.factors.map((factor, idx) => (
                  <div key={idx} className="bg-gray-900 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold">{factor.name}</span>
                      <span className={`text-xs font-bold ${getFactorSeverityColor(factor.severity)}`}>
                        {factor.severity}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">{factor.value}</span>
                      <span className="text-sm text-gray-400">{factor.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evacuation Direction */}
          <div className="mb-6 p-4 bg-yellow-900 bg-opacity-30 border-2 border-yellow-500 rounded-lg">
            <div className="flex items-start gap-3">
              <Navigation className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold mb-2 text-yellow-500">EVACUATION INSTRUCTIONS</h3>
                <p className="text-white leading-relaxed">{alertData.evacuationDirection}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={handleCallEmergency}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Phone className="h-5 w-5" />
              Call 112
            </button>
            
            {!acknowledged ? (
              <button
                onClick={handleAcknowledge}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
              >
                <CheckCircle className="h-5 w-5" />
                Acknowledge
              </button>
            ) : (
              <div className="bg-green-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Acknowledged
              </div>
            )}
            
            <button
              onClick={handleShareAlert}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Share2 className="h-5 w-5" />
              Share Alert
            </button>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-3 bg-gray-900 rounded-lg text-center">
            <p className="text-xs text-gray-400">
              SignalMesh AI Emergency Alert System | Alert ID: {alertData.id}
              <br />
              For life-threatening emergencies, call 112 immediately
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-red {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-fast {
          animation: pulse 0.75s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-slow {
          animation: pulse-red 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
