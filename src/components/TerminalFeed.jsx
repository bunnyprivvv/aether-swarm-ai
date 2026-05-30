import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Copy } from 'lucide-react';
import { haptic } from '../utils/HapticController';

export default function TerminalFeed({ logs = [] }) {
  const [filter, setFilter] = useState('all');
  const [typedLogs, setTypedLogs] = useState([]);
  const terminalEndRef = useRef(null);

  // Filter logs based on selection
  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.agent === filter;
  });

  // Handle auto-scroll to the bottom when new logs arrive
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, filter]);

  // Clean log text triggers clicks or warning sounds on update
  useEffect(() => {
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      if (lastLog.status === 'error') {
        haptic.playWarning();
      } else {
        haptic.playClick(1400, 0.005);
      }
    }
  }, [logs]);

  const handleCopyLogs = () => {
    haptic.playClick(2400, 0.01);
    const text = logs.map(l => `[${l.agent.toUpperCase()}] ${l.log}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const getAgentStyles = (agent, status) => {
    if (status === 'error') return { color: 'var(--color-red)', tag: 'CRITICAL AUDIT EXPLOIT DETECTED' };
    switch (agent) {
      case 'architect':
        return { color: 'var(--color-amber)', tag: 'PRIME-ARCHITECT PLANNING CORE' };
      case 'coder':
        return { color: '#06b6d4', tag: 'SENTINEL-CODE SYNTHESIZER' };
      case 'auditor':
        return { color: 'var(--color-green)', tag: 'CYPHER-AUDIT SECURITY SCANNER' };
      case 'qa':
        return { color: '#ffbe0b', tag: 'NEXUS-QA VERIFIER' };
      default:
        return { color: 'var(--text-secondary)', tag: 'SYSTEM AGENT' };
    }
  };

  return (
    <div className="tech-card" style={{ height: '390px', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="panel-header" style={{ marginBottom: '0.75rem' }}>
        <h3 className="panel-title">
          <Terminal size={16} className="text-amber" />
          Swarm Cogitation Stream (Telemetry)
        </h3>
        <button 
          onClick={handleCopyLogs}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}
          className="hover:text-white"
        >
          <Copy size={12} /> COPY FLOW
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem', overflowX: 'auto' }}>
        {['all', 'architect', 'coder', 'auditor', 'qa'].map(tab => (
          <button
            key={tab}
            onClick={() => { haptic.playClick(2000, 0.008); setFilter(tab); }}
            style={{
              padding: '0.2rem 0.6rem',
              background: filter === tab ? 'var(--color-amber-dim)' : 'transparent',
              border: `1px solid ${filter === tab ? 'var(--color-amber)' : 'rgba(255,255,255,0.04)'}`,
              color: filter === tab ? '#fff' : 'var(--text-secondary)',
              borderRadius: '4px',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Terminal Viewport */}
      <div 
        style={{
          flex: 1,
          background: '#040508',
          border: '1px solid rgba(255,255,255,0.02)',
          borderRadius: '6px',
          padding: '0.8rem',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          lineHeight: '1.4',
          color: '#e2e8f0',
          position: 'relative'
        }}
      >
        <div className="scanlines" />

        {filteredLogs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', fontStyle: 'italic' }}>
            Awaiting prompt initialization... Terminal offline.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {filteredLogs.map((log, index) => {
              const meta = getAgentStyles(log.agent, log.status);
              return (
                <div key={index} style={{ borderLeft: `2px solid ${meta.color}`, paddingLeft: '0.5rem', background: 'rgba(255,255,255,0.01)', borderRadius: '0 4px 4px 0', padding: '0.3rem 0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'between', fontSize: '0.65rem', marginBottom: '0.2rem', opacity: 0.8 }}>
                    <span style={{ color: meta.color, fontWeight: 'bold', textTransform: 'uppercase' }}>
                      [{meta.tag}]
                    </span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '0.6rem' }}>
                      ST-T{index + 1}
                    </span>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', color: log.status === 'error' ? 'var(--color-red)' : '#fff' }}>
                    {log.log}
                  </div>
                </div>
              );
            })}
            <div className="blink-cursor" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.2rem' }}>
              $ swarm_observability_relay --listen
            </div>
            <div ref={terminalEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
