import { defineConfig } from 'vitest/config'

// Config dédiée aux tests (séparée de vite.config.ts pour éviter le conflit de
// versions Vite entre l'app et celle embarquée par Vitest). On n'utilise pas le
// plugin React (incompatible avec le Vite de Vitest) : l'esbuild de Vitest
// transforme le JSX avec le runtime automatique (React 17+).
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
