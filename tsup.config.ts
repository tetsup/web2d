import { defineConfig } from 'tsup';
import path from 'node:path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  tsconfig: 'tsconfig.lib.json',
  clean: true,
  sourcemap: true,
  splitting: false,

  esbuildOptions(options) {
    options.alias = {
      '@': path.resolve(__dirname, 'src'),
    };
  },
});
