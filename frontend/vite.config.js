import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  cacheDir: './node_modules/.vite_custom', // Einzigartiger Cache-Ordner
  optimizeDeps: {
    exclude: ['@tiptap/starter-kit'], // Schließe problematische Abhängigkeiten aus, falls nötig
  },
});


// https://vite.dev/config/
//export default defineConfig({
//  plugins: [react()],
// })
