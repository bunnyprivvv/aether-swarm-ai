import React, { useState, useEffect } from 'react';
import { Play, Square, Sliders, Cpu, Activity, Coins, ShieldAlert, Zap, Layers, RefreshCw } from 'lucide-react';
import { haptic } from '../utils/HapticController';
import { SwarmBlueprints, generateCustomBlueprint } from '../utils/SwarmSimulationEngine';
import AgentGraph from './AgentGraph';
import TerminalFeed from './TerminalFeed';
import CodeWorkspace from './CodeWorkspace';
import TelemetryCharts from './TelemetryCharts';

export default function SwarmDashboard() {
  // Core states
  const [selectedBlueprintKey, setSelectedBlueprintKey] = useState('SECURE_JWT_AUTH');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [simSpeed, setSimSpeed] = useState(1500); // ms delay
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Simulation accumulated data states
  const [simulationLogs, setSimulationLogs] = useState([]);
  const [virtualFS, setVirtualFS] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  
  // Real-time telemetry values
  const [metrics, setMetrics] = useState({ tokens: 0, cpu: 0, cost: 0.00, security: 100 });
  const [activeAgent, setActiveAgent] = useState(null);
  const [activeStatus, setActiveStatus] = useState('idle');

  // Triggered when running simulation
  useEffect(() => {
    let timer = null;
    if (isRunning) {
      haptic.init();
      haptic.setHumIntensity(true);

      const blueprint = selectedBlueprintKey === 'CUSTOM' 
        ? generateCustomBlueprint(customPrompt || "Compile secure node service") 
        : SwarmBlueprints[selectedBlueprintKey];

      const steps = blueprint.steps;

      // Start tick runner
      const runStep = () => {
        setCurrentStepIdx((prevIdx) => {
          const nextIdx = prevIdx + 1;

          if (nextIdx >= steps.length) {
            // Complete!
            setIsRunning(false);
            haptic.playChime();
            haptic.setHumIntensity(false);
            setActiveAgent(null);
            return prevIdx;
          }

          const step = steps[nextIdx];
          
          // Trigger Agent state shifts
          setActiveAgent(step.agent);
          setActiveStatus(step.status);

          // Update Virtual File system if coder writes or auditor highlights
          if (step.codeFile && step.codeContent) {
            setVirtualFS((prevFS) => ({
              ...prevFS,
              [step.codeFile]: step.codeContent
            }));
            setActiveFile(step.codeFile);
          }

          // Append to log stream
          setSimulationLogs((prevLogs) => [...prevLogs, step]);

          // Update telemetry metrics
          setMetrics(step.metrics);

          return nextIdx;
        });
      };

      // Run initial step immediately
      if (currentStepIdx === -1) {
        runStep();
      }

      timer = setInterval(runStep, simSpeed);
    } else {
      haptic.setHumIntensity(false);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, selectedBlueprintKey, simSpeed, currentStepIdx]);

  const handleStartSimulation = () => {
    haptic.init();
    haptic.playClick(2000, 0.015);
    
    // Reset simulation pipeline
    setSimulationLogs([]);
    setVirtualFS({});
    setActiveFile(null);
    setCurrentStepIdx(-1);
    setMetrics({ tokens: 0, cpu: 0, cost: 0.00, security: 100 });
    
    setIsRunning(true);
  };

  const handleStopSimulation = () => {
    haptic.playClick(1000, 0.02);
    setIsRunning(false);
    setActiveAgent(null);
    setActiveStatus('idle');
  };

  const handleResetWorkspace = () => {
    haptic.playClick(2400, 0.005);
    setIsRunning(false);
    setSimulationLogs([]);
    setVirtualFS({});
    setActiveFile(null);
    setCurrentStepIdx(-1);
    setMetrics({ tokens: 0, cpu: 0, cost: 0.00, security: 100 });
    setActiveAgent(null);
    setActiveStatus('idle');
  };

  const handleBlueprintChange = (e) => {
    haptic.playClick(1800, 0.008);
    setSelectedBlueprintKey(e.target.value);
    handleResetWorkspace();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Console Header Bar */}
      <header className="tech-card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: 'rgba(17,21,29,0.95)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isRunning ? 'var(--color-amber)' : 'rgba(255,140,0,0.2)', boxShadow: isRunning ? '0 0 10px var(--color-amber)' : 'none', animation: isRunning ? 'pulse-amber 2s infinite ease-in-out' : 'none' }} />
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              AETHER_SWARM <span className="text-amber" style={{ fontWeight: 300 }}>// INTEGRATED CONSOLE</span>
            </h1>
            <p style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>SHAGUN_OS v3.5 // AGENTIC SIMULATOR ENGINE ACTIVE</p>
          </div>
        </div>

        {/* Real-time counters panel */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            <Activity size={14} className="text-amber" />
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.58rem' }}>TOKENS INGESTED</div>
              <div style={{ fontWeight: 'bold' }}>{metrics.tokens.toLocaleString()} tk</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            <Coins size={14} className="text-amber" />
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.58rem' }}>ACCUMULATED COST</div>
              <div style={{ fontWeight: 'bold', color: 'var(--color-gold)' }}>${metrics.cost.toFixed(3)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            <Cpu size={14} className="text-amber" />
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.58rem' }}>CPU THREAD UTIL</div>
              <div style={{ fontWeight: 'bold' }}>{isRunning ? `${metrics.cpu}%` : '0%'}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Control Deck Console */}
      <section className="tech-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div className="panel-header" style={{ marginBottom: 0 }}>
          <h3 className="panel-title">
            <Sliders size={16} className="text-amber" />
            Swarm Control Interface Deck
          </h3>
          <span className="panel-subtitle">COMMUNICATIONS PROTOCOL CONFIGURE</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Main Controls row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            {/* Template selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '220px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                SELECT AGENT TASK BLUEPRINT
              </label>
              <select
                value={selectedBlueprintKey}
                onChange={handleBlueprintChange}
                disabled={isRunning}
                className="input-tech"
                style={{ cursor: isRunning ? 'not-allowed' : 'pointer' }}
              >
                <option value="SECURE_JWT_AUTH">Deploy Secure Cryptographic Auth Gateway</option>
                <option value="HEMASCAN_PIPELINE">Optimize HemaScan Pathology Pipeline</option>
                <option value="DECENTRALIZED_PAY">Formulate Decentralized Web3 Transaction Sync</option>
                <option value="CUSTOM">Custom Orchestration Prompt Blueprint</option>
              </select>
            </div>

            {/* Custom Prompt Input (Conditional) */}
            {selectedBlueprintKey === 'CUSTOM' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 2, minWidth: '280px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                  INJECT CUSTOM ORCHESTRATION INSTRUCTIONS
                </label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={isRunning}
                  placeholder="e.g. Optimize Postgres query logs, Compile a model training container..."
                  className="input-tech"
                />
              </div>
            )}

            {/* Action Buttons & Simulation Speed slider */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center' }}>
              {/* Simulation speed slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                  <span>SIM INTERVAL</span>
                  <span>{simSpeed}ms</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="3000"
                  step="100"
                  value={simSpeed}
                  onChange={(e) => setSimSpeed(parseInt(e.target.value))}
                  style={{ width: '120px', cursor: 'ew-resize', accentColor: 'var(--color-amber)' }}
                />
              </div>

              {/* Start Simulation */}
              {!isRunning ? (
                <button 
                  onClick={handleStartSimulation} 
                  className="btn-tech"
                  disabled={selectedBlueprintKey === 'CUSTOM' && !customPrompt.trim()}
                >
                  <Play size={14} /> INITIALIZE PROTOCOL
                </button>
              ) : (
                <button onClick={handleStopSimulation} className="btn-tech" style={{ borderColor: 'var(--color-red)', background: 'rgba(239, 68, 68, 0.05)' }}>
                  <Square size={14} style={{ color: 'var(--color-red)' }} /> TERMINATE SWARM
                </button>
              )}

              {/* Reset */}
              <button onClick={handleResetWorkspace} className="btn-secondary">
                <RefreshCw size={14} /> RESET DECK
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="dashboard-grid">
        {/* Left Side: Agent Topology Map & Logging thought feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AgentGraph activeAgent={activeAgent} activeStatus={activeStatus} />
          <TerminalFeed logs={simulationLogs} />
        </div>

        {/* Right Side: Code Workspace Editor & Live system telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <CodeWorkspace virtualFS={virtualFS} activeFile={activeFile} />
          
          <div className="tech-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '1.2rem' }}>
            <div className="panel-header" style={{ marginBottom: 0, paddingBottom: '0.4rem' }}>
              <h3 className="panel-title" style={{ fontSize: '0.8rem' }}>
                <Layers size={14} className="text-amber" />
                Integrated Swarm Telemetry Diagnostics
              </h3>
            </div>
            <TelemetryCharts isRunning={isRunning} currentMetrics={metrics} />
          </div>
        </div>
      </div>
    </div>
  );
}
