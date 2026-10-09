// 商品與結果資料結構定義
export interface Item {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface CombinationResult {
  items: Item[];
  totalPrice: number;
  diff: number; // 與目標金額的差距
}

// 監聽主線程發送過來的消息
self.onmessage = (e: MessageEvent<{ items: Item[]; targetBudget: number }>) => {
  const { items, targetBudget } = e.data;

  // 1. 過濾掉單價直接超過預算的商品
  const validItems = items.filter((item) => item.price <= targetBudget);

  // 2. 演算法邏輯：尋找組合總和極大化且 <= targetBudget 的組合 (示範貪婪/組合搜尋)
  const results: CombinationResult[] = [];

  // (此處先寫簡單的組合搜尋邏輯，示範通訊機制)
  function findCombinations(startIndex: number, currentCombo: Item[], currentSum: number) {
    if (currentSum <= targetBudget && currentCombo.length > 0) {
      results.push({
        items: [...currentCombo],
        totalPrice: currentSum,
        diff: targetBudget - currentSum,
      });
    }

    for (let i = startIndex; i < validItems.length; i++) {
      const item = validItems[i];
      if (currentSum + item.price <= targetBudget) {
        currentCombo.push(item);
        findCombinations(i + 1, currentCombo, currentSum + item.price);
        currentCombo.pop(); // 回溯
      }
    }
  }

  findCombinations(0, [], 0);

  // 3. 依據「差距最小（最接近目標金額）」進行排序，取前 5 組最佳解
  results.sort((a, b) => a.diff - b.diff);
  const topCombinations = results.slice(0, 5);

  // 4. 將計算結果回傳給主線程
  self.postMessage({ combinations: topCombinations });
};