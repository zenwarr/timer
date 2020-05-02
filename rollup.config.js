import typescript from '@rollup/plugin-typescript';
import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/main.ts',
  output: {
    dir: 'docs',
    format: 'iife'
  },
  plugins: [
    typescript({
      tsconfig: "tsconfig.json"
    }),
    copy({
      targets: [
        {
          src: [ "src/index.html", "src/style.css" ],
          dest: "docs"
        }
      ]
    }),
    terser()
  ]
};
