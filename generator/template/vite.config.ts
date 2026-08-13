import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const adminPath = env.VITE_ADMIN_PATH ?? '/admin';

  return {
    plugins: [react()],
    base: adminPath.endsWith('/') ? adminPath : `${adminPath}/`,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      watch: {
        usePolling: true,
      }
    }
  };
});
