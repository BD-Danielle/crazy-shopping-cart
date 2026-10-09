import { ref, onUnmounted } from 'vue';
import KnapsackWorker from '../workers/knapsack.worker.ts?worker&inline';
import {
  findBestCombinations,
  type CombinationResult,
  type Item,
} from '../utils/knapsack';

export function useKnapsackSolver() {
  const isCalculating = ref(false);
  const results = ref<CombinationResult[]>([]);
  const executionTime = ref<number>(0);
  let worker: Worker | null = null;

  const solveOnMainThread = (items: Item[], targetBudget: number, maxResults: number) => {
    const startTime = performance.now();
    try {
      results.value = findBestCombinations(items, targetBudget, maxResults);
      executionTime.value = Number((performance.now() - startTime).toFixed(2));
    } catch (error) {
      console.error('[商品組合計算錯誤]:', error);
      results.value = [];
    } finally {
      isCalculating.value = false;
    }
  };

  const solve = (items: Item[], targetBudget: number, maxResults = 5) => {
    if (!targetBudget || targetBudget <= 0 || items.length === 0) {
      results.value = [];
      return;
    }

    worker?.terminate();
    worker = null;
    isCalculating.value = true;
    results.value = [];
    executionTime.value = 0;

    let currentWorker: Worker;
    try {
      currentWorker = new KnapsackWorker();
    } catch (error) {
      console.error('[Knapsack Worker 啟動失敗，改由主執行緒計算]:', error);
      solveOnMainThread(items, targetBudget, maxResults);
      return;
    }

    worker = currentWorker;

    currentWorker.onmessage = (
      e: MessageEvent<{
        combinations: CombinationResult[];
        executionTimeMs: number;
      }>
    ) => {
      if (worker !== currentWorker) return;
      results.value = e.data.combinations;
      executionTime.value = e.data.executionTimeMs;
      isCalculating.value = false;
      currentWorker.terminate();
      worker = null;
    };

    const fallbackToMainThread = (error: Event | MessageEvent) => {
      if (worker !== currentWorker) return;
      error.preventDefault();
      console.error('[Knapsack Worker 無法執行，改由主執行緒計算]:', error);
      currentWorker.terminate();
      worker = null;
      solveOnMainThread(items, targetBudget, maxResults);
    };

    currentWorker.onerror = fallbackToMainThread;
    currentWorker.onmessageerror = fallbackToMainThread;

    try {
      currentWorker.postMessage({ items, targetBudget, maxResults });
    } catch (error) {
      console.error('[Knapsack Worker 啟動失敗，改由主執行緒計算]:', error);
      currentWorker.terminate();
      worker = null;
      solveOnMainThread(items, targetBudget, maxResults);
    }
  };

  // 組件卸載時，自動銷毀 Worker 避免記憶體洩漏
  onUnmounted(() => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
  });

  return {
    isCalculating,
    results,
    executionTime,
    solve,
  };
}