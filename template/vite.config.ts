import { resolve } from 'node:path'
import process from 'node:process'
import Vue from '@vitejs/plugin-vue'
import { briefingPlugin } from 'briefing-plugin-sdk/vite'
import { defineConfig } from 'vite'

// `vite build` makes the plugin folder dist/ (see briefingPlugin), `vite`
// runs index.html for working on the plugin standalone
export default defineConfig({
  plugins: [Vue(), briefingPlugin()],
  resolve: {
    alias: { '@/': `${resolve(process.cwd(), 'src')}/` },
  },
})
