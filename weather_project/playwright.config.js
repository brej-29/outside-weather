import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir:'./tests/e2e', use:{baseURL:process.env.LIVE_URL || 'http://127.0.0.1:4173'}, webServer:process.env.LIVE_URL ? undefined : { command:'node scripts/serve.mjs',url:'http://127.0.0.1:4173',reuseExistingServer:true }, reporter:'list' });
