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

export function findBestCombinations(
  items: Item[],
  targetBudget: number,
  maxResults = 5,
): CombinationResult[] {
  const validItems = items
    .filter((item) => Number.isFinite(item.price) && item.price > 0 && item.price <= targetBudget)
    .sort((a, b) => b.price - a.price);
  const results: CombinationResult[] = [];
  const seenCombinations = new Set<string>();
  let searchSteps = 0;
  const maxSearchSteps = 50_000;

  function findCombinations(startIndex: number, currentCombo: Item[], currentSum: number) {
    searchSteps += 1;
    if (searchSteps > maxSearchSteps) return;

    if (currentCombo.length > 0) {
      const comboKey = currentCombo.map((item) => item.id).sort().join(',');
      if (seenCombinations.has(comboKey)) return;
      seenCombinations.add(comboKey);
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
  results.sort((a, b) => a.diff - b.diff || b.items.length - a.items.length);

  return results.slice(0, maxResults);
}
