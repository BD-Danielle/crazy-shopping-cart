<template>
  <div class="knapsack-panel">
    <h3>🎯 瘋狂購物車 - 組合密碼</h3>
    
    <div class="input-group">
      <label>目標金額 ($)：</label>
      <input v-model.number="targetBudget" type="number" min="1" placeholder="輸入目標預算" />
      <button @click="handleSearch" :disabled="isCalculating">
        {{ isCalculating ? '計算中...' : '開始湊單' }}
      </button>
    </div>

    <!-- 計算耗時統計 -->
    <p v-if="executionTime > 0" class="time-stat">
      ⚡ 運算完成！耗時 {{ executionTime }} ms
    </p>

    <!-- 結果清單 -->
    <div v-if="results.length > 0" class="combo-results">
      <div v-for="(combo, index) in results" :key="index" class="combo-card">
        <div class="card-header">
          <span class="badge">最佳解 #{{ index + 1 }}</span>
          <span class="price-info">總計: <strong>${{ combo.totalPrice }}</strong> (差額: ${{ combo.diff }})</span>
        </div>
        <ul class="item-list">
          <li v-for="item in combo.items" :key="item.id">
            🔹 {{ item.name }} - <strong>${{ item.price }}</strong>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useKnapsackSolver } from '../composables/useKnapsackSolver';
import type { Item } from '../utils/knapsack';

const targetBudget = ref<number>(500);

const { isCalculating, results, executionTime, solve } = useKnapsackSolver();

// 測試用商品列表（模擬蝦皮/momo搜尋頁面上抓到的商品）
const mockProducts: Item[] = [
  { id: 'p1', name: '無線耳機', price: 299 },
  { id: 'p2', name: '桌面風扇', price: 199 },
  { id: 'p3', name: '手機支架', price: 150 },
  { id: 'p4', name: 'Type-C 快充線', price: 99 },
  { id: 'p5', name: '滑鼠墊', price: 50 },
  { id: 'p6', name: '保溫杯', price: 250 },
  { id: 'p7', name: '藍芽喇叭', price: 450 },
];

const handleSearch = () => {
  solve(mockProducts, targetBudget.value);
};
</script>