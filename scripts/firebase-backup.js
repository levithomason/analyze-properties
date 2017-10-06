const path = require('path')
const sh = require('./sh')

console.log('Backing up firebase...')

const d = new Date()
const filename = path.resolve(__dirname, `../backups/${d.toISOString()}.json`)

sh(`firebase database:get --export --pretty --output ${filename} /`)
  .then(() => {
    console.log('Done!', filename)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
