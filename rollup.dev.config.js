import globals from './rollup.globals'
import livereload from 'rollup-plugin-livereload'
import pkg from './package.json'
import rollup from './rollup.module.config.js'
import serve from 'rollup-plugin-serve'

export default Object.assign({}, rollup, {
  input: 'src/index.jsx',
  output: [
    {
      format: 'umd',
      globals: globals,
      name: pkg.moduleName,
      file: 'dist/umd/index.dev.js'
    }
  ],
  plugins: [...rollup.plugins,
    serve({
      open: 'true',
      openPage: '/dev.html'
    }),
    livereload({
      watch: ['dist', 'src']
    })
  ]
})
