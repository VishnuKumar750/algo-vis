import React, { useState, useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import type {
  Grid,
  PathAlgorithm,
  MazeAlgorithm,
  SortAlgorithm,
  SortBar,
  Analytics,
} from "./types";
import { createGrid, cloneGrid, resetGridForSearch } from "./utils/gridUtils";
import { runPathfinding } from "./algorithms/pathfinding";
import { generateMaze } from "./algorithms/maze";
import { generateSortSteps, generateRandomArray } from "./algorithms/sorting";
import { MazeGrid } from "./components/MazeGrid";
import { SortVisualizer } from "./components/SortVisualizer";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { AlgoInfo } from "./components/AlgoInfo";
import { Legend } from "./components/Legend";
import { Toast } from "./components/Toast";
import type { ToastMsg } from "./components/Toast";

type Tab = "maze" | "sort";
type DrawMode = "wall" | "erase" | "start" | "end";

const GRID_ROWS = 21;
const GRID_COLS = 47;

let toastId = 0;

function App() {
  const [tab, setTab] = useState<Tab>("maze");

  const [grid, setGrid] = useState<Grid>(() =>
    createGrid(GRID_ROWS, GRID_COLS),
  );
  const [pathAlgo, setPathAlgo] = useState<PathAlgorithm>("astar");
  const [mazeAlgo, setMazeAlgo] = useState<MazeAlgorithm>("recursive-division");
  const [drawMode, setDrawMode] = useState<DrawMode>("wall");
  const [mazeRunning, setMazeRunning] = useState(false);
  const [mazeAnalytics, setMazeAnalytics] = useState<Analytics | null>(null);
  const [mazeStep, setMazeStep] = useState(0);
  const [mazeTotalSteps, setMazeTotalSteps] = useState(0);
  const [mazeDesc, setMazeDesc] = useState("");
  const mazeAbort = useRef(false);
  const [speed, setSpeed] = useState(50);

  const [sortAlgo, setSortAlgo] = useState<SortAlgorithm>("quick");
  const [arraySize, setArraySize] = useState(60);
  const [bars, setBars] = useState<SortBar[]>(() =>
    generateRandomArray(60).map((v, i) => ({
      value: v,
      state: "default",
      id: i,
    })),
  );
  const [sortRunning, setSortRunning] = useState(false);
  const [sortAnalytics, setSortAnalytics] = useState<Analytics | null>(null);
  const [sortStep, setSortStep] = useState(0);
  const [sortTotalSteps, setSortTotalSteps] = useState(0);
  const [sortDesc, setSortDesc] = useState("");
  const sortAbort = useRef(false);
  const maxBarValue = useRef(400);

  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const addToast = useCallback(
    (message: string, type: ToastMsg["type"] = "info") => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    [],
  );
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const headerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    }
  }, []);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (mazeRunning) return;
      setGrid((prev) => {
        const next = cloneGrid(prev);
        const cell = next.cells[row][col];
        if (drawMode === "wall") {
          if (cell.type !== "start" && cell.type !== "end")
            cell.type = cell.type === "wall" ? "empty" : "wall";
        } else if (drawMode === "erase") {
          if (cell.type !== "start" && cell.type !== "end") cell.type = "empty";
        } else if (drawMode === "start") {
          const old = next.startPos;
          next.cells[old.row][old.col].type = "empty";
          cell.type = "start";
          next.startPos = { row, col };
        } else if (drawMode === "end") {
          const old = next.endPos;
          next.cells[old.row][old.col].type = "empty";
          cell.type = "end";
          next.endPos = { row, col };
        }
        return next;
      });
    },
    [mazeRunning, drawMode],
  );

  const handleCellDrag = useCallback(
    (row: number, col: number) => {
      if (mazeRunning) return;
      setGrid((prev) => {
        const next = cloneGrid(prev);
        const cell = next.cells[row][col];
        if (drawMode === "wall" && cell.type !== "start" && cell.type !== "end")
          cell.type = "wall";
        else if (
          drawMode === "erase" &&
          cell.type !== "start" &&
          cell.type !== "end"
        )
          cell.type = "empty";
        return next;
      });
    },
    [mazeRunning, drawMode],
  );

  const handleGenerateMaze = useCallback(async () => {
    if (mazeRunning) return;
    setMazeRunning(true);
    setMazeAnalytics(null);
    mazeAbort.current = false;

    const baseGrid = createGrid(GRID_ROWS, GRID_COLS);
    setGrid(baseGrid);
    await new Promise((r) => setTimeout(r, 50));

    const { steps, finalGrid } = generateMaze(baseGrid, mazeAlgo);
    setMazeTotalSteps(steps.length);
    setMazeStep(0);

    const animGrid = cloneGrid(baseGrid);
    if (mazeAlgo === "dfs-maze" || mazeAlgo === "prims") {
      for (let r = 0; r < animGrid.rows; r++) {
        for (let c = 0; c < animGrid.cols; c++) {
          if (
            animGrid.cells[r][c].type !== "start" &&
            animGrid.cells[r][c].type !== "end"
          ) {
            animGrid.cells[r][c].type = "wall";
          }
        }
      }
      setGrid(cloneGrid(animGrid));
      await new Promise((r) => setTimeout(r, 50));
    }

    const batchSize = Math.max(1, Math.floor(steps.length / 150));
    let i = 0;
    while (i < steps.length) {
      if (mazeAbort.current) break;
      const batch = steps.slice(i, i + batchSize);
      setGrid((prev) => {
        const next = cloneGrid(prev);
        for (const step of batch) {
          for (const { row, col } of step.cells) {
            const cell = next.cells[row][col];
            if (cell.type !== "start" && cell.type !== "end") {
              cell.type = step.type === "wall" ? "wall" : "maze-gen";
            }
          }
        }
        return next;
      });
      i += batchSize;
      setMazeStep(i);
      await new Promise((r) => setTimeout(r, 8));
    }

    setGrid(finalGrid);
    setMazeRunning(false);
    addToast("Maze generated!", "success");
  }, [mazeRunning, mazeAlgo, addToast]);

  const handleRunPathfinding = useCallback(async () => {
    if (mazeRunning) return;
    setMazeRunning(true);
    setMazeAnalytics(null);
    mazeAbort.current = false;

    const cleanGrid = resetGridForSearch(grid);
    setGrid(cleanGrid);
    await new Promise((r) => setTimeout(r, 30));

    const startTime = performance.now();
    const result = runPathfinding(cleanGrid, pathAlgo);
    const elapsed = performance.now() - startTime;

    const steps = result.steps;
    setMazeTotalSteps(steps.length);
    setMazeStep(0);

    const getDelay = () => Math.max(1, Math.floor((101 - speed) * 1.2));

    const workingGrid = cloneGrid(cleanGrid);
    let visitedCount = 0;
    let backtracks = 0;

    const descMap: Record<string, string> = {
      visit: "Exploring node...",
      frontier: "Adding to frontier queue",
      current: "Processing current node",
      backtrack: "↩ Backtracking (dead end)",
      path: "★ Tracing optimal path!",
    };

    for (let i = 0; i < steps.length; i++) {
      if (mazeAbort.current) break;
      const step = steps[i];
      setMazeDesc(descMap[step.type] || "");

      for (const { row, col } of step.cells) {
        const cell = workingGrid.cells[row][col];
        if (cell.type === "start" || cell.type === "end") continue;
        if (step.type === "visit") {
          cell.type = "visited";
          visitedCount++;
        } else if (step.type === "frontier") {
          cell.type = "frontier";
          visitedCount++;
        } else if (step.type === "current") {
          cell.type = "current";
        } else if (step.type === "backtrack") {
          cell.type = "backtrack";
          backtracks++;
        } else if (step.type === "path") {
          cell.type = "path";
        }
      }

      if (step.type === "current" && i > 0) {
        const prev = steps[i - 1];
        if (prev?.type === "current") {
          for (const { row, col } of prev.cells) {
            if (workingGrid.cells[row][col].type === "current") {
              workingGrid.cells[row][col].type = "visited";
            }
          }
        }
      }

      setGrid(cloneGrid(workingGrid));
      setMazeStep(i + 1);
      setMazeAnalytics({
        timeMs: elapsed,
        steps: i + 1,
        comparisons: 0,
        swaps: 0,
        visitedNodes: visitedCount,
        backtracks,
        pathLength: result.pathFound ? result.pathLength : undefined,
        memoryEstimate: Math.round(visitedCount * 48),
      });

      await new Promise((r) => setTimeout(r, getDelay()));
    }

    setMazeAnalytics({
      timeMs: elapsed,
      steps: steps.length,
      comparisons: 0,
      swaps: 0,
      visitedNodes: result.visitedCount,
      backtracks: result.backtracks,
      pathLength: result.pathFound ? result.pathLength : 0,
      memoryEstimate: Math.round(result.visitedCount * 48),
    });

    setMazeDesc("");
    setMazeRunning(false);
    if (result.pathFound) {
      addToast(`Path found! Length: ${result.pathLength} nodes`, "success");
    } else {
      addToast("No path exists to destination!", "error");
    }
  }, [mazeRunning, grid, pathAlgo, speed, addToast]);

  const handleClearPath = useCallback(() => {
    if (mazeRunning) return;
    setGrid((prev) => resetGridForSearch(prev));
    setMazeAnalytics(null);
    setMazeDesc("");
  }, [mazeRunning]);

  const handleClearAll = useCallback(() => {
    if (mazeRunning) return;
    setGrid(createGrid(GRID_ROWS, GRID_COLS));
    setMazeAnalytics(null);
    setMazeDesc("");
  }, [mazeRunning]);

  const handleStopMaze = useCallback(() => {
    mazeAbort.current = true;
    setMazeRunning(false);
  }, []);

  const handleGenerateArray = useCallback(() => {
    if (sortRunning) return;
    const arr = generateRandomArray(arraySize);
    maxBarValue.current = Math.max(...arr);
    setBars(arr.map((v, i) => ({ value: v, state: "default", id: i })));
    setSortAnalytics(null);
    setSortDesc("");
    setSortStep(0);
  }, [sortRunning, arraySize]);

  const handleRunSort = useCallback(async () => {
    if (sortRunning) return;
    setSortRunning(true);
    setSortAnalytics(null);
    sortAbort.current = false;

    const currentValues = bars.map((b) => b.value);
    const startTime = performance.now();
    const steps = generateSortSteps(currentValues, sortAlgo);
    const elapsed = performance.now() - startTime;

    setSortTotalSteps(steps.length);
    setSortStep(0);

    const getDelay = () => Math.max(1, Math.floor((101 - speed) * 1.5));

    for (let i = 0; i < steps.length; i++) {
      if (sortAbort.current) break;
      const step = steps[i];
      setBars(step.bars);
      setSortStep(i + 1);
      setSortDesc(step.description);
      setSortAnalytics({
        timeMs: elapsed,
        steps: i + 1,
        comparisons: step.comparisons,
        swaps: step.swaps,
      });
      await new Promise((r) => setTimeout(r, getDelay()));
    }

    if (!sortAbort.current && steps.length > 0) {
      const last = steps[steps.length - 1];
      setSortAnalytics({
        timeMs: elapsed,
        steps: steps.length,
        comparisons: last.comparisons,
        swaps: last.swaps,
      });
      setSortDesc("");
      addToast(
        `Sorted! ${last.comparisons} comparisons · ${last.swaps} swaps`,
        "success",
      );
    }
    setSortRunning(false);
  }, [sortRunning, bars, sortAlgo, speed, addToast]);

  const handleStopSort = useCallback(() => {
    sortAbort.current = true;
    setSortRunning(false);
  }, []);

  const loadPreset = useCallback(
    (type: "sorted" | "reverse" | "nearly") => {
      if (sortRunning) return;
      let arr: number[];
      if (type === "sorted")
        arr = Array.from(
          { length: arraySize },
          (_, i) => Math.floor((i * 390) / arraySize) + 10,
        );
      else if (type === "reverse")
        arr = Array.from(
          { length: arraySize },
          (_, i) => Math.floor(((arraySize - i) * 390) / arraySize) + 10,
        );
      else
        arr = Array.from({ length: arraySize }, (_, i) => {
          const v = Math.floor((i * 390) / arraySize) + 10;
          return Math.random() < 0.1 ? Math.floor(Math.random() * 390) + 10 : v;
        });
      maxBarValue.current = Math.max(...arr);
      setBars(arr.map((v, i) => ({ value: v, state: "default", id: i })));
      setSortAnalytics(null);
    },
    [sortRunning, arraySize],
  );

  return (
    <div
      className="min-h-screen grid-bg"
      style={{ background: "var(--bg-primary)" }}
    >
      <Toast toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <header
        ref={headerRef}
        style={{
          background: "rgba(3,7,18,0.92)",
          borderBottom: "1px solid rgba(0,245,255,0.1)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          marginTop: "20px",
          padding: "0 4px",
        }}
      >
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-3 my-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div
              style={{
                width: 34,
                height: 34,
                background:
                  "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(0,255,136,0.08))",
                border: "1px solid rgba(0,245,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect
                  x="1"
                  y="1"
                  width="7"
                  height="7"
                  stroke="#00f5ff"
                  strokeWidth="1.5"
                />
                <rect
                  x="12"
                  y="1"
                  width="7"
                  height="7"
                  stroke="#00ff88"
                  strokeWidth="1.5"
                />
                <rect
                  x="1"
                  y="12"
                  width="7"
                  height="7"
                  stroke="#8b5cf6"
                  strokeWidth="1.5"
                />
                <rect
                  x="12"
                  y="12"
                  width="7"
                  height="7"
                  stroke="#ff6b2b"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <div>
              <div
                className="font-display text-glow-cyan"
                style={{
                  fontSize: "15px",
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  color: "var(--accent-cyan)",
                }}
              >
                ALGOVIS
              </div>
              <div
                style={{
                  fontSize: "8px",
                  fontFamily: "Space Mono",
                  color: "var(--text-secondary)",
                  letterSpacing: "0.12em",
                }}
              >
                ALGORITHM VISUALIZER
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {(["maze", "sort"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "8px 20px",
                  cursor: "pointer",
                  fontFamily: "Orbitron",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  border: "none",
                  borderBottom: `2px solid ${tab === t ? "var(--accent-cyan)" : "transparent"}`,
                  color:
                    tab === t ? "var(--accent-cyan)" : "var(--text-secondary)",
                  background:
                    tab === t ? "rgba(0,245,255,0.06)" : "transparent",
                  transition: "all 0.2s",
                }}
              >
                {t === "maze" ? "◈ PATHFINDING" : "▊ SORTING"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div
              style={{
                fontSize: "10px",
                fontFamily: "Space Mono",
                color: "var(--text-secondary)",
              }}
            >
              <span style={{ color: "var(--accent-green)" }}>●</span> LIVE
            </div>
            <div
              style={{
                fontSize: "9px",
                fontFamily: "Space Mono",
                color: "var(--text-muted)",
              }}
            >
              v2.0
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-3 md:px-6 py-5">
        {/* ═══ PATHFINDING TAB ═══ */}
        {tab === "maze" && (
          <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
              style={{
                background: "rgba(10,15,30,0.7)",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "10px 16px",
              }}
            >
              <ControlGroup label="MAZE">
                <select
                  value={mazeAlgo}
                  onChange={(e) => setMazeAlgo(e.target.value as MazeAlgorithm)}
                  disabled={mazeRunning}
                >
                  <option value="recursive-division">Recursive Division</option>
                  <option value="dfs-maze">DFS Maze</option>
                  <option value="prims">Prim's Algorithm</option>
                  <option value="random">Random Walls</option>
                </select>
                <button
                  className="btn-purple"
                  onClick={handleGenerateMaze}
                  disabled={mazeRunning}
                >
                  GEN
                </button>
              </ControlGroup>

              <Divider />

              <ControlGroup label="SOLVE">
                <select
                  value={pathAlgo}
                  onChange={(e) => setPathAlgo(e.target.value as PathAlgorithm)}
                  disabled={mazeRunning}
                >
                  <option value="astar">A* Search</option>
                  <option value="dijkstra">Dijkstra</option>
                  <option value="bfs">BFS</option>
                  <option value="dfs">DFS</option>
                  <option value="gbfs">Greedy BFS</option>
                </select>
                {!mazeRunning ? (
                  <button
                    className="btn-success"
                    onClick={handleRunPathfinding}
                  >
                    ▶ RUN
                  </button>
                ) : (
                  <button className="btn-danger" onClick={handleStopMaze}>
                    ■ STOP
                  </button>
                )}
              </ControlGroup>

              <Divider />

              <ControlGroup label="DRAW">
                {(["wall", "erase", "start", "end"] as DrawMode[]).map(
                  (mode) => (
                    <button
                      key={mode}
                      onClick={() => setDrawMode(mode)}
                      disabled={mazeRunning}
                      style={{
                        padding: "6px 9px",
                        fontFamily: "Orbitron",
                        fontSize: "8px",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        cursor: mazeRunning ? "not-allowed" : "pointer",
                        border: `1px solid ${drawMode === mode ? "rgba(0,245,255,0.5)" : "rgba(255,255,255,0.08)"}`,
                        background:
                          drawMode === mode
                            ? "rgba(0,245,255,0.1)"
                            : "transparent",
                        color:
                          drawMode === mode
                            ? "var(--accent-cyan)"
                            : "var(--text-secondary)",
                        transition: "all 0.15s",
                      }}
                    >
                      {mode === "wall"
                        ? "■ WALL"
                        : mode === "erase"
                          ? "□ ERASE"
                          : mode === "start"
                            ? "▶ START"
                            : "◉ END"}
                    </button>
                  ),
                )}
              </ControlGroup>

              <Divider />

              <ControlGroup label="SPEED">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={speed}
                  onChange={(e) => setSpeed(+e.target.value)}
                  style={{ width: "80px" }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "Space Mono",
                    color: "var(--accent-cyan)",
                    minWidth: "32px",
                  }}
                >
                  {speed}%
                </span>
              </ControlGroup>

              <div className="flex gap-2 ml-auto">
                <button
                  className="btn-primary"
                  onClick={handleClearPath}
                  disabled={mazeRunning}
                >
                  CLR PATH
                </button>
                <button
                  className="btn-danger"
                  onClick={handleClearAll}
                  disabled={mazeRunning}
                >
                  RESET
                </button>
              </div>
            </div>

            <div className="flex gap-4 flex-col xl:flex-row">
              {/* Grid */}
              <div
                className="flex-1 min-w-0"
                style={{
                  background: "rgba(8,12,24,0.8)",
                  border: "1px solid rgba(0,245,255,0.07)",
                  padding: "12px",
                }}
              >
                <MazeGrid
                  grid={grid}
                  onCellClick={handleCellClick}
                  onCellDrag={handleCellDrag}
                  isRunning={mazeRunning}
                />
                <div className="mt-3">
                  <Legend mode="maze" />
                </div>
              </div>

              {/* Right panel */}
              <div className="flex flex-col gap-3 xl:w-[280px] shrink-0">
                <AlgoInfo algo={pathAlgo} />
                <AnalyticsPanel
                  analytics={mazeAnalytics}
                  isRunning={mazeRunning}
                  mode="maze"
                  currentStep={mazeStep}
                  totalSteps={mazeTotalSteps}
                  currentDesc={mazeDesc}
                />
                <div
                  style={{
                    background: "rgba(8,12,24,0.6)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "9px",
                      fontFamily: "Orbitron",
                      color: "var(--text-secondary)",
                      letterSpacing: "0.12em",
                      marginBottom: "8px",
                    }}
                  >
                    HOW TO USE
                  </div>
                  {[
                    "① Click/drag to draw walls",
                    "② Generate a maze algorithmically",
                    "③ Pick pathfinding algorithm",
                    "④ Press ▶ RUN to visualize",
                    "⑤ Pink cells = backtracking",
                    "⑥ Cyan line = optimal path",
                  ].map((s) => (
                    <div
                      key={s}
                      style={{
                        fontSize: "11px",
                        fontFamily: "Space Mono",
                        color: "var(--text-secondary)",
                        lineHeight: 2,
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ SORT TAB ═══ */}
        {tab === "sort" && (
          <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
              style={{
                background: "rgba(10,15,30,0.7)",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "10px 16px",
              }}
            >
              <ControlGroup label="ALGO">
                <select
                  value={sortAlgo}
                  onChange={(e) => setSortAlgo(e.target.value as SortAlgorithm)}
                  disabled={sortRunning}
                >
                  <option value="bubble">Bubble Sort</option>
                  <option value="selection">Selection Sort</option>
                  <option value="insertion">Insertion Sort</option>
                  <option value="merge">Merge Sort</option>
                  <option value="quick">Quick Sort</option>
                  <option value="heap">Heap Sort</option>
                  <option value="shell">Shell Sort</option>
                  <option value="radix">Radix Sort</option>
                </select>
              </ControlGroup>

              <Divider />

              <ControlGroup label="SIZE">
                <input
                  type="range"
                  min={10}
                  max={120}
                  value={arraySize}
                  onChange={(e) => setArraySize(+e.target.value)}
                  disabled={sortRunning}
                  style={{ width: "80px" }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "Space Mono",
                    color: "var(--accent-cyan)",
                    minWidth: "28px",
                  }}
                >
                  {arraySize}
                </span>
              </ControlGroup>

              <Divider />

              <ControlGroup label="SPEED">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={speed}
                  onChange={(e) => setSpeed(+e.target.value)}
                  style={{ width: "80px" }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "Space Mono",
                    color: "var(--accent-cyan)",
                    minWidth: "32px",
                  }}
                >
                  {speed}%
                </span>
              </ControlGroup>

              <Divider />

              <ControlGroup label="PRESET">
                {(["SORTED", "REVERSE", "NEARLY"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => loadPreset(p.toLowerCase() as any)}
                    disabled={sortRunning}
                    style={{
                      padding: "6px 8px",
                      fontFamily: "Orbitron",
                      fontSize: "8px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      cursor: sortRunning ? "not-allowed" : "pointer",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "transparent",
                      color: "var(--text-secondary)",
                      transition: "all 0.15s",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </ControlGroup>

              <div className="flex gap-2 ml-auto items-center">
                <button
                  className="btn-primary"
                  onClick={handleGenerateArray}
                  disabled={sortRunning}
                >
                  SHUFFLE
                </button>
                {!sortRunning ? (
                  <button className="btn-success" onClick={handleRunSort}>
                    ▶ SORT
                  </button>
                ) : (
                  <button className="btn-danger" onClick={handleStopSort}>
                    ■ STOP
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-4 flex-col xl:flex-row">
              {/* Bars */}
              <div
                className="flex-1 min-w-0"
                style={{
                  background: "rgba(8,12,24,0.8)",
                  border: "1px solid rgba(0,245,255,0.07)",
                  padding: "16px 12px 12px",
                }}
              >
                <SortVisualizer bars={bars} maxValue={maxBarValue.current} />
                <div className="mt-4">
                  <Legend mode="sort" />
                </div>
              </div>

              {/* Right panel */}
              <div className="flex flex-col gap-3 xl:w-[280px] shrink-0">
                <AlgoInfo algo={sortAlgo} />
                <AnalyticsPanel
                  analytics={sortAnalytics}
                  isRunning={sortRunning}
                  mode="sort"
                  currentStep={sortStep}
                  totalSteps={sortTotalSteps}
                  currentDesc={sortDesc}
                />
                {/* Complexity table */}
                <div
                  style={{
                    background: "rgba(8,12,24,0.6)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    padding: "12px 14px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "9px",
                      fontFamily: "Orbitron",
                      color: "var(--text-secondary)",
                      letterSpacing: "0.12em",
                      marginBottom: "8px",
                    }}
                  >
                    COMPLEXITY TABLE
                  </div>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "9px",
                      fontFamily: "Space Mono",
                    }}
                  >
                    <thead>
                      <tr>
                        {["ALGO", "BEST", "AVG", "WORST"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "3px 4px",
                              color: "var(--text-secondary)",
                              textAlign: "left",
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        [
                          ["bubble", "Bubble", "O(n)", "O(n²)", "O(n²)"],
                          ["selection", "Select", "O(n²)", "O(n²)", "O(n²)"],
                          ["insertion", "Insert", "O(n)", "O(n²)", "O(n²)"],
                          [
                            "merge",
                            "Merge",
                            "O(n log n)",
                            "O(n log n)",
                            "O(n log n)",
                          ],
                          [
                            "quick",
                            "Quick",
                            "O(n log n)",
                            "O(n log n)",
                            "O(n²)",
                          ],
                          [
                            "heap",
                            "Heap",
                            "O(n log n)",
                            "O(n log n)",
                            "O(n log n)",
                          ],
                          [
                            "shell",
                            "Shell",
                            "O(n log n)",
                            "O(n log²n)",
                            "O(n²)",
                          ],
                          ["radix", "Radix", "O(nk)", "O(nk)", "O(nk)"],
                        ] as [string, string, string, string, string][]
                      ).map(([key, name, best, avg, worst]) => (
                        <tr
                          key={key}
                          style={{
                            background:
                              sortAlgo === key
                                ? "rgba(0,245,255,0.04)"
                                : "transparent",
                          }}
                        >
                          <td
                            style={{
                              padding: "3px 4px",
                              color:
                                sortAlgo === key
                                  ? "var(--accent-cyan)"
                                  : "var(--text-primary)",
                              fontWeight: sortAlgo === key ? 700 : 400,
                            }}
                          >
                            {name}
                          </td>
                          <td
                            style={{
                              padding: "3px 4px",
                              color: "var(--accent-green)",
                              fontSize: "8px",
                            }}
                          >
                            {best}
                          </td>
                          <td
                            style={{
                              padding: "3px 4px",
                              color: "var(--accent-cyan)",
                              fontSize: "8px",
                            }}
                          >
                            {avg}
                          </td>
                          <td
                            style={{
                              padding: "3px 4px",
                              color: "var(--accent-orange)",
                              fontSize: "8px",
                            }}
                          >
                            {worst}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer
        style={{
          marginTop: "48px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          padding: "14px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            fontFamily: "Space Mono",
            color: "var(--text-muted)",
            letterSpacing: "0.05em",
          }}
        >
          ALGOVIS · Algorithm Visualizer · React + TypeScript + GSAP
        </div>
        <div
          style={{
            fontSize: "9px",
            fontFamily: "Space Mono",
            color: "var(--text-muted)",
          }}
        >
          5 PATHFINDING · 8 SORTING · 4 MAZE GENERATORS
        </div>
      </footer>
    </div>
  );
}

// Helper UI components
function ControlGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        style={{
          fontSize: "9px",
          fontFamily: "Orbitron",
          color: "var(--text-secondary)",
          letterSpacing: "0.12em",
          minWidth: "fit-content",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: "1px",
        height: "24px",
        background: "rgba(255,255,255,0.08)",
      }}
    />
  );
}

export default App;
