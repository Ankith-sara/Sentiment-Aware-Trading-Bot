const express = require('express')
const axios = require('axios')
const { pool } = require('../config/database')
const { client: redisClient } = require('../config/redis')
const logger = require('../utils/logger')

const router = express.Router()

const SENTIMENT_SERVICE_URL = process.env.SENTIMENT_SERVICE_URL || 'http://localhost:8001'

// Get latest sentiment for a symbol
router.get('/latest/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params
    
    // First check Redis cache
    const cacheKey = `news_sentiment:${symbol}`
    const cachedData = await redisClient.get(cacheKey)
    
    if (cachedData) {
      return res.json(JSON.parse(cachedData))
    }
    
    // If not in cache, call sentiment service
    const response = await axios.post(`${SENTIMENT_SERVICE_URL}/analyze/news`, {
      symbol: symbol.toUpperCase(),
      limit: 10
    })
    
    res.json(response.data)
    
  } catch (error) {
    logger.error('Error getting sentiment:', error)
    res.status(500).json({ error: 'Failed to get sentiment data' })
  }
})

// Analyze custom text
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }
    
    const response = await axios.post(`${SENTIMENT_SERVICE_URL}/analyze`, {
      text
    })
    
    res.json(response.data)
    
  } catch (error) {
    logger.error('Error analyzing sentiment:', error)
    res.status(500).json({ error: 'Failed to analyze sentiment' })
  }
})

// Get sentiment history
router.get('/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params
    const { days = 7 } = req.query
    
    // Get from database
    const result = await pool.query(
      `SELECT * FROM sentiment_scores 
       WHERE symbol = $1 
       AND created_at >= NOW() - INTERVAL '${parseInt(days)} days'
       ORDER BY created_at DESC
       LIMIT 100`,
      [symbol.toUpperCase()]
    )
    
    res.json({
      symbol,
      data: result.rows,
      count: result.rows.length
    })
    
  } catch (error) {
    logger.error('Error getting sentiment history:', error)
    res.status(500).json({ error: 'Failed to get sentiment history' })
  }
})

module.exports = router