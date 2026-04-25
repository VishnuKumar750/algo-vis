export type CellType = 'empty' | 'wall' | 'start' | 'end' | 'visited' | 'path' | 'backtrack' | 'frontier' | 'current' | 'maze-gen';

export interface Cell {
  row: number;
  col: number;
  type: CellType;
  distance: number;
  heuristic: number;
  fScore: number;
  parent: { row: number; col: number } | null;
  weight: number;
}

export interface Grid {
  cells: Cell[][];
  rows: number;
  cols: number;
  startPos: { row: number; col: number };
  endPos: { row: number; col: number };
}

export type PathAlgorithm = 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'gbfs';
export type MazeAlgorithm = 'recursive-division' | 'dfs-maze' | 'prims' | 'random';
export type SortAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap' | 'shell' | 'radix';

export type BarState = 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot' | 'min';

export interface SortBar {
  value: number;
  state: BarState;
  id: number;
}

export interface AnimationStep {
  type: 'visit' | 'backtrack' | 'path' | 'frontier' | 'current' | 'maze-gen' | 'wall';
  cells: { row: number; col: number }[];
}

export interface SortStep {
  bars: SortBar[];
  comparing?: number[];
  swapping?: number[];
  pivot?: number;
  sorted?: number[];
  min?: number;
  description: string;
  comparisons: number;
  swaps: number;
}

export interface Analytics {
  timeMs: number;
  steps: number;
  comparisons: number;
  swaps: number;
  pathLength?: number;
  visitedNodes?: number;
  backtracks?: number;
  memoryEstimate?: number;
}
