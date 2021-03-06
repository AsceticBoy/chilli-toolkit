'use strict'

var chalk = require('chalk')
var process = require('process')
var path = require('path')
var fs = require('fs')
var fse = require('fs-extra')
var rollup = require('rollup')
var nodeResolve = require('rollup-plugin-node-resolve')
var commonjs = require('rollup-plugin-commonjs') // commonjs -> es2015
var compiler = require('google-closure-compiler-js').compile

// output bundle environment
switch (process.env.NODE_ENV) {
  case 'DEV': {
    console.log(chalk.red(`
      +---------------+
      |  DEV BUILD 🌶  |
      +---------------+
    `))
    break;
  }
  case 'PROD': {
    console.log(chalk.green(`
      +----------------+
      |  PROD BUILD 🌶  |
      +----------------+
    `))
    break;
  }
  default:
    break;
}

var formats = [ 'amd', 'cjs', 'es', 'iife', 'umd'] // amd -> require(), cjs -> commonjs, es -> es6, iife -> <script/>, umd

var plugins = [
  nodeResolve({
    jsnext: false,
    main: true,
    extensions: [ '.js', '.json' ],
  }),
  commonjs({
    extensions: [ '.js', '.json' ]
  })
]

module.exports = {
  bundle,
  format
}

/**
 * prod bundle file ( min.js sourcemap )
 * 
 * @param { String } entry 
 * @param { String } output 
 * @param { String } name 
 */
function bundle(entry, output, name) {
  rollup.rollup({
    input: path.resolve(process.cwd(), entry),
    plugins: plugins
  }).then((bundle) => {
    return bundle.generate({
      format: format(),
      name: name,
      sourcemap: true
    })
  }).then(({ code, map}) => {
    return write(path.resolve(process.cwd(), output), code)
  }).then(() => {
    var source = fs.readFileSync(path.resolve(process.cwd(), output), 'utf-8', (err) => { throw err })
    var compilerFlags = {
      jsCode: [{ src: source }],
      compilationLevel: 'ADVANCED',
      languageOut: 'ECMASCRIPT5',
      createSourceMap: true
    }
    var result = compiler(compilerFlags)
    var minPath = 'bundle/' + output.split('/').pop().split('.')[0] + '.min.js'
    var sourcePath = minPath + '.map'
    // write min.js and min.js.map
    fs.writeFileSync(minPath, result.compiledCode, 'utf-8', (err) => { throw err })
    fs.writeFileSync(sourcePath, result.sourceMap, 'utf-8', (err) => { throw err })
    console.info(chalk.red(minPath) + ' ' + chalk.green(getSize(result.compiledCode)))
  }).catch((err) => {
    console.error(err)
  })
}

/**
 * output format type
 */
function format() {
  var format = 'es' // default
  var args = process.argv.slice(2)

  outer:
  for (var i = 0; i < formats.length; i++) {
    for (var j = 0; j < args.length; j++) {
      if (args[j].slice(0, 2) !== '--') { throw new TypeError('process args usage error'); break outer }
      if (args[j].toLocaleLowerCase().slice(9) === formats[i]) { format = formats[i]; break outer }
    }
  }
  return format
}

/**
 * Write code in dir path
 * 
 * @param { String } dir file path dir
 * @param { String | Buffer } code code 
 */
function write(dir, code) {
  return new Promise(function (resolve, reject) {
    fse.ensureFile(dir, (err) => {
      if (err) return reject(err)
      fs.writeFile(dir, code, 'utf-8', (err) => {
        if (err) {
          return reject(err)
        }
        console.info(chalk.red(dir) + ' ' + chalk.green(getSize(code)))
        resolve()
      })
    })
  })
}

/**
 * Compute code size
 * 
 * @param { String | Buffer } code 
 */
function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}