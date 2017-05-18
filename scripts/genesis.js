const path = require('path')
const yargs = require('yargs')
const sh = require('./sh')

const argv = yargs.usage('Usage: $0 <cmd> <app>').demand(1).argv

const [cmd, app] = argv._

/////////////////////////////////////////////////////////

const genesis = require('@technologyadvice/genesis-core').default

const baseConfig = {
  // The environment to use when compiling the project
  env: process.env.NODE_ENV,
  // The full path to the project's root directory
  basePath: path.resolve(__dirname, '../src'),
  // The name of the project's source code directory
  srcDir: app,
  // The name of the directory in which to emit compiled code
  outDir: `../dist/${app}`,
  // The file name of the project's main entry point. Defaults to main.{js,ts}
  main: 'index.js',
  // The full path to the HTML template to use with the project
  // templatePath: path.resolve(__dirname, '../public/index.html'),
  // The base path for all projects assets (relative to the document root)
  // publicPath: '',

  // A hash map of modules to replace with external global references
  // externals: {},
  // A hash map of variables and their values to expose globally
  // globals: {},
  // The list of modules to compile separately from the core project code
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
  // Whether to run the compiler with verbose logging
  verbose: true,
  // Whether to generate sourcemaps
  sourcemaps: true,
  // TypeScript-specific configuration
  // typescript: {
  //   // The full path to the tsconfig.json file to use
  //   configPath: '',
  // }
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

const config = Object.assign({}, baseConfig, appConfig)

const compiler = genesis(config)

const commonPublic = path.resolve(config.basePath, 'common/public')
const appPublic = path.resolve(config.basePath, app, 'public')
const distPublic = path.resolve(config.basePath, config.outDir)

// go!
Promise.resolve()
  .then(() => {
    // copy common/public to <app>/public
    return Promise.all([sh(`mkdir -p ${appPublic}`), sh(`cp -RL ${commonPublic}/* ${appPublic}`)])
  })
  .then(() => {
    return compiler[cmd]()
  })
  .then(() => {
    // TODO remove once genesis copies public
    // copy <app>/public to dist/<app>
    return sh(`cp ${appPublic}/* ${distPublic}`)
  })
  .then(() => {
    if (cmd === 'build' && app === 'extension') {
      require('./postbuild-extension')
    }
  })
