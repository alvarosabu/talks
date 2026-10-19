import { templateCompilerOptions } from '@tresjs/core'
import typegpuPlugin from 'unplugin-typegpu/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // Slidev merges this file into the deck's Vite config, so the 'use gpu' transform runs wherever the theme is used
  plugins: [typegpuPlugin()],
  slidev: {
    vue: {
      ...templateCompilerOptions,
    },
  },
})
