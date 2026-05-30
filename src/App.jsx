import React from 'react';
import SwarmDashboard from './components/SwarmDashboard';
import './App.css';

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Upper technical noise banner overlay */}
      <div 
        style={{
          background: 'rgba(255, 140, 0, 0.03)',
          borderBottom: '1px solid rgba(255, 140, 0, 0.1)',
          padding: '0.4rem 1.5rem',
          fontSize: '0.65rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          letterSpacing: '0.05em'
        }}
      >
        <span>QUANTUM_SYSTEM_NODE: SHAGUN_ENG_PORTFOLIO_HQ</span>
        <span style={{ color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-green)', boxShadow: '0 0 6px var(--color-green)' }} />
          RELAY STREAM SECURE
        </span>
      </div>

      <main style={{ flex: 1, padding: '2rem 1.5rem 3rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        <SwarmDashboard />
      </main>

      {/* Technical Footer */}
      <footer 
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: '1.25rem',
          textAlign: 'center',
          fontSize: '0.7rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          background: 'rgba(5, 7, 10, 0.8)'
        }}
      >
        <p>© 2026 SHAGUN_OS // AETHER_SWARM PROTOCOL // ALL CHANNELS ENCRYPTED</p>
      </footer>
    </div>
  );
}

export default App;
