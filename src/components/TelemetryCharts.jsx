import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';

export default function TelemetryCharts({ isRunning, currentMetrics = {}, ddosActive = false, heapOverride = 0 }) {
  const [timeline, setTimeline] = useState([30, 45, 35, 60, 50, 40, 55, 45, 50, 60]);
  const [coreLoads, setCoreLoads] = useState([12, 18, 8, 14]);

  // Fluctuating values when simulation is active
  useEffect(() => {
    if (!isRunning) {
      setCoreLoads([2, 3, 1, 2]);
      return;
    }

    const interval = setInterval(() => {
      // Fluctuate core usage loads
      if (ddosActive) {
        setCoreLoads([
          Math.floor(Math.random() * 8) + 90,
          Math.floor(Math.random() * 6) + 92,
          Math.floor(Math.random() * 12) + 85,
          Math.floor(Math.random() * 10) + 88
        ]);
      } else {
        setCoreLoads([
          Math.floor(Math.random() * 45) + 30,
          Math.floor(Math.random() * 55) + 40,
          Math.floor(Math.random() * 30) + 20,
          Math.floor(Math.random() * 40) + 25
        ]);
      }

      // Shift timeline values slightly (much higher peaks when DDoS is active)
      setTimeline(prev => {
        const next = [...prev.slice(1)];
        const cap = ddosActive ? 95 : 55;
        const base = ddosActive ? 85 : 30;
        next.push(Math.floor(Math.random() * (cap - base)) + base);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, ddosActive]);

  const securityRating = currentMetrics.security || 100;
  
  // Calculate SVG line path coordinates for the throughput chart
  const points = timeline.map((val, idx) => `${idx * 22},${70 - (val / 100) * 60}`).join(' ');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', width: '100%' }}>
      {/* 1. Token Throughput Chart */}
      <div className="tech-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          <Activity size={14} className="text-amber" />
          TOKEN THROUGHPUT INDEX
        </div>
        <div style={{ flex: 1, height: '70px', position: 'relative', overflow: 'hidden' }}>
          <svg style={{ width: '100%', height: '100%' }}>
            {/* Grid Lines */}
            <line x1="0" y1="10" x2="220" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="40" x2="220" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="70" x2="220" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            
            {/* Line Path */}
            <polyline
              fill="none"
              stroke="var(--color-amber)"
              strokeWidth="2"
              points={points}
              filter="drop-shadow(0 0 4px rgba(255,140,0,0.3))"
            />
          </svg>
        </div>
        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
          <span>VELOCITY: {ddosActive ? '95.4k tokens/s' : isRunning ? '4.8k tokens/s' : '0.0k tokens/s'}</span>
          <span>99.98% ACC</span>
        </div>
      </div>

      {/* 2. Security Shield Gauge */}
      <div className="tech-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          <ShieldAlert size={14} className="text-amber" />
          SWARM CVE DENSE RATING
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <div style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ position: 'absolute', transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="30" cy="30" r="26" stroke="rgba(255,255,255,0.04)" strokeWidth="4" fill="transparent" />
              <circle 
                cx="30" 
                cy="30" 
                r="26" 
                stroke={securityRating === 100 ? 'var(--color-green)' : securityRating < 50 ? 'var(--color-red)' : 'var(--color-gold)'} 
                strokeWidth="4" 
                fill="transparent" 
                strokeDasharray="163" 
                strokeDashoffset={163 - (163 * securityRating) / 100}
                style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease' }}
              />
            </svg>
            <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{securityRating}%</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.62rem', fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: securityRating === 100 ? 'var(--color-green)' : securityRating < 50 ? 'var(--color-red)' : 'var(--color-gold)' }}>
              STATUS: {securityRating === 100 ? 'HARDENED' : securityRating < 50 ? 'EXPLOITED' : 'AUDITING'}
            </div>
            <div>VERIFIER: NEXUS-QA</div>
          </div>
        </div>
      </div>

      {/* 3. Core Processing Units */}
      <div className="tech-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          <Cpu size={14} className="text-amber" />
          CPU CORE DELEGATION LOADS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, justifyContent: 'center' }}>
          {coreLoads.map((load, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '22px', fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>C0{idx}</span>
              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${load}%`, 
                    background: load > 50 ? 'var(--color-amber)' : 'rgba(255,140,0,0.5)',
                    transition: 'width 0.8s ease'
                  }} 
                />
              </div>
              <span style={{ width: '24px', textAlign: 'right', fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{load}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
