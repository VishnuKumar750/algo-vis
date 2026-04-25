import type { Cell, Grid } from '../types';

export function createGrid(rows: number, cols: number): Grid {
  const cells: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    cells[r] = [];
    for (let c = 0; c < cols; c++) {
      cells[r][c] = createCell(r, c);
    }
  }
  const startPos = { row: Math.floor(rows / 2), col: Math.floor(cols / 4) };
  const endPos = { row: Math.floor(rows / 2), col: Math.floor((cols * 3) / 4) };
  cells[startPos.row][startPos.col].type = 'start';
  cells[endPos.row][endPos.col].type = 'end';
  return { cells, rows, cols, startPos, endPos };
}

export function createCell(row: number, col: number): Cell {
  return {
    row, col,
    type: 'empty',
    distance: Infinity,
    heuristic: 0,
    fScore: Infinity,
    parent: null,
    weight: 1,
  };
}

export function cloneGrid(grid: Grid): Grid {
  return {
    ...grid,
    cells: grid.cells.map(row => row.map(cell => ({ ...cell }))),
  };
}

export function resetGridForSearch(grid: Grid): Grid {
  const newGrid = cloneGrid(grid);
  for (let r = 0; r < newGrid.rows; r++) {
    for (let c = 0; c < newGrid.cols; c++) {
      const cell = newGrid.cells[r][c];
      if (cell.type === 'visited' || cell.type === 'path' || cell.type === 'backtrack' || cell.type === 'frontier' || cell.type === 'current') {
        cell.type = 'empty';
      }
      cell.distance = Infinity;
      cell.heuristic = 0;
      cell.fScore = Infinity;
      cell.parent = null;
    }
  }
  return newGrid;
}

export function getNeighbors(grid: Grid, row: number, col: number): Cell[] {
  const neighbors: Cell[] = [];
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (const [dr, dc] of dirs) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < grid.rows && nc >= 0 && nc < grid.cols) {
      neighbors.push(grid.cells[nr][nc]);
    }
  }
  return neighbors;
}

export function heuristic(a: {row:number,col:number}, b: {row:number,col:number}): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function reconstructPath(grid: Grid, endPos: {row:number,col:number}): {row:number,col:number}[] {
  const path: {row:number,col:number}[] = [];
  let current: {row:number,col:number} | null = endPos;
  while (current) {
    path.unshift(current);
    current = grid.cells[current.row][current.col].parent;
  }
  return path;
}
