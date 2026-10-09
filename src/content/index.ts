import { createApp } from 'vue';
import App from './App.vue';
import styleText from './style.css?inline'; // 載入外掛專屬 CSS 為字串

function mountExtension() {
  // 1. 建立外掛宿主節點 (Host Element)
  const hostDiv = document.createElement('div');
  hostDiv.id = 'crazy-cart-extension-root';
  document.body.appendChild(hostDiv);

  // 2. 建立 Shadow Root (開啟 Open 模式)
  const shadowRoot = hostDiv.attachShadow({ mode: 'open' });

  // 3. 注入外掛樣式至 Shadow DOM 內部
  const styleEl = document.createElement('style');
  styleEl.textContent = styleText;
  shadowRoot.appendChild(styleEl);

  // 4. 建立 Vue 掛載容器
  const appContainer = document.createElement('div');
  appContainer.id = 'app';
  shadowRoot.appendChild(appContainer);

  // 5. 將 Vue 3 應用掛載於 Shadow DOM 容器內
  const app = createApp(App);
  app.mount(appContainer);

  console.log('[Crazy Cart] 瘋狂購物車外掛成功無痕注入！');
}

// 執行掛載
mountExtension();