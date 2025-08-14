const redis = require('redis')
const logger = require('../utils/logger')

const client = redis.createClient({
  url: process.env.REDIS_URL
})

client.on('error', (err) => {
  logger.error('Redis error:', err)
})

client.on('connect', () => {
  logger.info('Connected to Redis')
})

async function initializeRedis() {
  await client.connect()
}

module.exports = { client, initializeRedis }