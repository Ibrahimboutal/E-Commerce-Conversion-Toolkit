import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isEmbed = mode === 'embed';

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: isEmbed ? {
      lib: {
        entry: resolve(__dirname, 'src/embed/main.tsx'),
        name: 'ConversionToolkit',
        fileName: 'embed',
        formats: ['iife'],
      },
      outDir: 'dist/embed',
      rollupOptions: {
        output: {
          extend: true,
        },
      },
    } : {
      outDir: 'dist',
    },
  };
});
