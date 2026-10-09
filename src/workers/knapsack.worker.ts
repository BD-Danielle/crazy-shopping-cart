export interface Item {
  id: string;
  name: string;
  price: number;
  image?: string;
  url?: string;
}

export interface CombinationResult {
  items: Item[];
  totalPrice: number;
  diff: number; // 與目標金額的差額 (targetBudget - totalPrice)
}

export interface WorkerInput {
  items: Item[];
  targetBudget: number;
  maxResults?: number;
}

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { items, targetBudget, maxResults = 5 } = e.data;
  const startTime = performance.now();

  // 1. 過濾無效商品（單價 <= 0 或大於目標預算），並依價格由大到小排序（有利於加速剪枝）
  const validItems = items
    .filter((item) => item.price > 0 && item.price <= targetBudget)
    .sort((a, b) => b.price - a.price);

  const results: CombinationResult[] = [];
  const seenCombinations = new Set<string>();

  // 設置最大遞迴步數，防止商品數量極大時計算超時
  let searchSteps = 0;
  const MAX_SEARCH_STEPS = 50000;

  // 2. 回溯法 (DFS) + 剪枝搜尋組合
  function backtrack(startIndex: number, currentCombo: Item[], currentSum: number) {
    searchSteps++;
    if (searchSteps > MAX_SEARCH_STEPS) return;

    // 若當前組合有商品，記錄有效組合
    if (currentCombo.length > 0) {
      const comboKey = currentCombo.map((i) => i.id).sort().join(',');
      if (!seenCombinations.has(comboKey)) {
        seenCombinations.add(comboKey);
        results.push({
          items: [...currentCombo],
          totalPrice: currentSum,
          diff: targetBudget - currentSum,
        });
      }
    }

    for (let i = startIndex; i < validItems.length; i++) {
      const item = validItems[i];
      // 剪枝條件：若加入此商品超預算，直接跳過
      if (currentSum + item.price <= targetBudget) {
        currentCombo.push(item);
        backtrack(i + 1, currentCombo, currentSum + item.price);
        currentCombo.pop(); // 回溯，還原狀態
      }
    }
  }

  backtrack(0, [], 0);

  // 3. 排序結果：差額最小（最接近目標額）優先；差額相同時，商品數量較多者優先
  results.sort((a, b) => {
    if (a.diff !== b.diff) return a.diff - b.diff;
    return b.items.length - a.items.length;
  });

  const topResults = results.slice(0, maxResults);
  const executionTime = (performance.now() - startTime).toFixed(2);

  // 4. 將計算結果與耗時回傳給主線程
  self.postMessage({
    combinations: topResults,
    totalEvaluated: results.length,
    executionTimeMs: Number(executionTime),
  });
};