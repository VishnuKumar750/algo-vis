import React from 'react';
import type { PathAlgorithm, SortAlgorithm } from '../types';

type Algo = PathAlgorithm | SortAlgorithm;

interface AlgoInfo {
  name: string;
  time: string;
  space: string;
  desc: string;
  optimal: boolean;
  complete: boolean;
  weighted?: boolean;
  stable?: boolean;
}

const infoMap: Record<string, AlgoInfo> = {
  bfs: {
    name: 'Breadth-First Search',
    time: 'O(V + E)',
    space: 'O(V)',
    desc: 'Explores all neighbors level by level. Guarantees shortest path in unweighted graphs.',
    optimal: true,
    complete: true,
    weighted: false,
  },
  dfs: {
    name: 'Depth-First Search',
    time: 'O(V + E)',
    space: 'O(V)',
    desc: 'Explores as deep as possible along each branch. Shows backtracking when dead ends are hit.',
    optimal: false,
    complete: true,
    weighted: false,
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    time: 'O((V+E) log V)',
    space: 'O(V)',
    desc: 'Finds shortest path in weighted graphs using a priority queue. Optimal for non-negative weights.',
    optimal: true,
    complete: true,
    weighted: true,
  },
  astar: {
    name: 'A* Search',
    time: 'O(E log V)',
    space: 'O(V)',
    desc: 'Uses heuristic (Manhattan distance) to guide search. Most efficient pathfinding algorithm.',
    optimal: true,
    complete: true,
    weighted: true,
  },
  gbfs: {
    name: 'Greedy Best-First',
    time: 'O(E log V)',
    space: 'O(V)',
    desc: 'Always moves toward goal using heuristic. Fast but not guaranteed optimal path.',
    optimal: false,
    complete: false,
    weighted: false,
  },
  bubble: {
    name: 'Bubble Sort',
    time: 'O(n²)',
    space: 'O(1)',
    desc: 'Repeatedly swaps adjacent elements. Simple but slow. Best case O(n) when nearly sorted.',
    optimal: false,
    complete: true,
    stable: true,
  },
  selection: {
    name: 'Selection Sort',
    time: 'O(n²)',
    space: 'O(1)',
    desc: 'Finds minimum element repeatedly. Always O(n²) comparisons but minimal swaps.',
    optimal: false,
    complete: true,
    stable: false,
  },
  insertion: {
    name: 'Insertion Sort',
    time: 'O(n²)',
    space: 'O(1)',
    desc: 'Builds sorted portion one element at a time. Efficient for small or nearly sorted data.',
    optimal: false,
    complete: true,
    stable: true,
  },
  merge: {
    name: 'Merge Sort',
    time: 'O(n log n)',
    space: 'O(n)',
    desc: 'Divide and conquer. Splits, sorts, and merges subarrays. Always O(n log n).',
    optimal: true,
    complete: true,
    stable: true,
  },
  quick: {
    name: 'Quick Sort',
    time: 'O(n log n) avg',
    space: 'O(log n)',
    desc: 'Partitions around pivot. Fastest in practice. Worst case O(n²) with bad pivot selection.',
    optimal: false,
    complete: true,
    stable: false,
  },
  heap: {
    name: 'Heap Sort',
    time: 'O(n log n)',
    space: 'O(1)',
    desc: 'Uses max-heap structure. Guaranteed O(n log n). Not stable but in-place.',
    optimal: false,
    complete: true,
    stable: false,
  },
  shell: {
    name: 'Shell Sort',
    time: 'O(n log² n)',
    space: 'O(1)',
    desc: 'Generalization of insertion sort with gap sequences. Better practical performance.',
    optimal: false,
    complete: true,
    stable: false,
  },
  radix: {
    name: 'Radix Sort',
    time: 'O(nk)',
    space: 'O(n+k)',
    desc: 'Non-comparison sort by individual digits. Linear time for fixed-length integers.',
    optimal: true,
    complete: true,
    stable: true,
  },
};

interface Props {
  algo: Algo;
}

export const AlgoInfo: React.FC<Props> = ({ algo }) => {
  const info = infoMap[algo];
  if (!info) return null;

  return (
    <div style={{
      background: 'rgba(10,15,30,0.6)',
      border: '1px solid rgba(0,245,255,0.1)',
      padding: '12px 14px',
      fontSize: '12px',
    }}>
      <div style={{ fontFamily: 'Orbitron', fontSize: '11px', color: 'var(--accent-cyan)', marginBottom: '6px', letterSpacing: '0.05em' }}>
        {info.name}
      </div>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px', fontFamily: 'Rajdhani', fontSize: '13px' }}>
        {info.desc}
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge label="Time" value={info.time} color="var(--accent-cyan)" />
        <Badge label="Space" value={info.space} color="var(--accent-green)" />
        {info.optimal !== undefined && <Badge label="Optimal" value={info.optimal ? 'Yes' : 'No'} color={info.optimal ? 'var(--accent-green)' : 'var(--accent-orange)'} />}
        {info.stable !== undefined && <Badge label="Stable" value={info.stable ? 'Yes' : 'No'} color={info.stable ? 'var(--accent-green)' : 'var(--accent-orange)'} />}
        {info.weighted !== undefined && <Badge label="Weighted" value={info.weighted ? 'Yes' : 'No'} color={info.weighted ? 'var(--accent-purple)' : 'var(--text-secondary)'} />}
      </div>
    </div>
  );
};

const Badge: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '3px 8px',
    fontSize: '10px',
    fontFamily: 'Space Mono, monospace',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  }}>
    <span style={{ color: 'var(--text-secondary)' }}>{label}:</span>
    <span style={{ color }}>{value}</span>
  </div>
);
