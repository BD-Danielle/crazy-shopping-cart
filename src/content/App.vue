<template>
  <div class="cart-drawer-container">
    <button
      class="toggle-btn"
      type="button"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      🛒 瘋狂購物車
    </button>

    <section v-if="isOpen" class="drawer-panel" aria-label="瘋狂購物車">
      <header class="drawer-header">
        <h2>🎯 目標預算搜尋</h2>
        <button class="close-btn" type="button" aria-label="關閉" @click="isOpen = false">
          ✕
        </button>
      </header>

      <form class="drawer-body" @submit.prevent="handleSearch">
        <label for="target-budget">請輸入目標總金額：</label>
        <input
          id="target-budget"
          v-model.number="targetBudget"
          class="budget-input"
          type="number"
          min="1"
          step="1"
          placeholder="例如：500"
          required
        />
        <button class="search-btn" type="submit" :disabled="isCalculating">
          {{ isCalculating ? '瘋狂計算中...' : '搜尋最佳商品組合' }}
        </button>
      </form>

      <p v-if="error" class="message error-message" role="alert">{{ error }}</p>
      <p v-else-if="isCalculating" class="message" role="status">正在計算商品組合…</p>
      <div v-else-if="hasSearched && results.length === 0" class="message" role="status">
        找不到符合預算的商品組合。
      </div>

      <div v-if="results.length > 0" class="results-list" aria-live="polite">
        <h3>最接近預算的商品組合</h3>
        <article v-for="(res, idx) in results" :key="idx" class="combo-card">
          <h4>組合 {{ idx + 1 }}</h4>
          <p>總價：${{ res.totalPrice }}・差額：${{ res.diff }}</p>
          <ul>
            <li v-for="item in res.items" :key="item.id">
              {{ item.name }} - ${{ item.price }}
            </li>
          </ul>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useKnapsackSolver } from '../composables/useKnapsackSolver';

const isOpen = ref(false);
const targetBudget = ref<number>(500);
const hasSearched = ref(false);

// 1. 解構出計算狀態、結果與執行函數
const { isCalculating, results, error, solve } = useKnapsackSolver();

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
  if (!Number.isFinite(targetBudget.value) || targetBudget.value <= 0) {
    return;
  }

  hasSearched.value = true;
  console.log(`[主線程] 發送計算任務，目標金額: $${targetBudget.value}`);
  
  // 傳入商品陣列與目標金額
  solve(mockProducts, targetBudget.value);
};
</script>
