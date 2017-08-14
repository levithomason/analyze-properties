const path = require('path')
const yargs = require('yargs')
const sh = require('./sh')

const argv = yargs.usage('Usage: $0 <cmd> <app>').demand(1).argv

const [cmd, app] = argv._

/////////////////////////////////////////////////////////

const genesis = require('@technologyadvice/genesis-core')

const rootPath = path.resolve(__dirname, '..')

const srcPath = path.resolve(rootPath, 'src')
const entry = path.resolve(__dirname, `../src/${app}/index.js`)
const outDir = path.resolve(rootPath, `dist/${app}`)
const commonPublic = path.resolve(srcPath, 'common/public')
const appPublic = path.resolve(srcPath, app, 'public')

const baseConfig = {
  entry,
  globals: {
    __DEV__: process.env.NODE_ENV !== 'production',
  },
  vendors: [
    'classnames',
    'color',
    'fela',
    'fela-plugin-dynamic-prefixer',
    'fela-plugin-fallback-value',
    'fela-plugin-friendly-pseudo-class',
    'fela-plugin-lvha',
    'fela-plugin-placeholder-prefixer',
    'fela-plugin-prefixer',
    'fela-plugin-unit',
    'firebase',
    'hoist-non-react-statics',
    'lodash',
    'normalize.css',
    'react',
    'react-dom',
    'react-fela',
    'react-redux',
    'react-redux-firebase',
    'react-router',
    'react-textarea-autosize',
    'redux',
  ],
  verbose: true,
  sourcemaps: true,
}

const appConfig = {
  web: {
    templatePath: path.resolve(__dirname, '../src/web/index.html'),
  },
  extension: {
    // use an example page during dev, otherwise, use the default index.html in build
    templatePath: cmd === 'start' ? path.resolve(__dirname, '../src/extension/index.html') : null,
  },
  mobile: {
    templatePath: path.resolve(__dirname, '../src/mobile/index.html'),
  },
}[app]

const compiler = genesis(Object.assign({}, baseConfig, appConfig))

// go!
Promise.resolve()
  .then(() => {
    // clean build dir
    if (cmd === 'build') return sh(`rm -rf ${outDir}`)
  })
  .then(() => {
    // copy common/public to <app>/public
    return Promise.all([sh(`mkdir -p ${appPublic}`), sh(`cp -RL ${commonPublic}/* ${appPublic}`)])
  })
  .then(() => {
    return compiler[cmd]({
      out: cmd === 'build' ? outDir : undefined,
      watch: cmd === 'test' && process.env.NODE_ENV !== 'production',
    })
  })
  .then(() => {
    // TODO remove once genesis copies public
    // copy <app>/public to dist/<app>
    return sh(`cp ${appPublic}/* ${outDir}`)
  })
  .then(() => {
    if (cmd === 'build' && app === 'extension') {
      require('./postbuild-extension')
    }
  })
