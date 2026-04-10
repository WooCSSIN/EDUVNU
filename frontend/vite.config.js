import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    include: ['./tests/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    reporters: ['default', 'html', 'json'],
    outputFile: {
      json: '../reports/frontend-results.json',
      html: '../reports/frontend-report.html',
    },
  },
})
