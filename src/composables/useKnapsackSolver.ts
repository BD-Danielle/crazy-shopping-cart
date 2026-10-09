import { ref, onUnmounted } from 'vue';
import KnapsackWorker from '../workers/knapsack.worker.ts?worker&inline';
import { findBestCombinations, type CombinationResult, type Item } from '../utils/knapsack';

export function useKnapsackSolver() {
  const isCalculating = ref(false);
  const results = ref<CombinationResult[]>([]);
  const error = ref<string | null>(null);
  let worker: Worker | null = null;
  let currentTask: { items: Item[]; targetBudget: number } | null = null;

  const solveOnMainThread = (items: Item[], targetBudget: number) => {
    try {
      results.value = findBestCombinations(items, targetBudget);
      error.value = null;
    } catch (err) {
      console.error('[主線程計算錯誤]:', err);
      error.value = '商品組合計算失敗，請稍後再試。';
    } finally {
      isCalculating.value = false;
    }
  };

  const handleWorkerFailure = (message: string, items: Item[], targetBudget: number) => {
    console.error(message);
    worker?.terminate();
    worker = null;
    currentTask = null;
    solveOnMainThread(items, targetBudget);
  };

  // 初始化 Worker 並設定監聽
  const initWorker = () => {
    if (!worker) {
      worker = new KnapsackWorker();

      // 接收來自 Worker 的計算結果
      worker.onmessage = (e: MessageEvent<{ combinations: CombinationResult[] }>) => {
        results.value = e.data.combinations;
        error.value = null;
        isCalculating.value = false;
      };

      worker.onerror = (event) => {
        event.preventDefault();
        if (currentTask) {
          handleWorkerFailure(
            '[Worker 執行錯誤，改由主執行緒計算]',
            currentTask.items,
            currentTask.targetBudget,
          );
        }
      };

      worker.onmessageerror = () => {
        if (currentTask) {
          handleWorkerFailure(
            '[Worker 訊息錯誤，改由主執行緒計算]',
            currentTask.items,
            currentTask.targetBudget,
          );
        }
      };
    }
  };

  // 執行計算的函數
  const solve = (items: Item[], targetBudget: number) => {
    if (targetBudget <= 0 || items.length === 0) {
      results.value = [];
      return;
    }

    error.value = null;
    results.value = [];
    isCalculating.value = true;
    currentTask = { items, targetBudget };

    try {
      initWorker();
      worker?.postMessage({ items, targetBudget });
    } catch (err) {
      handleWorkerFailure('[Worker 啟動或通訊錯誤，改由主執行緒計算]', items, targetBudget);
    }
  };

  // 組件卸載時，自動銷毀 Worker 釋放記憶體
  onUnmounted(() => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
    currentTask = null;
  });

  return {
    isCalculating,
    results,
    error,
    solve,
  };
}