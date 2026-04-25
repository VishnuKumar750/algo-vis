import React, { useRef, useEffect } from 'react';
import type { SortBar } from '../types';
import gsap from 'gsap';

interface Props {
  bars: SortBar[];
  maxValue: number;
}

const stateColor: Record<string, string> = {
  default: 'rgba(0,245,255,0.75)',
  comparing: '#ff6b2b',
  swapping: '#00ff88',
  sorted: '#8b5cf6',
  pivot: '#ff0080',
  min: '#ffd700',
};

const stateGlow: Record<string, string> = {
  default: 'none',
  comparing: '0 0 8px rgba(255,107,43,0.7)',
  swapping: '0 0 8px rgba(0,255,136,0.7)',
  sorted: 'none',
  pivot: '0 0 10px rgba(255,0,128,0.8)',
  min: '0 0 8px rgba(255,214,0,0.7)',
};

export const SortVisualizer: React.FC<Props> = ({ bars, maxValue }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevBarsRef = useRef<SortBar[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll('.sort-bar');
    elements.forEach((el, i) => {
      const bar = bars[i];
      if (!bar) return;
      const prev = prevBarsRef.current[i];
      const changed = !prev || prev.value !== bar.value || prev.state !== bar.state;
      if (changed) {
        gsap.to(el, {
          height: `${(bar.value / maxValue) * 100}%`,
          backgroundColor: stateColor[bar.state] || stateColor.default,
          boxShadow: stateGlow[bar.state] || 'none',
          duration: 0.12,
          ease: 'power2.out',
        });
      }
    });
    prevBarsRef.current = [...bars];
  }, [bars, maxValue]);

  return (
    <div ref={containerRef} className="flex items-end gap-px w-full" style={{ height: '320px', padding: '0 4px' }}>
      {bars.map((bar) => (
        <div
          key={bar.id}
          className="sort-bar flex-1 rounded-t-sm relative"
          style={{
            height: `${(bar.value / maxValue) * 100}%`,
            backgroundColor: stateColor[bar.state] || stateColor.default,
            boxShadow: stateGlow[bar.state] || 'none',
            minWidth: '2px',
            transition: 'none',
          }}
        >
          {bars.length <= 40 && (
            <div
              className="absolute bottom-full left-1/2 text-center"
              style={{
                fontSize: '8px',
                fontFamily: 'Space Mono, monospace',
                color: 'rgba(255,255,255,0.6)',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                lineHeight: '1',
                marginBottom: '2px',
              }}
            >
              {bar.value}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
