import type { SortStep, SortBar, SortAlgorithm } from '../types';

function makeStep(bars: SortBar[], desc: string, comps: number, swaps: number, sorted: number[] = [], comparing: number[] = [], swapping: number[] = [], pivot?: number, min?: number): SortStep {
  const newBars = bars.map((b, i) => ({
    ...b,
    state: sorted.includes(i) ? 'sorted' as const
      : i === pivot ? 'pivot' as const
      : i === min ? 'min' as const
      : swapping.includes(i) ? 'swapping' as const
      : comparing.includes(i) ? 'comparing' as const
      : 'default' as const
  }));
  return { bars: newBars, description: desc, comparisons: comps, swaps, sorted: sorted, comparing, swapping, pivot, min };
}

export function generateSortSteps(arr: number[], algorithm: SortAlgorithm): SortStep[] {
  const steps: SortStep[] = [];
  let comps = 0;
  let swaps = 0;
  const sorted: number[] = [];

  if (algorithm === 'bubble') {
    const a = [...arr];
    for (let i = 0; i < a.length - 1; i++) {
      for (let j = 0; j < a.length - i - 1; j++) {
        comps++;
        steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Comparing [${j}] and [${j+1}]`, comps, swaps, [...sorted], [j, j+1]));
        if (a[j] > a[j+1]) {
          [a[j], a[j+1]] = [a[j+1], a[j]];
          swaps++;
          steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Swapping [${j}] and [${j+1}]`, comps, swaps, [...sorted], [], [j, j+1]));
        }
      }
      sorted.push(a.length - 1 - i);
      steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Position ${a.length-1-i} sorted`, comps, swaps, [...sorted]));
    }
    sorted.push(0);
    steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), 'Array sorted!', comps, swaps, [...Array(a.length).keys()]));
  }

  else if (algorithm === 'selection') {
    const a = [...arr];
    for (let i = 0; i < a.length - 1; i++) {
      let minIdx = i;
      steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Finding min from index ${i}`, comps, swaps, [...sorted], [], [], undefined, minIdx));
      for (let j = i + 1; j < a.length; j++) {
        comps++;
        steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Comparing with [${j}]`, comps, swaps, [...sorted], [j], [], undefined, minIdx));
        if (a[j] < a[minIdx]) {
          minIdx = j;
          steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `New min at [${j}]`, comps, swaps, [...sorted], [], [], undefined, minIdx));
        }
      }
      if (minIdx !== i) {
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
        swaps++;
        steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Swapping min to position ${i}`, comps, swaps, [...sorted], [], [i, minIdx]));
      }
      sorted.push(i);
    }
    sorted.push(a.length - 1);
    steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), 'Array sorted!', comps, swaps, [...Array(a.length).keys()]));
  }

  else if (algorithm === 'insertion') {
    const a = [...arr];
    sorted.push(0);
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      let j = i - 1;
      steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Inserting value ${key}`, comps, swaps, [...sorted], [i]));
      while (j >= 0 && a[j] > key) {
        comps++;
        steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Shifting [${j}] right`, comps, swaps, [...sorted], [j, j+1]));
        a[j + 1] = a[j];
        swaps++;
        steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Moved ${a[j]} right`, comps, swaps, [...sorted], [], [j, j+1]));
        j--;
      }
      a[j + 1] = key;
      sorted.push(i);
      steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Placed ${key} at position ${j+1}`, comps, swaps, [...sorted]));
    }
    steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), 'Array sorted!', comps, swaps, [...Array(a.length).keys()]));
  }

  else if (algorithm === 'merge') {
    const a = [...arr];
    
    function mergeSort(arr: number[], left: number, right: number) {
      if (left >= right) return;
      const mid = Math.floor((left + right) / 2);
      mergeSort(arr, left, mid);
      mergeSort(arr, mid + 1, right);
      merge(arr, left, mid, right);
    }

    function merge(arr: number[], left: number, mid: number, right: number) {
      const L = arr.slice(left, mid + 1);
      const R = arr.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;
      while (i < L.length && j < R.length) {
        comps++;
        steps.push(makeStep(arr.map((v,idx) => ({value:v,state:'default',id:idx})), `Merging: comparing L[${i}]=${L[i]} vs R[${j}]=${R[j]}`, comps, swaps, [...sorted], [left+i, mid+1+j]));
        if (L[i] <= R[j]) {
          arr[k++] = L[i++];
        } else {
          arr[k++] = R[j++];
          swaps++;
        }
        steps.push(makeStep(arr.map((v,idx) => ({value:v,state:'default',id:idx})), `Placed value at position ${k-1}`, comps, swaps, [...sorted], [], [k-1]));
      }
      while (i < L.length) { arr[k++] = L[i++]; }
      while (j < R.length) { arr[k++] = R[j++]; }
    }

    mergeSort(a, 0, a.length - 1);
    steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), 'Array sorted!', comps, swaps, [...Array(a.length).keys()]));
  }

  else if (algorithm === 'quick') {
    const a = [...arr];

    function quickSort(arr: number[], low: number, high: number) {
      if (low < high) {
        const pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
      } else if (low === high) {
        sorted.push(low);
      }
    }

    function partition(arr: number[], low: number, high: number): number {
      const pivot = arr[high];
      steps.push(makeStep(arr.map((v,idx) => ({value:v,state:'default',id:idx})), `Pivot = ${pivot} at [${high}]`, comps, swaps, [...sorted], [], [], high));
      let i = low - 1;
      for (let j = low; j < high; j++) {
        comps++;
        steps.push(makeStep(arr.map((v,idx) => ({value:v,state:'default',id:idx})), `Comparing [${j}] with pivot`, comps, swaps, [...sorted], [j], [], high));
        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;
          steps.push(makeStep(arr.map((v,idx) => ({value:v,state:'default',id:idx})), `Swapping [${i}] and [${j}]`, comps, swaps, [...sorted], [], [i, j], high));
        }
      }
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      swaps++;
      sorted.push(i + 1);
      steps.push(makeStep(arr.map((v,idx) => ({value:v,state:'default',id:idx})), `Pivot placed at ${i+1}`, comps, swaps, [...sorted], [], [i+1, high]));
      return i + 1;
    }

    quickSort(a, 0, a.length - 1);
    steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), 'Array sorted!', comps, swaps, [...Array(a.length).keys()]));
  }

  else if (algorithm === 'heap') {
    const a = [...arr];
    const n = a.length;

    function heapify(arr: number[], n: number, i: number) {
      let largest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      steps.push(makeStep(arr.map((v,idx) => ({value:v,state:'default',id:idx})), `Heapifying at ${i}`, comps, swaps, [...sorted], [i, l < n ? l : i, r < n ? r : i]));
      if (l < n) { comps++; if (arr[l] > arr[largest]) largest = l; }
      if (r < n) { comps++; if (arr[r] > arr[largest]) largest = r; }
      if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        swaps++;
        steps.push(makeStep(arr.map((v,idx) => ({value:v,state:'default',id:idx})), `Swapping [${i}] and [${largest}]`, comps, swaps, [...sorted], [], [i, largest]));
        heapify(arr, n, largest);
      }
    }

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(a, n, i);
    steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), 'Max heap built', comps, swaps, [...sorted]));

    for (let i = n - 1; i > 0; i--) {
      [a[0], a[i]] = [a[i], a[0]];
      swaps++;
      sorted.push(i);
      steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Extracted max to position ${i}`, comps, swaps, [...sorted], [], [0, i]));
      heapify(a, i, 0);
    }
    sorted.push(0);
    steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), 'Array sorted!', comps, swaps, [...Array(n).keys()]));
  }

  else if (algorithm === 'shell') {
    const a = [...arr];
    let gap = Math.floor(a.length / 2);
    while (gap > 0) {
      steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Gap = ${gap}`, comps, swaps, [...sorted]));
      for (let i = gap; i < a.length; i++) {
        const temp = a[i];
        let j = i;
        while (j >= gap && a[j - gap] > temp) {
          comps++;
          steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Comparing [${j}] and [${j-gap}]`, comps, swaps, [...sorted], [j, j-gap]));
          a[j] = a[j - gap];
          swaps++;
          steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Shifting [${j-gap}] to [${j}]`, comps, swaps, [...sorted], [], [j, j-gap]));
          j -= gap;
        }
        a[j] = temp;
      }
      gap = Math.floor(gap / 2);
    }
    steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), 'Array sorted!', comps, swaps, [...Array(a.length).keys()]));
  }

  else if (algorithm === 'radix') {
    const a = [...arr];
    const max = Math.max(...a);
    let exp = 1;
    while (Math.floor(max / exp) > 0) {
      const output = Array(a.length).fill(0);
      const count = Array(10).fill(0);
      steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Processing digit place ${exp}`, comps, swaps, [...sorted]));
      for (let i = 0; i < a.length; i++) {
        count[Math.floor(a[i] / exp) % 10]++;
        comps++;
      }
      for (let i = 1; i < 10; i++) count[i] += count[i-1];
      for (let i = a.length - 1; i >= 0; i--) {
        output[count[Math.floor(a[i] / exp) % 10] - 1] = a[i];
        count[Math.floor(a[i] / exp) % 10]--;
        swaps++;
      }
      for (let i = 0; i < a.length; i++) {
        a[i] = output[i];
        steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), `Placed ${a[i]} at ${i}`, comps, swaps, [...sorted], [], [i]));
      }
      exp *= 10;
    }
    steps.push(makeStep(a.map((v,idx) => ({value:v,state:'default',id:idx})), 'Array sorted!', comps, swaps, [...Array(a.length).keys()]));
  }

  return steps;
}

export function generateRandomArray(size: number, max = 400): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 10);
}
