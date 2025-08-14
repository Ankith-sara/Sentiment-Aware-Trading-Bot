const express = require('express')
const axios = require('axios')
const { pool } = require('../config/database')
const auth = require('../middleware/auth')
const logger = require('../utils/logger')

const router = express.Router()

const TRADING_SERVICE_URL = process.env.TRADING_SERVICE_URL || 'http://localhost:8002'
const SENTIMENT_SERVICE_URL = process.env.SENTIMENT_SERVICE_URL || 'http://localhost:8001'

// Get portfolio
router.get('/portfolio', auth, async (req, res) => {
  try {
    const response = await axios.get(`${TRADING_SERVICE_URL}/portfolio/${req.user.userId}`)
    res.json(response.data)
    
  } catch (error) {
    logger.error('Error getting portfolio:', error)
    res.status(500).json({ error: 'Failed to get portfolio' })
  }
})

// Generate trading signal
router.post('/signal', auth, async (req, res) => {
  try {
    const { symbol } = req.body
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' })
    }
    
    // Get latest sentiment
    let sentimentScore = null
    try {
      const sentimentResponse = await axios.get(`${SENTIMENT_SERVICE_URL}/sentiment/${symbol}`)
      sentimentScore = sentimentResponse.data.overall_score
    } catch (error) {
      logger.warn(`No sentiment data for ${symbol}`)
    }
    
    // Generate trading signal
    const response = await axios.post(`${TRADING_SERVICE_URL}/generate-signal`, {
      symbol: symbol.toUpperCase(),
      sentiment_score: sentimentScore,
      user_id: req.user.userId
    })
    
    res.json(response.data)
    
  } catch (error) {
    logger.error('Error generating signal:', error)
    res.status(500).json({ error: 'Failed to generate trading signal' })
  }
})

// Execute order
router.post('/order', auth, async (req, res) => {
  try {
    const { symbol, side, quantity, order_type = 'market', limit_price } = req.body
    
    // Validate input
    if (!symbol || !side || !quantity) {
      return res.status(400).json({ error: 'Symbol, side, and quantity are required' })
    }
    
    // Execute order through trading service
    const response = await axios.post(`${TRADING_SERVICE_URL}/execute-order`, {
      symbol: symbol.toUpperCase(),
      side: side.toLowerCase(),
      quantity: parseFloat(quantity),
      order_type,
      limit_price: limit_price ? parseFloat(limit_price) : null,
      user_id: req.user.userId
    })
    
    // Log trade in database
    await pool.query(
      `INSERT INTO trades (user_id, symbol, side, quantity, status, order_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        req.user.userId,
        symbol.toUpperCase(),
        side.toLowerCase(),
        quantity,
        'pending',
        response.data.order_id,
        new Date()
      ]
    )
    
    res.json(response.data)
    
  } catch (error) {
    logger.error('Error executing order:', error)
    res.status(500).json({ error: 'Failed to execute order' })
  }
})

// Get trade history
router.get('/trades', auth, async (req, res) => {
  try {
    const { limit = 50 } = req.query
    
    const result = await pool.query(
      `SELECT * FROM trades 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [req.user.userId, parseInt(limit)]
    )
    
    res.json({
      trades: result.rows,
      count: result.rows.length
    })
    
  } catch (error) {
    logger.error('Error getting trades:', error)
    res.status(500).json({ error: 'Failed to get trade history' })
  }
})

// Get/update watchlist
router.get('/watchlist', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM watchlist WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
      [req.user.userId]
    )
    
    res.json({
      watchlist: result.rows,
      count: result.rows.length
    })
    
  } catch (error) {
    logger.error('Error getting watchlist:', error)
    res.status(500).json({ error: 'Failed to get watchlist' })
  }
})

router.post('/watchlist', auth, async (req, res) => {
  try {
    const { symbol, asset_type = 'stock' } = req.body
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' })
    }
    
    // Check if already exists
    const existing = await pool.query(
      'SELECT id FROM watchlist WHERE user_id = $1 AND symbol = $2 AND is_active = true',
      [req.user.userId, symbol.toUpperCase()]
    )
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Symbol already in watchlist' })
    }
    
    // Add to watchlist
    const result = await pool.query(
      'INSERT INTO watchlist (user_id, symbol, asset_type) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, symbol.toUpperCase(), asset_type]
    )
    
    res.status(201).json({
      message: 'Added to watchlist',
      item: result.rows[0]
    })
    
  } catch (error) {
    logger.error('Error adding to watchlist:', error)
    res.status(500).json({ error: 'Failed to add to watchlist' })
  }
})

// Get market data
router.get('/market-data/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params
    const { days = 30 } = req.query
    
    const response = await axios.get(`${TRADING_SERVICE_URL}/market-data/${symbol}?days=${days}`)
    res.json(response.data)
    
  } catch (error) {
    logger.error('Error getting market data:', error)
    res.status(500).json({ error: 'Failed to get market data' })
  }
})

module.exports = router