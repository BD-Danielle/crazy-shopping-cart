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

export function findBestCombinations(items: Item[], targetBudget: number): CombinationResult[] {
  const validItems = items.filter((item) => item.price <= targetBudget);
  const results: CombinationResult[] = [];

  function findCombinations(startIndex: number, currentCombo: Item[], currentSum: number) {
    if (currentCombo.length > 0) {
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
        currentCombo.pop();
      }
    }
  }

  findCombinations(0, [], 0);
  results.sort((a, b) => a.diff - b.diff);

  return results.slice(0, 5);
}
