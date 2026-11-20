import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

// Multi-page build: the brand page, the public menu, and the hidden admin.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        menu: resolve(root, 'menu.html'),
        admin: resolve(root, 'admin/index.html'),
      },
    },
  },
});
