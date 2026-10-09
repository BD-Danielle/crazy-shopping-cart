import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: '瘋狂購物車 Crazy Shopping Cart',
  version: '1.0.0',
  action: {
    default_title: '開啟瘋狂購物車',
  },
  content_scripts: [
    {
      matches: ['https://*.pchome.tw/*', 'https://*.shopee.tw/*', 'https://*.momo.com.tw/*'], // 目標購物平台
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
    },
  ],
  permissions: ['storage', 'activeTab'],
}));