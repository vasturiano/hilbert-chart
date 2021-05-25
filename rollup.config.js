import resolve from '@rollup/plugin-node-resolve';
import commonJs from '@rollup/plugin-commonjs';
import postCss from 'rollup-plugin-postcss';
import babel from '@rollup/plugin-babel';
import { terser } from "rollup-plugin-terser";
import dts from 'rollup-plugin-dts';
import { name, homepage, version, dependencies, peerDependencies } from './package.json';

const umdConf = {
  format: 'umd',
  name: 'HilbertChart',
  strict: false, // heatmap.js not strict
  banner: `// Version ${version} ${name} - ${homepage}`
};

export default [
  {
    input: 'src/index.js',
    output: [
      { // umd
        ...umdConf,
        file: `dist/${name}.js`,
        sourcemap: true,
      },
      { // minify
        ...umdConf,
        file: `dist/${name}.min.js`,
        plugins: [terser({
          output: { comments: '/Version/' }
        })]
      }
    ],
    plugins: [
      postCss(),
      babel({ exclude: 'node_modules/**' }),
      resolve(),
      commonJs()
    ]
  },
  { // commonJs and ES modules
    input: 'src/index.js',
    output: [
      {
        format: 'cjs',
        strict: false,
        file: `dist/${name}.common.js`,
        exports: 'auto'
      },
      {
        format: 'es',
        strict: false,
        file: `dist/${name}.module.js`
      }
    ],
    external: [...Object.keys(dependencies || {}), ...Object.keys(peerDependencies || {})],
    plugins: [
      postCss(),
      babel()
    ]
  },
  { // expose TS declarations
    input: 'src/index.d.ts',
    output: [{
      file: `dist/${name}.d.ts`,
      format: 'es'
    }],
    plugins: [dts()]
  }
];
