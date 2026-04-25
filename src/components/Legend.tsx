import React from 'react';

interface LegendItem {
  color: string;
  label: string;
  border?: string;
}

const mazeLegend: LegendItem[] = [
  { color: 'linear-gradient(135deg, #00ff88, #00cc66)', label: 'Start', border: '#00ff88' },
  { color: 'linear-gradient(135deg, #ff6b2b, #cc4422)', label: 'End', border: '#ff6b2b' },
  { color: 'linear-gradient(135deg, #1a2744, #0f1a33)', label: 'Wall', border: 'rgba(0,245,255,0.05)' },
  { color: 'rgba(255,255,255,0.02)', label: 'Empty', border: 'rgba(255,255,255,0.04)' },
  { color: 'rgba(0,245,255,0.15)', label: 'Frontier', border: 'rgba(0,245,255,0.4)' },
  { color: '#00f5ff', label: 'Current', border: 'white' },
  { color: 'rgba(139,92,246,0.2)', label: 'Visited', border: 'rgba(139,92,246,0.3)' },
  { color: 'rgba(255,0,128,0.15)', label: 'Backtrack', border: 'rgba(255,0,128,0.35)' },
  { color: 'linear-gradient(135deg, rgba(0,245,255,0.7), rgba(0,255,136,0.7))', label: 'Path', border: 'rgba(0,245,255,0.6)' },
];

const sortLegend: LegendItem[] = [
  { color: 'rgba(0,245,255,0.75)', label: 'Default' },
  { color: '#ff6b2b', label: 'Comparing' },
  { color: '#00ff88', label: 'Swapping' },
  { color: '#ff0080', label: 'Pivot' },
  { color: '#ffd700', label: 'Minimum' },
  { color: '#8b5cf6', label: 'Sorted' },
];

interface Props {
  mode: 'maze' | 'sort';
}

export const Legend: React.FC<Props> = ({ mode }) => {
  const items = mode === 'maze' ? mazeLegend : sortLegend;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            style={{
              width: '12px',
              height: '12px',
              background: item.color,
              border: `1px solid ${item.border || 'rgba(255,255,255,0.2)'}`,
              borderRadius: '2px',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '11px', fontFamily: 'Space Mono', color: 'var(--text-secondary)' }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};
