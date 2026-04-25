import type { Grid, AnimationStep, PathAlgorithm } from '../types';
import { heuristic } from '../utils/gridUtils';

export interface PathResult {
  steps: AnimationStep[];
  pathFound: boolean;
  pathLength: number;
  visitedCount: number;
  backtracks: number;
}

export function runPathfinding(grid: Grid, algorithm: PathAlgorithm): PathResult {
  const steps: AnimationStep[] = [];
  let pathFound = false;
  let pathLength = 0;
  let visitedCount = 0;
  let backtracks = 0;

  const { startPos, endPos } = grid;
  const rows = grid.rows;
  const cols = grid.cols;
  
  // Track visited state
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent: ({ row: number; col: number } | null)[][] = Array.from(
    { length: rows }, () => Array(cols).fill(null)
  );
  const distance: number[][] = Array.from({ length: rows }, () => Array(cols).fill(Infinity));

  function isWall(r: number, c: number) {
    return grid.cells[r][c].type === 'wall';
  }

  function isEnd(r: number, c: number) {
    return r === endPos.row && c === endPos.col;
  }

  function getNeighborCoords(r: number, c: number) {
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    return dirs
      .map(([dr, dc]) => ({ row: r+dr, col: c+dc }))
      .filter(({ row, col }) => row >= 0 && row < rows && col >= 0 && col < cols && !isWall(row, col));
  }

  function tracePath(endR: number, endC: number): { row: number; col: number }[] {
    const path: { row: number; col: number }[] = [];
    let cur: { row: number; col: number } | null = { row: endR, col: endC };
    while (cur) {
      path.unshift(cur);
      cur = parent[cur.row][cur.col];
    }
    return path;
  }

  if (algorithm === 'bfs') {
    const queue: { row: number; col: number }[] = [startPos];
    visited[startPos.row][startPos.col] = true;
    distance[startPos.row][startPos.col] = 0;

    while (queue.length > 0) {
      const { row, col } = queue.shift()!;
      
      if (isEnd(row, col)) {
        pathFound = true;
        const path = tracePath(row, col);
        pathLength = path.length - 1;
        steps.push({ type: 'path', cells: path });
        break;
      }

      steps.push({ type: 'current', cells: [{ row, col }] });
      
      for (const nb of getNeighborCoords(row, col)) {
        if (!visited[nb.row][nb.col]) {
          visited[nb.row][nb.col] = true;
          parent[nb.row][nb.col] = { row, col };
          distance[nb.row][nb.col] = distance[row][col] + 1;
          queue.push(nb);
          steps.push({ type: 'frontier', cells: [nb] });
          visitedCount++;
        }
      }
    }
  }

  else if (algorithm === 'dfs') {
    const stack: { row: number; col: number; path: {row:number,col:number}[] }[] = [
      { row: startPos.row, col: startPos.col, path: [startPos] }
    ];
    visited[startPos.row][startPos.col] = true;

    outer: while (stack.length > 0) {
      const { row, col, path } = stack.pop()!;

      steps.push({ type: 'current', cells: [{ row, col }] });

      if (isEnd(row, col)) {
        pathFound = true;
        pathLength = path.length - 1;
        steps.push({ type: 'path', cells: path });
        break;
      }

      const neighbors = getNeighborCoords(row, col);
      let pushed = false;
      for (const nb of neighbors) {
        if (!visited[nb.row][nb.col]) {
          visited[nb.row][nb.col] = true;
          parent[nb.row][nb.col] = { row, col };
          stack.push({ row: nb.row, col: nb.col, path: [...path, nb] });
          steps.push({ type: 'visit', cells: [nb] });
          visitedCount++;
          pushed = true;
        }
      }
      if (!pushed && stack.length > 0) {
        backtracks++;
        steps.push({ type: 'backtrack', cells: [{ row, col }] });
      }
    }
  }

  else if (algorithm === 'dijkstra') {
    distance[startPos.row][startPos.col] = 0;
    // Min-heap simulation via sorted array
    const pq: { row: number; col: number; dist: number }[] = [
      { row: startPos.row, col: startPos.col, dist: 0 }
    ];

    while (pq.length > 0) {
      pq.sort((a, b) => a.dist - b.dist);
      const { row, col, dist } = pq.shift()!;

      if (visited[row][col]) continue;
      visited[row][col] = true;
      visitedCount++;

      steps.push({ type: 'current', cells: [{ row, col }] });

      if (isEnd(row, col)) {
        pathFound = true;
        const path = tracePath(row, col);
        pathLength = path.length - 1;
        steps.push({ type: 'path', cells: path });
        break;
      }

      for (const nb of getNeighborCoords(row, col)) {
        const newDist = dist + grid.cells[nb.row][nb.col].weight;
        if (newDist < distance[nb.row][nb.col]) {
          distance[nb.row][nb.col] = newDist;
          parent[nb.row][nb.col] = { row, col };
          pq.push({ row: nb.row, col: nb.col, dist: newDist });
          steps.push({ type: 'frontier', cells: [nb] });
        }
      }
    }
  }

  else if (algorithm === 'astar') {
    const gScore: number[][] = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const fScore: number[][] = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    gScore[startPos.row][startPos.col] = 0;
    fScore[startPos.row][startPos.col] = heuristic(startPos, endPos);

    const openSet: { row: number; col: number }[] = [startPos];
    const inOpen = Array.from({ length: rows }, () => Array(cols).fill(false));
    inOpen[startPos.row][startPos.col] = true;

    while (openSet.length > 0) {
      openSet.sort((a, b) => fScore[a.row][a.col] - fScore[b.row][b.col]);
      const { row, col } = openSet.shift()!;
      inOpen[row][col] = false;
      visited[row][col] = true;
      visitedCount++;

      steps.push({ type: 'current', cells: [{ row, col }] });

      if (isEnd(row, col)) {
        pathFound = true;
        const path = tracePath(row, col);
        pathLength = path.length - 1;
        steps.push({ type: 'path', cells: path });
        break;
      }

      for (const nb of getNeighborCoords(row, col)) {
        if (visited[nb.row][nb.col]) continue;
        const tentativeG = gScore[row][col] + 1;
        if (tentativeG < gScore[nb.row][nb.col]) {
          parent[nb.row][nb.col] = { row, col };
          gScore[nb.row][nb.col] = tentativeG;
          fScore[nb.row][nb.col] = tentativeG + heuristic(nb, endPos);
          if (!inOpen[nb.row][nb.col]) {
            openSet.push(nb);
            inOpen[nb.row][nb.col] = true;
            steps.push({ type: 'frontier', cells: [nb] });
          }
        }
      }
    }
  }

  else if (algorithm === 'gbfs') {
    // Greedy Best First Search
    const openSet: { row: number; col: number }[] = [startPos];
    visited[startPos.row][startPos.col] = true;

    while (openSet.length > 0) {
      openSet.sort((a, b) => heuristic(a, endPos) - heuristic(b, endPos));
      const { row, col } = openSet.shift()!;
      visitedCount++;

      steps.push({ type: 'current', cells: [{ row, col }] });

      if (isEnd(row, col)) {
        pathFound = true;
        const path = tracePath(row, col);
        pathLength = path.length - 1;
        steps.push({ type: 'path', cells: path });
        break;
      }

      for (const nb of getNeighborCoords(row, col)) {
        if (!visited[nb.row][nb.col]) {
          visited[nb.row][nb.col] = true;
          parent[nb.row][nb.col] = { row, col };
          openSet.push(nb);
          steps.push({ type: 'frontier', cells: [nb] });
        }
      }
    }
  }

  return { steps, pathFound, pathLength, visitedCount, backtracks };
}
