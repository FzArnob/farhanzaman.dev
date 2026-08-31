import { copyFileSync, mkdirSync, readdirSync, existsSync, createReadStream } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));
/** Shared data folder: version_1.09/data — the single source of truth for profile + gaming JSON. */
const dataDir = resolve(here, '../data');

/**
 * Serves version_1.09/data at /data during `vite dev`, and copies it into
 * dist/data on build, so the same fetch('/data/profile.json') works in both.
 */
function sharedDataPlugin(): Plugin {
  return {
    name: 'shared-data',
    configureServer(server) {
      server.middlewares.use('/data', (req, res, next) => {
        const file = join(dataDir, decodeURIComponent((req.url || '/').split('?')[0]));
        if (!file.startsWith(dataDir) || !existsSync(file)) return next();
        res.setHeader('Content-Type', extname(file) === '.json' ? 'application/json' : 'text/plain');
        createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      if (!existsSync(dataDir)) return;
      const out = resolve(here, 'dist/data');
      mkdirSync(out, { recursive: true });
      // Files only: skips the admin's backups/ folder and dotfiles such as .gitignore.
      for (const entry of readdirSync(dataDir, { withFileTypes: true })) {
        if (!entry.isFile() || entry.name.startsWith('.')) continue;
        copyFileSync(join(dataDir, entry.name), join(out, entry.name));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), sharedDataPlugin()],
  server: {
    port: 3050,
    strictPort: true,
  },
  preview: {
    port: 3050,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
