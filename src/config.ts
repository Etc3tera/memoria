import { readFileSync } from 'fs'

const config = JSON.parse(readFileSync('config.json').toString()) as AppConfig
config.defaultLifetime = config.defaultLifetime || 2592000
config.pathOptions = config.pathOptions || {}
config.version = '0.1.0'

export default config