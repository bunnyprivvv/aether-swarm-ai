import React, { useState } from 'react';
import { Network, ShieldAlert, Cpu, Award, Zap } from 'lucide-react';
import { haptic } from '../utils/HapticController';

export default function AgentGraph({ activeAgent, activeStatus }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  // Nodes arrangement coordinates in percentage
  const nodes = [
    {
      id: 'architect',
      name: 'Prime-Architect',
      role: 'Orchestrator Core',
      icon: Network,
      x: 50,
      y: 20,
      color: '#ff8c00',
      specs: { heap: '184MB', temp: '42°C', thread: 'Core-0' }
    },
    {
      id: 'coder',
      name: 'Sentinel-Code',
      role: 'Synthesizer Engine',
      icon: Cpu,
      x: 20,
      y: 60,
      color: '#06b6d4',
      specs: { heap: '312MB', temp: '54°C', thread: 'Core-1' }
    },
    {
      id: 'auditor',
      name: 'Cypher-Audit',
      role: 'Security Gateway',
      icon: ShieldAlert,
      x: 80,
      y: 60,
      color: '#10b981',
      specs: { heap: '142MB', temp: '38°C', thread: 'Core-2' }
    },
    {
      id: 'qa',
      name: 'Nexus-QA',
      role: 'Validation Console',
      icon: Award,
      x: 50,
      y: 85,
      color: '#ffbe0b',
      specs: { heap: '98MB', temp: '36°C', thread: 'Core-3' }
    }
  ];

  const handleNodeClick = (nodeId) => {
    haptic.init();
    haptic.playClick(2200, 0.01);
  };

  const handleNodeMouseEnter = (nodeId) => {
    haptic.init();
    haptic.playClick(3000, 0.005);
    setHoveredNode(nodeId);
  };

  return (
    <div className="tech-card" style={{ height: '420px', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <h3 className="panel-title">
          <Network size={16} className="text-amber" />
          Live Swarm Node Topology
        </h3>
        <span className="panel-subtitle">60FPS VECTOR RELAY ACTIVE</span>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
        {/* SVG connection lines */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="grad-arch-coder" x1="50%" y1="20%" x2="20%" y2="60%">
              <stop offset="0%" stopColor="#ff8c00" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="grad-arch-auditor" x1="50%" y1="20%" x2="80%" y2="60%">
              <stop offset="0%" stopColor="#ff8c00" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="grad-coder-auditor" x1="20%" y1="60%" x2="80%" y2="60%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="grad-auditor-qa" x1="80%" y1="60%" x2="50%" y2="85%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffbe0b" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="grad-qa-arch" x1="50%" y1="85%" x2="50%" y2="20%">
              <stop offset="0%" stopColor="#ffbe0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ff8c00" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Static Paths */}
          <line x1="50%" y1="20%" x2="20%" y2="60%" stroke="url(#grad-arch-coder)" strokeWidth="1.5" />
          <line x1="50%" y1="20%" x2="80%" y2="60%" stroke="url(#grad-arch-auditor)" strokeWidth="1.5" />
          <line x1="20%" y1="60%" x2="80%" y2="60%" stroke="url(#grad-coder-auditor)" strokeWidth="1.5" />
          <line x1="80%" y1="60%" x2="50%" y2="85%" stroke="url(#grad-auditor-qa)" strokeWidth="1.5" />
          <line x1="50%" y1="85%" x2="50%" y2="20%" stroke="url(#grad-qa-arch)" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Animated packets (glowing dots traversing paths when simulation is active) */}
          {activeAgent && (
            <>
              {/* Architect -> Coder */}
              {activeAgent === 'architect' && (
                <circle r="4" fill="#ff8c00" filter="drop-shadow(0 0 6px #ff8c00)">
                  <animateMotion dur="1.5s" repeatCount="indefinite" path="M 250,80 L 100,240" />
                </circle>
              )}
              {/* Coder -> Auditor */}
              {activeAgent === 'coder' && (
                <circle r="4" fill="#06b6d4" filter="drop-shadow(0 0 6px #06b6d4)">
                  <animateMotion dur="1.5s" repeatCount="indefinite" path="M 100,240 L 400,240" />
                </circle>
              )}
              {/* Auditor -> Coder or Auditor -> QA */}
              {activeAgent === 'auditor' && (
                <>
                  <circle r="4" fill="#10b981" filter="drop-shadow(0 0 6px #10b981)">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path="M 400,240 L 100,240" />
                  </circle>
                  <circle r="4" fill="#10b981" filter="drop-shadow(0 0 6px #10b981)">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path="M 400,240 L 250,340" />
                  </circle>
                </>
              )}
              {/* QA -> Architect */}
              {activeAgent === 'qa' && (
                <circle r="4" fill="#ffbe0b" filter="drop-shadow(0 0 6px #ffbe0b)">
                  <animateMotion dur="2s" repeatCount="indefinite" path="M 250,340 L 250,80" />
                </circle>
              )}
            </>
          )}
        </svg>

        {/* Nodes overlay */}
        {nodes.map((node) => {
          const isActive = activeAgent === node.id;
          const isHovered = hoveredNode === node.id;
          const Icon = node.icon;

          return (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              onMouseEnter={() => handleNodeMouseEnter(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{
                position: 'absolute',
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 10
              }}
            >
              {/* Node Circular Indicator */}
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'var(--bg-secondary)',
                  border: `2px solid ${isActive ? node.color : 'var(--border-color)'}`,
                  boxShadow: isActive ? `0 0 20px ${node.color}cc` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                }}
                className={isActive ? 'pulsing-node' : ''}
              >
                <Icon size={20} style={{ color: isActive ? node.color : 'var(--text-secondary)' }} />
                
                {/* Node Active LED status marker */}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: activeStatus === 'error' ? 'var(--color-red)' : 'var(--color-green)',
                      boxShadow: `0 0 8px ${activeStatus === 'error' ? 'var(--color-red)' : 'var(--color-green)'}`,
                      border: '1px solid #000'
                    }}
                  />
                )}
              </div>

              {/* Node Title Overlay */}
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  marginTop: '0.4rem',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: 'rgba(10,12,16,0.9)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.03)',
                  whiteSpace: 'nowrap'
                }}
              >
                {node.name}
              </span>

              {/* Micro-Telemetry Tooltip on Hover */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    top: '60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '130px',
                    background: 'rgba(17, 21, 29, 0.95)',
                    border: `1px solid ${node.color}`,
                    borderRadius: '6px',
                    padding: '0.5rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    zIndex: 20
                  }}
                >
                  <div style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '2px', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    Telemetry
                  </div>
                  <div>THREAD: {node.specs.thread}</div>
                  <div>HEAP: {node.specs.heap}</div>
                  <div>TEMP: {node.specs.temp}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px', color: node.color }}>
                    <Zap size={8} /> STABLE RELAY
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
