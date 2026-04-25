import React, { useCallback, useRef } from 'react';
import type { Grid, CellType } from '../types';

interface Props {
  grid: Grid;
  onCellClick: (row: number, col: number) => void;
  onCellDrag: (row: number, col: number) => void;
  isRunning: boolean;
}

const cellTypeClass: Record<CellType, string> = {
  empty: 'cell-empty',
  wall: 'cell-wall',
  start: 'cell-start',
  end: 'cell-end',
  visited: 'cell-visited',
  path: 'cell-path',
  backtrack: 'cell-backtrack',
  frontier: 'cell-frontier',
  current: 'cell-current',
  'maze-gen': 'cell-maze-gen',
};

export const MazeGrid: React.FC<Props> = ({ grid, onCellClick, onCellDrag, isRunning }) => {
  const isMouseDown = useRef(false);

  const handleMouseDown = useCallback((row: number, col: number) => {
    if (isRunning) return;
    isMouseDown.current = true;
    onCellClick(row, col);
  }, [onCellClick, isRunning]);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (isRunning) return;
    if (isMouseDown.current) onCellDrag(row, col);
  }, [onCellDrag, isRunning]);

  const handleMouseUp = useCallback(() => {
    isMouseDown.current = false;
  }, []);

  const cellSize = Math.min(
    Math.floor((window.innerWidth - 80) / grid.cols),
    Math.floor(480 / grid.rows),
    28
  );

  return (
    <div
      className="select-none overflow-auto"
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${grid.cols}, ${cellSize}px)`,
          gap: '1px',
          backgroundColor: 'rgba(0,245,255,0.05)',
          padding: '1px',
          border: '1px solid rgba(0,245,255,0.1)',
        }}
      >
        {grid.cells.flat().map((cell) => (
          <div
            key={`${cell.row}-${cell.col}`}
            className={`${cellTypeClass[cell.type]} transition-colors`}
            style={{
              width: cellSize,
              height: cellSize,
              cursor: isRunning ? 'default' : 'pointer',
              transitionDuration: cell.type === 'visited' || cell.type === 'path' ? '80ms' : '20ms',
            }}
            onMouseDown={() => handleMouseDown(cell.row, cell.col)}
            onMouseEnter={() => handleMouseEnter(cell.row, cell.col)}
          >
            {cell.type === 'start' && (
              <div className="w-full h-full flex items-center justify-center">
                <svg width={cellSize * 0.6} height={cellSize * 0.6} viewBox="0 0 16 16" fill="none">
                  <polygon points="3,2 13,8 3,14" fill="#030712" />
                </svg>
              </div>
            )}
            {cell.type === 'end' && (
              <div className="w-full h-full flex items-center justify-center">
                <div style={{ width: cellSize * 0.45, height: cellSize * 0.45, background: '#030712', borderRadius: '50%' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
