import React, { useState, useEffect } from 'react';
import { FolderCode, FileCode, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { haptic } from '../utils/HapticController';

export default function CodeWorkspace({ virtualFS = {}, activeFile = null }) {
  const [selectedFile, setSelectedFile] = useState(null);

  // Sync selected file with simulation events
  useEffect(() => {
    if (activeFile) {
      setSelectedFile(activeFile);
    } else if (Object.keys(virtualFS).length > 0 && !selectedFile) {
      setSelectedFile(Object.keys(virtualFS)[0]);
    }
  }, [activeFile, virtualFS]);

  const handleFileSelect = (fileName) => {
    haptic.playClick(1900, 0.01);
    setSelectedFile(fileName);
  };

  const fileData = virtualFS[selectedFile] || null;

  return (
    <div className="tech-card" style={{ height: '390px', display: 'flex', flexDirection: 'column', flex: 1.2 }}>
      <div className="panel-header" style={{ marginBottom: '0.75rem' }}>
        <h3 className="panel-title">
          <FolderCode size={16} className="text-amber" />
          IDE Repository Workspace
        </h3>
        <span className="panel-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {fileData?.action === 'modify' ? (
            <span style={{ color: 'var(--color-gold)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.65rem' }}>
              <AlertTriangle size={12} /> VERIFYING MODIFICATIONS
            </span>
          ) : (
            <span style={{ color: 'var(--color-green)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.65rem' }}>
              <ShieldCheck size={12} /> SECURE GATEWAY ENFORCED
            </span>
          )}
        </span>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '0.8rem', minHeight: 0 }}>
        {/* Left Side: File Explorer */}
        <div 
          style={{ 
            width: '180px', 
            background: 'rgba(0,0,0,0.15)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '6px', 
            padding: '0.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}
        >
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FolderCode size={10} /> aether-repository/
          </div>
          {Object.keys(virtualFS).map((fileName) => {
            const isSelected = selectedFile === fileName;
            const status = virtualFS[fileName]?.action;
            
            return (
              <button
                key={fileName}
                onClick={() => handleFileSelect(fileName)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  width: '100%',
                  padding: '0.35rem 0.5rem',
                  background: isSelected ? 'var(--color-amber-dim)' : 'transparent',
                  border: `1px solid ${isSelected ? 'var(--color-amber)' : 'transparent'}`,
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <FileCode size={12} style={{ color: isSelected ? 'var(--color-amber)' : 'var(--text-muted)' }} />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>{fileName}</span>
                {status === 'modify' && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-gold)' }} />}
                {status === 'highlight' && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-red)' }} />}
              </button>
            );
          })}
        </div>

        {/* Right Side: Code Viewport */}
        <div 
          style={{ 
            flex: 1, 
            background: '#040508', 
            border: '1px solid rgba(255,255,255,0.02)', 
            borderRadius: '6px', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}
        >
          {/* File Tab */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border-color)', padding: '0.35rem 0.6rem' }}>
            <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileCode size={12} className="text-amber" /> {selectedFile || 'console.js'}
            </span>
          </div>

          {/* Code Area */}
          <div style={{ flex: 1, padding: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: '1.45', position: 'relative' }}>
            <div className="scanlines" />
            
            {!fileData ? (
              <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', fontStyle: 'italic' }}>
                Awaiting code synthesis cycle...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {fileData.lines.map((line, idx) => {
                  let bg = 'transparent';
                  let symbol = ' ';
                  let textColor = 'var(--text-primary)';
                  let annotation = null;

                  if (line.type === 'added') {
                    bg = 'rgba(16, 185, 129, 0.1)';
                    symbol = '+';
                    textColor = 'var(--color-green)';
                  } else if (line.type === 'removed') {
                    bg = 'rgba(239, 68, 68, 0.1)';
                    symbol = '-';
                    textColor = 'var(--color-red)';
                  } else if (line.type === 'warning') {
                    bg = 'rgba(255, 190, 11, 0.08)';
                    symbol = '!';
                    textColor = 'var(--color-gold)';
                    annotation = { type: 'warning', text: 'WEAK KEY IDENTIFICATION VECTOR' };
                  } else if (line.type === 'error') {
                    bg = 'rgba(239, 68, 68, 0.15)';
                    symbol = '✗';
                    textColor = 'var(--color-red)';
                    annotation = { type: 'error', text: 'UNVERIFIED JWT SIGNATURE - ATTACK VECTOR DETECTED' };
                  }

                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', background: bg }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        {/* Line number */}
                        <span style={{ width: '25px', color: 'var(--text-muted)', textAlign: 'right', paddingRight: '0.5rem', userSelect: 'none', borderRight: '1px solid rgba(255,255,255,0.05)', fontSize: '0.65rem' }}>
                          {line.num}
                        </span>
                        {/* Diff status symbol */}
                        <span style={{ width: '15px', textAlign: 'center', color: textColor, userSelect: 'none', fontSize: '0.65rem', paddingLeft: '2px' }}>
                          {symbol}
                        </span>
                        {/* Line text */}
                        <pre style={{ margin: 0, paddingLeft: '0.25rem', color: textColor, whiteSpace: 'pre-wrap', flex: 1 }}>{line.text}</pre>
                      </div>

                      {/* Error/Warning Annotation Box below the line */}
                      {annotation && (
                        <div 
                          style={{ 
                            marginLeft: '40px', 
                            marginTop: '2px', 
                            marginBottom: '4px',
                            background: annotation.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 190, 11, 0.15)',
                            borderLeft: `3px solid ${annotation.type === 'error' ? 'var(--color-red)' : 'var(--color-gold)'}`,
                            padding: '3px 8px',
                            borderRadius: '0 4px 4px 0',
                            fontSize: '0.65rem',
                            color: annotation.type === 'error' ? '#ff9e9e' : '#ffe191',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <AlertTriangle size={10} /> {annotation.text}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
