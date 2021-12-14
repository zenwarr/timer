import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";
import html from '@rollup/plugin-html';
import svelte from 'rollup-plugin-svelte';
import * as fs from "fs";
import autoPreprocess from 'svelte-preprocess';
import resolve from '@rollup/plugin-node-resolve';


export default [
  {
    input: 'src/main.ts',
    output: {
      dir: 'docs',
      format: 'cjs'
    },
    plugins: [
      svelte({
        preprocess: autoPreprocess(),
        compilerOptions: {
          dev: false
        }
      }),
      html({
        template: () => fs.readFileSync("src/index.html", "utf-8")
      }),
      resolve({
        browser: true,
        dedupe: ['svelte']
      }),
      typescript({
        tsconfig: "./src/tsconfig.json"
      }),
      terser(),
      postcss({
        extract: "style.css",
        minimize: true
      })
    ]
  }
];
