import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
      // Explicitly exclude server code from frontend build
      external: [
        /^node:/,  // Exclude all node: imports
      ],
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js'],
    exclude: ['supabase/functions/server'],  // Don't process server code
  },
  // Exclude server directory from Vite processing
  server: {
    fs: {
      deny: ['**/supabase/functions/server/**'],
    },
  },
});