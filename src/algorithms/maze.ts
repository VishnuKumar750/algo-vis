import type { Grid, AnimationStep, MazeAlgorithm } from '../types';
import { cloneGrid } from '../utils/gridUtils';

export function generateMaze(grid: Grid, algorithm: MazeAlgorithm): { steps: AnimationStep[]; finalGrid: Grid } {
  const steps: AnimationStep[] = [];
  const newGrid = cloneGrid(grid);

  // Clear all cells except start/end
  for (let r = 0; r < newGrid.rows; r++) {
    for (let c = 0; c < newGrid.cols; c++) {
      const cell = newGrid.cells[r][c];
      if (cell.type !== 'start' && cell.type !== 'end') {
        cell.type = 'empty';
      }
    }
  }

  if (algorithm === 'recursive-division') {
    recursiveDivision(newGrid, steps, 0, newGrid.rows - 1, 0, newGrid.cols - 1);
  } else if (algorithm === 'dfs-maze') {
    dfsMaze(newGrid, steps);
  } else if (algorithm === 'prims') {
    primsMaze(newGrid, steps);
  } else if (algorithm === 'random') {
    randomMaze(newGrid, steps);
  }

  return { steps, finalGrid: newGrid };
}

function addWall(grid: Grid, steps: AnimationStep[], r: number, c: number) {
  const cell = grid.cells[r][c];
  if (cell.type !== 'start' && cell.type !== 'end') {
    cell.type = 'wall';
    steps.push({ type: 'wall', cells: [{ row: r, col: c }] });
  }
}

function recursiveDivision(
  grid: Grid, steps: AnimationStep[],
  rowStart: number, rowEnd: number,
  colStart: number, colEnd: number
) {
  const height = rowEnd - rowStart + 1;
  const width = colEnd - colStart + 1;
  if (height < 3 || width < 3) return;

  const horizontal = height > width ? true : height < width ? false : Math.random() < 0.5;

  if (horizontal) {
    const wallRow = rowStart + 1 + Math.floor(Math.random() * Math.floor((height - 2) / 2)) * 2;
    const passageCol = colStart + Math.floor(Math.random() * Math.floor(width / 2)) * 2 + (width % 2 === 0 ? 0 : 0);
    for (let c = colStart; c <= colEnd; c++) {
      if (c !== passageCol) addWall(grid, steps, wallRow, c);
    }
    recursiveDivision(grid, steps, rowStart, wallRow - 1, colStart, colEnd);
    recursiveDivision(grid, steps, wallRow + 1, rowEnd, colStart, colEnd);
  } else {
    const wallCol = colStart + 1 + Math.floor(Math.random() * Math.floor((width - 2) / 2)) * 2;
    const passageRow = rowStart + Math.floor(Math.random() * Math.floor(height / 2)) * 2 + (height % 2 === 0 ? 0 : 0);
    for (let r = rowStart; r <= rowEnd; r++) {
      if (r !== passageRow) addWall(grid, steps, r, wallCol);
    }
    recursiveDivision(grid, steps, rowStart, rowEnd, colStart, wallCol - 1);
    recursiveDivision(grid, steps, rowStart, rowEnd, wallCol + 1, colEnd);
  }
}

function dfsMaze(grid: Grid, steps: AnimationStep[]) {
  // Start with all walls
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      if (grid.cells[r][c].type !== 'start' && grid.cells[r][c].type !== 'end') {
        grid.cells[r][c].type = 'wall';
        steps.push({ type: 'wall', cells: [{ row: r, col: c }] });
      }
    }
  }

  const visited = Array.from({ length: grid.rows }, () => Array(grid.cols).fill(false));
  const startR = grid.startPos.row % 2 === 0 ? grid.startPos.row + 1 : grid.startPos.row;
  const startC = grid.startPos.col % 2 === 0 ? grid.startPos.col + 1 : grid.startPos.col;

  function carve(r: number, c: number) {
    visited[r][c] = true;
    if (grid.cells[r][c].type !== 'start' && grid.cells[r][c].type !== 'end') {
      grid.cells[r][c].type = 'empty';
      steps.push({ type: 'maze-gen', cells: [{ row: r, col: c }] });
    }

    const dirs = [[-2, 0], [2, 0], [0, -2], [0, 2]].sort(() => Math.random() - 0.5);
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < grid.rows && nc >= 0 && nc < grid.cols && !visited[nr][nc]) {
        const wallR = r + dr / 2;
        const wallC = c + dc / 2;
        if (grid.cells[wallR][wallC].type !== 'start' && grid.cells[wallR][wallC].type !== 'end') {
          grid.cells[wallR][wallC].type = 'empty';
          steps.push({ type: 'maze-gen', cells: [{ row: wallR, col: wallC }] });
        }
        carve(nr, nc);
      }
    }
  }

  carve(startR, startC);
}

function primsMaze(grid: Grid, steps: AnimationStep[]) {
  // Start all walls
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      if (grid.cells[r][c].type !== 'start' && grid.cells[r][c].type !== 'end') {
        grid.cells[r][c].type = 'wall';
      }
    }
  }

  const inMaze = Array.from({ length: grid.rows }, () => Array(grid.cols).fill(false));
  const walls: { r: number; c: number; pr: number; pc: number }[] = [];

  function addWalls(r: number, c: number) {
    const dirs = [[-2,0],[2,0],[0,-2],[0,2]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < grid.rows && nc >= 0 && nc < grid.cols && !inMaze[nr][nc]) {
        walls.push({ r: nr, c: nc, pr: r, pc: c });
      }
    }
  }

  const sr = grid.startPos.row % 2 === 0 ? grid.startPos.row + 1 : grid.startPos.row;
  const sc = grid.startPos.col % 2 === 0 ? grid.startPos.col + 1 : grid.startPos.col;
  inMaze[sr][sc] = true;
  if (grid.cells[sr][sc].type !== 'start' && grid.cells[sr][sc].type !== 'end') {
    grid.cells[sr][sc].type = 'empty';
    steps.push({ type: 'maze-gen', cells: [{ row: sr, col: sc }] });
  }
  addWalls(sr, sc);

  while (walls.length > 0) {
    const idx = Math.floor(Math.random() * walls.length);
    const { r, c, pr, pc } = walls.splice(idx, 1)[0];
    if (!inMaze[r][c]) {
      inMaze[r][c] = true;
      const wallR = (r + pr) / 2;
      const wallC = (c + pc) / 2;
      if (grid.cells[r][c].type !== 'start' && grid.cells[r][c].type !== 'end') {
        grid.cells[r][c].type = 'empty';
        steps.push({ type: 'maze-gen', cells: [{ row: r, col: c }] });
      }
      if (grid.cells[wallR][wallC].type !== 'start' && grid.cells[wallR][wallC].type !== 'end') {
        grid.cells[wallR][wallC].type = 'empty';
        steps.push({ type: 'maze-gen', cells: [{ row: wallR, col: wallC }] });
      }
      addWalls(r, c);
    }
  }
}

function randomMaze(grid: Grid, steps: AnimationStep[]) {
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      if (grid.cells[r][c].type !== 'start' && grid.cells[r][c].type !== 'end') {
        if (Math.random() < 0.32) {
          grid.cells[r][c].type = 'wall';
          steps.push({ type: 'wall', cells: [{ row: r, col: c }] });
        }
      }
    }
  }
}
