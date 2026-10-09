<template>
  <div class="cart-drawer">
    <!-- 輸入框 -->
    <input v-model.number="targetBudget" type="number" placeholder="目標金額" />
    
    <!-- 搜尋按鈕 -->
    <button @click="handleSearch" :disabled="isCalculating">
      {{ isCalculating ? '瘋狂計算中...' : '搜尋最佳商品組合' }}
    </button>

    <!-- 計算結果展示 -->
    <div v-if="results.length > 0" class="results-list">
      <h4>🎯 最接近預算的商品組合：</h4>
      <div v-for="(res, idx) in results" :key="idx" class="combo-card">
        <p><strong>組合 {{ idx + 1 }}</strong>（總價：\\({{ res.totalPrice }}，差額：\\){{ res.diff }}）</p>
        <ul>
          <li v-for="item in res.items" :key="item.id">
            {{ item.name }} - \${{ item.price }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useKnapsackSolver } from './composables/useKnapsackSolver.ts';

const targetBudget = ref<number>(500);

// 1. 解構出計算狀態、結果與執行函數
const { isCalculating, results, solve } = useKnapsackSolver();

// 測試用的假資料（後續可換成真正的 DOM 抓取邏輯）
const mockProducts = [
  { id: '1', name: '藍芽耳機', price: 299 },
  { id: '2', name: '手機支架', price: 150 },
  { id: '3', name: 'Type-C 充電線', price: 50 },
  { id: '4', name: '滑鼠墊', price: 99 },
  { id: '5', name: '保溫瓶', price: 199 },
  { id: '6', name: '桌面小風扇', price: 250 },
];

// 2. 在 handleSearch 中呼叫 solve
const handleSearch = () => {
  if (!targetBudget.value) return;

  console.log(`[主線程] 發送計算任務，目標金額: $${targetBudget.value}`);
  
  // 傳入商品陣列與目標金額
  solve(mockProducts, targetBudget.value);
};
</script>
