const path = require('path')
const sh = require('./sh')

const argv = process.argv.slice(2)

const [cmd, app] = argv

if (!cmd || !app) {
  console.log('Usage: $0 <cmd> <app>')
  process.exit(1)
}

/////////////////////////////////////////////////////////

const genesis = require('@technologyadvice/genesis-core')

const rootPath = path.resolve(__dirname, '..')

const srcPath = path.resolve(rootPath, 'src')
const entry = path.resolve(__dirname, `../src/${app}/index.js`)
const outDir = path.resolve(rootPath, `dist/${app}`)
const commonPublic = path.resolve(srcPath, 'common/public')
const appDir = path.resolve(srcPath, app)
const appPublic = path.resolve(appDir, 'public')

const globalBaseConfig = {
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
    'lodash/fp',
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

const globalAppConfig = {
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
  ui: {
    templatePath: '',
  },
}[app]

const globalConfig = Object.assign({}, globalBaseConfig, globalAppConfig)

const compiler = genesis(globalConfig)

const commandConfig = {
  build: {
    out: outDir,
  },
  test: {
    watch: process.env.NODE_ENV !== 'production',
  },
  start: {
    port: 5000,
  },
}

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
    if (cmd === 'start') process.chdir(appDir)

    return compiler[cmd](commandConfig[cmd])
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
