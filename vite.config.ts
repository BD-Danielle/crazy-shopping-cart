import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config.ts';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    // 1. 路徑別名（需確保安裝了 npm i -D @types/node）
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    // 2. 基礎外掛
    plugins: [vue(), crx({ manifest })],

    // 3. 開發伺服器與代理
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (pathStr) => pathStr.replace(/^\/api/, ''),
        },
      },
    },

    // 4. 生產環境通用打包優化
    build: {
      target: 'es2015',
      outDir: 'dist',
      chunkSizeWarningLimit: 1500,

      // 生產環境自動移除 console 與 debugger
      esbuild: {
        drop: mode === 'production' ? ['console', 'debugger'] : [],
      },

    },
  };
});