import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isWidget = mode === 'widget';

  const config: UserConfig = {
    plugins: [react()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(isWidget ? 'production' : mode),
    },
    build: {
      outDir: isWidget ? 'dist/widget' : 'dist',
      emptyOutDir: isWidget ? false : true,
    }
  };

  if (isWidget && config.build) {
    config.build.lib = {
      entry: resolve(__dirname, 'src/widget-entry.tsx'),
      name: 'ChatCopilot',
      fileName: () => 'chat-copilot-widget.js',
      formats: ['iife'],
    };
    config.build.rollupOptions = {
      output: {
        extend: true,
      },
    };
  }

  return config;
})


