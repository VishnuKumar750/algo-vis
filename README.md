# AlgoVis — Algorithm Visualizer

A production-grade algorithm visualizer built with **React + TypeScript + Vite + Tailwind CSS + GSAP**.

## Features

### 🗺 Pathfinding Visualizer
- **5 Algorithms**: A*, Dijkstra, BFS, DFS, Greedy BFS
- **4 Maze Generators**: Recursive Division, DFS Maze, Prim's Algorithm, Random
- Interactive wall drawing (click & drag)
- Move start/end nodes anywhere
- **Backtracking visualization** in pink — watch DFS explore dead ends
- Real-time analytics: time, visited nodes, path length, memory estimate

### 📊 Sorting Visualizer
- **8 Algorithms**: Bubble, Selection, Insertion, Merge, Quick, Heap, Shell, Radix
- Adjustable array size (10–120 elements)
- Preset arrays: Random, Sorted, Reverse, Nearly Sorted
- Color-coded states: comparing, swapping, pivot, minimum, sorted
- Real-time comparisons/swaps counter
- Big-O complexity table

### 🎨 Design
- Dark cyberpunk aesthetic with cyan/green neon glow
- Fully responsive (mobile & desktop)
- GSAP-powered smooth animations
- Orbitron + Space Mono + Rajdhani typography

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Tech Stack
- React 18 + TypeScript
- Vite 6
- Tailwind CSS v4
- GSAP 3
- Space Mono / Orbitron / Rajdhani fonts
