import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";
import html from '@rollup/plugin-html';
import * as fs from "fs";


export default [
  {
    input: 'src/main.ts',
    output: {
      dir: 'docs',
      format: 'iife'
    },
    plugins: [
      typescript({
        tsconfig: "./src/tsconfig.json"
      }),
      terser(),
      html({
        template: () => fs.readFileSync("src/index.html", "utf-8")
      })
    ]
  },
  {
    input: 'src/style.css',
    plugins: [
      postcss({
        extract: "style.css",
        plugins: [require("cssnano")({
          preset: "default"
        })]
      })
    ]
  }
];
