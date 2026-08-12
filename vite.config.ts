import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'unplugin-dts/vite';

export default defineConfig(({ mode }) => {
  return {
    root: '.',
    envDir: resolve(import.meta.dirname),
    plugins: [
      dts({
        //outDirs: './src',
        //entryRoot: './src',
        // declarationOnly: true,
        //insertTypesEntry: true,
        //bundleTypes: true,
        //include: ['src'],
        //tsconfigPath: './tsconfig.json',
      }),
    ],
    resolve: {
      //alias: aliases,
    },
    define: {
      // Statically replaces process.env.NODE_ENV with the current string mode
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    build: {
      //minify: "terser",
      minify: false,
      outDir: 'build',
      sourcemap: false,
      //license: true,
      emptyOutDir: false,
      lib: {
        entry: ['./index.js'],
        fileName: (format, entryName) => {
          return `pip-manager.module.js`;
        },
        formats: ['es'],
      },
      rolldownOptions: {
        external: ['event-emitter'],

        output: {
          format: 'es',
          // Inlines dynamic imports to prevent separate chunk files
          codeSplitting: false,
          comments: false,
        },
      },
    },
  };
});
