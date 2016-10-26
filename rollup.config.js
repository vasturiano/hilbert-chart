import commonJs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import postCss from 'rollup-plugin-postcss';
import postCssSimpleVars from 'postcss-simple-vars';
import postCssNested from 'postcss-nested';

export default {
    entry: 'src/index.js',
    dest: 'dist/hilbert-chart.js',
    format: 'umd',
    useStrict: false,   // heatmap.js not strict
    moduleName: 'HilbertChart',
    plugins: [
        commonJs(),
        nodeResolve({
            jsnext: true,
            main: true
        }),
        postCss({
            plugins: [
                postCssSimpleVars(),
                postCssNested()
            ]
        })
    ]
};