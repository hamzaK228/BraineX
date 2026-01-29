import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: './frontend',
  publicDir: false,
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'frontend/index.html'),
        fields: path.resolve(__dirname, 'frontend/fields.html'),
        scholarships: path.resolve(__dirname, 'frontend/scholarships.html'),
        projects: path.resolve(__dirname, 'frontend/projects.html'),
        mentors: path.resolve(__dirname, 'frontend/mentors.html'),
        roadmaps: path.resolve(__dirname, 'frontend/roadmaps.html'),
        events: path.resolve(__dirname, 'frontend/events.html'),
        about: path.resolve(__dirname, 'frontend/about.html'),
        admin: path.resolve(__dirname, 'frontend/admin.html'),
        notion: path.resolve(__dirname, 'frontend/notion.html'),
        universities: path.resolve(__dirname, 'frontend/universities.html'),
        programs: path.resolve(__dirname, 'frontend/programs.html'),
        test_standalone: path.resolve(__dirname, 'frontend/test_standalone.html'),
        pathways: path.resolve(__dirname, 'frontend/pathways.html'),
        gym: path.resolve(__dirname, 'frontend/gym.html'),
      },
      output: {},
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    cssMinify: true,
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: [],
  },
});
