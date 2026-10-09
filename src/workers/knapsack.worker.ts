import { findBestCombinations, type Item } from '../utils/knapsack';

// 監聽主線程發送過來的消息
self.onmessage = (e: MessageEvent<{ items: Item[]; targetBudget: number }>) => {
  const { items, targetBudget } = e.data;
  self.postMessage({ combinations: findBestCombinations(items, targetBudget) });
};