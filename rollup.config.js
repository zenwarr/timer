import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";
import postcss from "rollup-plugin-postcss";
import html from '@rollup/plugin-html';
import copy from "rollup-plugin-copy";
import * as fs from "fs";


export default [
  {
    input: 'src/main.ts',
    output: {
      dir: 'dist',
      format: 'cjs'
    },
    plugins: [
      typescript({
        tsconfig: "./src/tsconfig.json"
      }),
      terser(),
      html({
        template: () => fs.readFileSync("src/index.html", "utf-8")
      }),
      copy({
        targets: [
          { src: "static/**", dest: "dist" }
        ]
      })
    ]
  },
  {
    input: 'src/style.css',
    output: {
      dir: "dist"
    },
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
