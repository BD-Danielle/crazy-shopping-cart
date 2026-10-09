import { ref, onUnmounted } from 'vue';
// 利用 Vite 的 ?worker 語法導入 Worker
import KnapsackWorker from '../workers/knapsack.worker.ts?worker';

export interface Item {
  id: string;
  name: string;
  price: number;
}

export interface CombinationResult {
  items: Item[];
  totalPrice: number;
  diff: number;
}

export function useKnapsackSolver() {
  const isCalculating = ref(false);
  const results = ref<CombinationResult[]>([]);
  let worker: Worker | null = null;

  // 初始化 Worker 並設定監聽
  const initWorker = () => {
    if (!worker) {
      worker = new KnapsackWorker();

      // 接收來自 Worker 的計算結果
      worker.onmessage = (e: MessageEvent<{ combinations: CombinationResult[] }>) => {
        results.value = e.data.combinations;
        isCalculating.value = false;
      };

      worker.onerror = (err) => {
        console.error('[Worker 錯誤]:', err);
        isCalculating.value = false;
      };
    }
  };

  // 執行計算的函數
  const solve = (items: Item[], targetBudget: number) => {
    if (targetBudget <= 0 || items.length === 0) {
      results.value = [];
      return;
    }

    initWorker();
    isCalculating.value = true;

    // 向 Web Worker 發送消息觸發計算
    worker?.postMessage({ items, targetBudget });
  };

  // 組件卸載時，自動銷毀 Worker 釋放記憶體
  onUnmounted(() => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
  });

  return {
    isCalculating,
    results,
    solve,
  };
}