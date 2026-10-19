import type { ShikiSetupReturn } from '@slidev/types'
import { defineShikiSetup } from '@slidev/types'

// Frappé in both schemes, so code blocks match the blog and stay dark on a light slide
export default defineShikiSetup((): ShikiSetupReturn => {
  return {
    themes: {
      dark: 'catppuccin-frappe',
      light: 'catppuccin-frappe',
    },
  }
})
