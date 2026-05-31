import React, { useState, useEffect } from 'react';
import { Play, Square, Sliders, Cpu, Activity, Coins, ShieldAlert, Zap, Layers, RefreshCw, Radio, Link } from 'lucide-react';
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
  
  // Real-Time Backend Connection States
  const [isBackendActive, setIsBackendActive] = useState(false);
  const [backendConfigured, setBackendConfigured] = useState(false);
  
  // Cyber Shields & Telemetry Intercept States
  const [isManualMode, setIsManualMode] = useState(false);
  const [strictFirewall, setStrictFirewall] = useState(false);
  const [ddosActive, setDdosActive] = useState(false);
  const [gcActive, setGcActive] = useState(false);
  const [virtualHeapUsage, setVirtualHeapUsage] = useState(0); 
  
  // Simulation accumulated data states
  const [simulationLogs, setSimulationLogs] = useState([]);
  const [virtualFS, setVirtualFS] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  
  // Real-time telemetry values
  const [metrics, setMetrics] = useState({ tokens: 0, cpu: 0, cost: 0.00, security: 100 });
  const [activeAgent, setActiveAgent] = useState(null);
  const [activeStatus, setActiveStatus] = useState('idle');

  // Health check to check if local Express backend is active
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        if (response.ok) {
          const data = await response.json();
          setIsBackendActive(true);
          setBackendConfigured(data.api_configured);
          console.log("⚡ [AETHER_SWARM BACKEND] Online.");
        }
      } catch (e) {
        setIsBackendActive(false);
        console.log("📡 [AETHER_SWARM BACKEND] Offline. Running on local simulator fallback.");
      }
    };
    checkBackendHealth();
    // Run health check every 5 seconds
    const interval = setInterval(checkBackendHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Triggered when running simulation (Mock Fallback Engine)
  useEffect(() => {
    let timer = null;
    // Only run simulated ticks if backend is offline or if running standard non-custom templates
    if (isRunning && !isManualMode && !isBackendActive) {
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

          // Update telemetry metrics (with conditional modifications if DDoS is active)
          setMetrics(prev => {
            const baseSecurity = step.metrics.security;
            return {
              tokens: ddosActive ? prev.tokens + 15200 : step.metrics.tokens,
              cpu: ddosActive ? 94 : step.metrics.cpu,
              cost: ddosActive ? prev.cost + 0.12 : step.metrics.cost,
              security: baseSecurity
            };
          });

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
  }, [isRunning, selectedBlueprintKey, simSpeed, currentStepIdx, isManualMode, ddosActive, isBackendActive]);

  // DDoS Telemetry cost and token burst accumulator loop
  useEffect(() => {
    let ddosInterval = null;
    if (ddosActive && isRunning) {
      haptic.setHumIntensity(true);
      ddosInterval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          tokens: prev.tokens + Math.floor(Math.random() * 8500) + 4000,
          cost: prev.cost + Math.random() * 0.08 + 0.03,
          cpu: Math.floor(Math.random() * 8) + 90 // Spikes CPU load
        }));
        haptic.playClick(1000, 0.005);
      }, 500);
    }
    return () => {
      if (ddosInterval) clearInterval(ddosInterval);
    };
  }, [ddosActive, isRunning]);

  // Real-Time Gemini AI Server-Sent Events stream reader
  const handleRealAISwarm = async (prompt) => {
    haptic.init();
    haptic.setHumIntensity(true);

    try {
      const response = await fetch('http://localhost:3001/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Server execution failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialChunk = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        partialChunk += decoder.decode(value, { stream: true });
        const lines = partialChunk.split('\n');
        partialChunk = lines.pop(); // Keep partial line for next iteration

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const rawContent = trimmed.substring(6).trim();
            if (rawContent === '[DONE]') {
              setIsRunning(false);
              haptic.playChime();
              haptic.setHumIntensity(false);
              setActiveAgent(null);
              break;
            }

            const step = JSON.parse(rawContent);

            // Trigger visual transitions
            setActiveAgent(step.agent);
            setActiveStatus(step.status);
            
            if (step.status === 'error') {
              haptic.playWarning();
            } else {
              haptic.playClick(1500, 0.005);
            }

            // Sync simulation logs
            setSimulationLogs(prev => [...prev, step]);

            // Sync virtual workspace code edits
            if (step.virtualFS) {
              setVirtualFS(step.virtualFS);
              const firstFile = Object.keys(step.virtualFS)[0];
              if (firstFile) setActiveFile(firstFile);
            } else if (step.codeFile && step.codeContent) {
              setVirtualFS(prev => ({
                ...prev,
                [step.codeFile]: step.codeContent
              }));
              setActiveFile(step.codeFile);
            }

            // Sync system metrics
            if (step.metrics) {
              setMetrics(prev => {
                return {
                  tokens: ddosActive ? prev.tokens + 14800 : step.metrics.tokens,
                  cpu: ddosActive ? 95 : step.metrics.cpu,
                  cost: ddosActive ? prev.cost + 0.11 : step.metrics.cost,
                  security: step.metrics.security
                };
              });
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
      haptic.playWarning();
      setSimulationLogs(prev => [...prev, {
        agent: 'auditor',
        status: 'error',
        log: `[REAL-AI SWITCH ERROR] Could not execute real pipeline.\nDetail: ${e.message}`
      }]);
      setIsRunning(false);
    }
  };

  const handleStartSimulation = () => {
    haptic.init();
    haptic.playClick(2000, 0.015);
    
    // Check firewall rule for prompt injections
    if (strictFirewall && selectedBlueprintKey === 'CUSTOM' && customPrompt) {
      const suspicious = ['eval', 'exec', 'drop', 'delete', 'inject', 'hack', 'rm -rf', 'destroy', 'vulnerability', 'exploit'];
      const hasThreat = suspicious.some(word => customPrompt.toLowerCase().includes(word));
      
      if (hasThreat) {
        haptic.playWarning();
        setSimulationLogs([
          {
            agent: 'auditor',
            status: 'error',
            log: `[EDGE VALIDATION FIREWALL SHIELD] INTERCEPT TRIGGERED!\nThreat identified in query prompt: "${customPrompt}"\nReason: Prompt matches Command Injection / Remote Code Execution vector check.\nResult: Session closed, query neutralized instantly. Swarm execution aborted successfully.`
          }
        ]);
        setMetrics({ tokens: 0, cpu: 98, cost: 0.00, security: 100 });
        setActiveAgent('auditor');
        setActiveStatus('error');
        setIsRunning(false);
        return;
      }
    }

    // Reset simulation pipeline
    setSimulationLogs([]);
    setVirtualFS({});
    setActiveFile(null);
    setCurrentStepIdx(-1);
    setMetrics({ tokens: 0, cpu: 0, cost: 0.00, security: 100 });
    
    if (isManualMode) {
      // Manual mode initialization log
      setSimulationLogs([
        {
          agent: 'architect',
          status: 'success',
          log: `[MANUAL CONTROL STATE ACTIVE] Swarm running on user-directed operations. Click agent nodes in the visual network above to compile custom processes.`
        }
      ]);
      setMetrics({ tokens: 0, cpu: 2, cost: 0.00, security: 100 });
      setIsRunning(true);
      return;
    }

    // If backend is active and running a Custom Prompt, drive using Gemini API!
    if (isBackendActive && backendConfigured && selectedBlueprintKey === 'CUSTOM' && customPrompt) {
      setIsRunning(true);
      handleRealAISwarm(customPrompt);
    } else {
      // Run normal client-side simulation
      setIsRunning(true);
    }
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

  // 1. DDoS Toggle Action
  const handleToggleDdos = (checked) => {
    haptic.init();
    if (checked) {
      haptic.playWarning();
      setDdosActive(true);
      setSimulationLogs(prev => [...prev, {
        agent: 'auditor',
        status: 'error',
        log: `[ALARM] DDoS SURGE INTRUSION SIMULATOR DEPLOYED! \nIncoming traffic load leaping to 95.4k tokens/second. CPU threshold breaching 90% load. Network scrubbers shielding pipeline...`
      }]);
    } else {
      haptic.playClick(1500, 0.01);
      setDdosActive(false);
      setSimulationLogs(prev => [...prev, {
        agent: 'auditor',
        status: 'success',
        log: `[RESOLVED] DDoS surge simulation terminated. Traffic velocity returning to standard thresholds. CPU loads cooling down.`
      }]);
    }
  };

  // 2. Strict Edge Firewall Toggle Action
  const handleToggleFirewall = (checked) => {
    haptic.init();
    haptic.playClick(checked ? 2200 : 1200, 0.01);
    setStrictFirewall(checked);
    setSimulationLogs(prev => [...prev, {
      agent: 'auditor',
      status: checked ? 'success' : 'idle',
      log: checked 
        ? `[SHIELD ACTIVE] Strict Input validation edge firewall activated. Prompt injection exploits (eval, exec, drop) will be blocked at the outer boundary.`
        : `[WARNING] Strict edge firewall filters offline. System relying fully on standard client audit sweep routines.`
    }]);
  };

  // 3. Manual Node Operations Callback from AgentGraph
  const handleManualAgentAction = (agentId) => {
    if (!isManualMode || !isRunning) {
      haptic.playClick(2100, 0.005);
      return;
    }
    
    haptic.init();
    setActiveAgent(agentId);
    setActiveStatus('thinking');

    setTimeout(() => {
      setActiveStatus('success');
    }, 650);

    const timeString = new Date().toTimeString().split(' ')[0];

    switch (agentId) {
      case 'architect':
        haptic.playClick(1800, 0.015);
        setSimulationLogs(prev => [...prev, {
          agent: 'architect',
          status: 'success',
          log: `[MANUAL DECK ACTION] Prime-Architect synchronized workspace schema map at ${timeString}. Mapping active parameters.`
        }]);
        setMetrics(prev => ({ ...prev, tokens: prev.tokens + 1200, cpu: 28, cost: prev.cost + 0.024 }));
        break;
      case 'coder':
        haptic.playClick(1500, 0.02);
        setSimulationLogs(prev => [...prev, {
          agent: 'coder',
          status: 'writing',
          log: `[MANUAL DECK ACTION] Sentinel-Code synthesized manual code patch 'manual_block.js' at ${timeString}.`
        }]);
        setVirtualFS(prev => ({
          ...prev,
          'manual_block.js': {
            action: 'add',
            lines: [
              { num: 1, type: 'normal', text: '// User directed manual code patch' },
              { num: 2, type: 'added', text: 'function manualOverrideTask() {' },
              { num: 3, type: 'added', text: '  console.log("Forced telemetry override confirmed");' },
              { num: 4, type: 'added', text: '}' },
              { num: 5, text: 'module.exports = { manualOverrideTask };' }
            ]
          }
        }));
        setActiveFile('manual_block.js');
        setMetrics(prev => ({ ...prev, tokens: prev.tokens + 3100, cpu: 62, cost: prev.cost + 0.062 }));
        break;
      case 'auditor':
        haptic.playWarning();
        setSimulationLogs(prev => [...prev, {
          agent: 'auditor',
          status: 'success',
          log: `[MANUAL DECK ACTION] Cypher-Audit performed forced security CVE sweep on workspace buffers. Vulnerabilities: 0.`
        }]);
        setMetrics(prev => ({ ...prev, tokens: prev.tokens + 1400, cpu: 38, cost: prev.cost + 0.028, security: 100 }));
        break;
      case 'qa':
        haptic.playChime();
        setSimulationLogs(prev => [...prev, {
          agent: 'qa',
          status: 'success',
          log: `[MANUAL DECK ACTION] Nexus-QA executed integration tests. ✔ 6/6 dynamic test scenarios passed perfectly at ${timeString}.`
        }]);
        setMetrics(prev => ({ ...prev, tokens: prev.tokens + 950, cpu: 12, cost: prev.cost + 0.019 }));
        break;
      default:
        break;
    }
  };

  // 4. Garbage Collector Recycle Heap Action
  const handleRunGC = () => {
    haptic.init();
    haptic.playGCSweep();
    setGcActive(true);
    
    // Virtual heap recycle modifier
    setVirtualHeapUsage(12); // Drop heap loading to min values

    setSimulationLogs(prev => [...prev, {
      agent: 'architect',
      status: 'success',
      log: `[GARBAGE COLLECTOR PURGE] Manual system heap flush initialized. Cleared 284.2MB of unreferenced memory allocations. Process memory compacted.`
    }]);

    setTimeout(() => {
      setGcActive(false);
      setVirtualHeapUsage(0); // Restore normal dynamics
    }, 2000);
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
            <p style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              SHAGUN_OS v3.5 // AGENTIC SIMULATOR ENGINE ACTIVE 
              {isBackendActive ? (
                <span style={{ color: 'var(--color-green)', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  ● REAL-TIME AI CORE: {backendConfigured ? 'ONLINE (GEMINI)' : 'KEY MISSING'}
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  ○ LOCAL REPLICATOR ACTIVE (MOCK FALLBACK)
                </span>
              )}
            </p>
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
                <option value="CUSTOM">Custom Orchestration Prompt Blueprint {isBackendActive && '(Real AI API)'}</option>
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
                  placeholder={isBackendActive ? "e.g. Optimize Postgres query, Audit smart contract..." : "e.g. Create simple router gateway..."}
                  className="input-tech"
                />
              </div>
            )}

            {/* Action Buttons & Simulation Speed slider */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center' }}>
              {/* Simulation speed slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', justifyContext: 'space-between', fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
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
                  disabled={isRunning && isBackendActive && selectedBlueprintKey === 'CUSTOM'}
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

          {/* Interactive Cyber Shield Controls Deck */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Radio size={14} className="text-amber animate-pulse" />
              <span style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-secondary)' }}>
                DIAGNOSTICS & CYBER SHIELDS:
              </span>
            </div>
            
            {/* DDoS surge simulator */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={ddosActive} 
                onChange={(e) => handleToggleDdos(e.target.checked)}
                style={{ accentColor: 'var(--color-amber)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: ddosActive ? 'var(--color-red)' : 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Zap size={12} /> DDoS SURGE ACCELERATOR
              </span>
            </label>

            {/* Edge firewall filter */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={strictFirewall} 
                onChange={(e) => handleToggleFirewall(e.target.checked)}
                style={{ accentColor: 'var(--color-amber)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: strictFirewall ? 'var(--color-green)' : 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <ShieldAlert size={12} /> EDGE FIREWALL SHIELD
              </span>
            </label>

            {/* Manual Override control mode */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={isManualMode} 
                onChange={(e) => {
                  haptic.playClick(2100, 0.01);
                  setIsManualMode(e.target.checked);
                  handleResetWorkspace();
                }}
                disabled={isBackendActive && isRunning}
                style={{ accentColor: 'var(--color-amber)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: isManualMode ? 'var(--color-gold)' : 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Cpu size={12} /> MANUAL OVERRIDE DECK
              </span>
            </label>

            {/* Manual Garbage collector recycle button */}
            <button 
              onClick={handleRunGC}
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.8rem',
                fontSize: '0.7rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: 'auto',
                borderColor: 'var(--color-amber-glow)',
                color: 'var(--color-amber-bright)',
                background: 'rgba(255, 140, 0, 0.03)'
              }}
            >
              <RefreshCw size={12} className={gcActive ? 'animate-spin' : ''} /> PURGE SYSTEM HEAP (GC)
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="dashboard-grid">
        {/* Left Side: Agent Topology Map & Logging thought feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AgentGraph 
            activeAgent={activeAgent} 
            activeStatus={activeStatus} 
            isManualMode={isManualMode}
            onManualAction={handleManualAgentAction}
          />
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
            <TelemetryCharts 
              isRunning={isRunning} 
              currentMetrics={metrics} 
              ddosActive={ddosActive}
              heapOverride={virtualHeapUsage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
