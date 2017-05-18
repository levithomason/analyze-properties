const cp = require('child_process')
const chalk = require('chalk')

module.exports = cmd =>
  new Promise((resolve, reject) => {
    console.log(chalk.gray(`sh: $ ${cmd}`))

    const child = cp.exec(cmd, {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    })

    child.on('error', reject)

    child.on('exit', code => (code === 0 ? resolve() : reject()))
  })
