import React from 'react';
import type { Analytics } from '../types';

interface Props {
  analytics: Analytics | null;
  isRunning: boolean;
  mode: 'sort' | 'maze';
  currentStep?: number;
  totalSteps?: number;
  currentDesc?: string;
}

const Stat: React.FC<{ label: string; value: string | number; color?: string; pulse?: boolean }> = ({
  label, value, color = 'var(--accent-cyan)', pulse = false
}) => (
  <div className="analytics-card flex flex-col gap-1">
    <div style={{ fontSize: '10px', fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.08em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
      {label}
    </div>
    <div
      className={pulse ? 'pulse-glow' : ''}
      style={{
        fontSize: '20px',
        fontFamily: 'Orbitron, sans-serif',
        fontWeight: '700',
        color,
        lineHeight: 1,
      }}
    >
      {value}
    </div>
  </div>
);

export const AnalyticsPanel: React.FC<Props> = ({ analytics, isRunning, mode, currentStep, totalSteps, currentDesc }) => {
  const progress = totalSteps && totalSteps > 0 ? Math.round(((currentStep || 0) / totalSteps) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Progress bar */}
      {isRunning && totalSteps && totalSteps > 0 && (
        <div>
          <div className="flex justify-between mb-1" style={{ fontSize: '11px', fontFamily: 'Space Mono', color: 'var(--text-secondary)' }}>
            <span>PROGRESS</span>
            <span style={{ color: 'var(--accent-cyan)' }}>{progress}%</span>
          </div>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-green))',
                transition: 'width 0.1s ease',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
      )}

      {/* Current operation */}
      {currentDesc && (
        <div style={{
          background: 'rgba(0,245,255,0.04)',
          border: '1px solid rgba(0,245,255,0.1)',
          padding: '8px 12px',
          fontSize: '12px',
          fontFamily: 'Space Mono, monospace',
          color: 'var(--accent-cyan)',
          minHeight: '36px',
        }}>
          ▶ {currentDesc}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Time" value={analytics ? `${analytics.timeMs.toFixed(1)}ms` : '—'} color="var(--accent-cyan)" pulse={isRunning} />
        <Stat label="Steps" value={analytics?.steps ?? currentStep ?? '—'} color="var(--accent-green)" pulse={isRunning} />

        {mode === 'sort' ? (
          <>
            <Stat label="Comparisons" value={analytics?.comparisons ?? '—'} color="var(--accent-orange)" />
            <Stat label="Swaps" value={analytics?.swaps ?? '—'} color="var(--accent-purple)" />
          </>
        ) : (
          <>
            <Stat label="Visited" value={analytics?.visitedNodes ?? '—'} color="var(--accent-orange)" />
            <Stat label="Path Len" value={analytics?.pathLength ?? '—'} color="var(--accent-purple)" />
            <Stat label="Backtracks" value={analytics?.backtracks ?? '—'} color="var(--accent-pink)" />
            <Stat label="Memory" value={analytics?.memoryEstimate ? `${analytics.memoryEstimate}B` : '—'} color="#ffd700" />
          </>
        )}
      </div>

      {/* Algorithm complexity info */}
      {analytics && !isRunning && (
        <div style={{ fontSize: '11px', fontFamily: 'Space Mono', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {analytics.pathLength !== undefined && (
            <div style={{ color: analytics.pathLength > 0 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
              {analytics.pathLength > 0 ? `✓ Path found (${analytics.pathLength} steps)` : '✗ No path exists'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
