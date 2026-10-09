<template>
  <div class="cart-drawer-container">
    <!-- 浮動觸發按鈕 -->
    <button class="toggle-btn" @click="isOpen = !isOpen">
      🛒 瘋狂購物車
    </button>

    <!-- 側邊抽屜介面 -->
    <div v-if="isOpen" class="drawer-panel">
      <div class="drawer-header">
        <h2>🎯 目標預算搜尋</h2>
        <button @click="isOpen = false" class="close-btn">✕</button>
      </div>

      <div class="drawer-body">
        <label>請輸入目標總金額：</label>
        <input 
          v-model.number="targetBudget" 
          type="number" 
          placeholder="例如: 500"
          class="budget-input"
        />
        <button @click="handleSearch" class="search-btn">
          搜尋最佳商品組合
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isOpen = ref(false);
const targetBudget = ref<number | null>(500);

const handleSearch = () => {
  console.log(`開始搜尋目標預算: $${targetBudget.value} 元的商品組合...`);
  // 下一步將在此處調用 useKnapsackSolver (Web Worker)
};
</script>