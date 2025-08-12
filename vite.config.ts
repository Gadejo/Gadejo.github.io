import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Optimize for Cloudflare Pages
    target: 'es2020',
    rollupOptions: {
      output: {
        // More conservative chunking for Cloudflare Pages
        manualChunks(id) {
          // Only create essential vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            return 'vendor';
          }
        },
        // Consistent file naming
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    },
    // Optimize bundle size
    minify: true,
    // Enable tree shaking
    treeshaking: true,
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1600
  },
  // Preview server configuration for testing
  preview: {
    port: 4173,
    host: true
  },
  // Define environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '4.0.0')
  }
})