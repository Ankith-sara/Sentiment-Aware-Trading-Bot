const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./config/database');

// Import models
const User = require('./models/User');
const UserConfiguration = require('./models/UserConfiguration');
const Trade = require('./models/Trade');
const TradingSignal = require('./models/TradingSignal');
const SentimentScore = require('./models/SentimentScore');
const Asset = require('./models/Asset');

// Import middleware
const { authenticateToken, generateToken } = require('./middleware/auth');

const WebSocket = require('ws');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Python microservices URLs
const SENTIMENT_SERVICE_URL = process.env.SENTIMENT_SERVICE_URL || 'http://localhost:8001';
const TRADING_SERVICE_URL = process.env.TRADING_SERVICE_URL || 'http://localhost:8002';
const SCHEDULER_SERVICE_URL = process.env.SCHEDULER_SERVICE_URL || 'http://localhost:8003';

// Routes

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, firebaseUid } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        ...(firebaseUid ? [{ firebaseUid }] : [])
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
      firebaseUid
    });
    
    await user.save();
    
    // Create default configuration
    const userConfig = new UserConfiguration({
      userId: user._id,
      watchedSymbols: ['AAPL', 'TSLA', 'MSFT', 'NVDA']
    });
    await userConfig.save();

    const token = generateToken(user._id);

    res.json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Market data routes
app.get('/api/market-data/:symbols', authenticateToken, async (req, res) => {
  try {
    const symbols = req.params.symbols.split(',');
    
    // Fetch from trading service
    const response = await fetch(`${TRADING_SERVICE_URL}/trading/market-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols })
    });

    if (!response.ok) {
      throw new Error('Trading service unavailable');
    }

    const marketData = await response.json();
    
    res.json(marketData);
  } catch (error) {
    console.error('Market data error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// Sentiment analysis routes
app.post('/api/sentiment/analyze', authenticateToken, async (req, res) => {
  try {
    const { text, source } = req.body;
    
    const response = await fetch(`${SENTIMENT_SERVICE_URL}/sentiment/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source })
    });

    if (!response.ok) {
      throw new Error('Sentiment service unavailable');
    }

    const sentimentData = await response.json();
    
    // Store sentiment score in database
    const sentimentScore = new SentimentScore({
      userId: req.user._id,
      text,
      sentimentScore: sentimentData.sentiment_score,
      confidence: sentimentData.confidence,
      label: sentimentData.label,
      source,
      processingTime: sentimentData.processing_time
    });
    
    await sentimentScore.save();
    
    res.json(sentimentData);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ error: 'Sentiment analysis failed' });
  }
});

// Trading signals routes
app.post('/api/trading/signals', authenticateToken, async (req, res) => {
  try {
    const { symbols } = req.body;
    
    const response = await fetch(`${TRADING_SERVICE_URL}/trading/signals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols })
    });

    if (!response.ok) {
      throw new Error('Trading service unavailable');
    }

    const signals = await response.json();
    
    // Store trading signals in database
    for (const signal of signals) {
      const tradingSignal = new TradingSignal({
        userId: req.user._id,
        symbol: signal.symbol,
        action: signal.action,
        confidence: signal.confidence,
        sentimentScore: signal.sentiment_score,
        technicalScore: signal.technical_score,
        combinedScore: signal.combined_score,
        reasoning: signal.reasoning
      });
      
      await tradingSignal.save();
    }
    
    res.json(signals);
  } catch (error) {
    console.error('Trading signals error:', error);
    res.status(500).json({ error: 'Failed to generate trading signals' });
  }
});

// Execute trade route
app.post('/api/trading/execute', authenticateToken, async (req, res) => {
  try {
    const { signal, quantity } = req.body;
    
    // Risk control logic
    const userConfig = await UserConfiguration.findOne({ userId: req.user._id });

    if (userConfig) {
      const tradeValue = quantity * 100; // Mock price calculation
      
      if (tradeValue > userConfig.maxPositionSize) {
        return res.status(400).json({ error: 'Trade exceeds maximum position size' });
      }
    }

    // Execute trade via trading service
    const response = await fetch(`${TRADING_SERVICE_URL}/trading/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signal, quantity })
    });

    if (!response.ok) {
      throw new Error('Trade execution failed');
    }

    const tradeResult = await response.json();
    
    // Store trade in database
    const trade = new Trade({
      userId: req.user._id,
      symbol: signal.symbol,
      action: signal.action,
      quantity,
      price: 100, // Mock price
      totalValue: quantity * 100,
      status: tradeResult.status,
      sentimentScore: signal.sentiment_score,
      executedAt: new Date()
    });
    
    await trade.save();
    
    // Emit real-time update
    io.emit('trade_executed', {
      userId: req.user._id,
      trade: tradeResult
    });
    
    res.json(tradeResult);
  } catch (error) {
    console.error('Trade execution error:', error);
    res.status(500).json({ error: 'Trade execution failed' });
  }
});

// User configuration routes
app.get('/api/user/config', authenticateToken, async (req, res) => {
  try {
    let userConfig = await UserConfiguration.findOne({ userId: req.user._id });
    
    if (!userConfig) {
      // Create default configuration
      userConfig = new UserConfiguration({
        userId: req.user._id,
        watchedSymbols: ['AAPL', 'TSLA', 'MSFT', 'NVDA']
      });
      await userConfig.save();
    }
    
    res.json(userConfig);
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

app.post('/api/user/config', authenticateToken, async (req, res) => {
  try {
    const config = req.body;
    
    await UserConfiguration.findOneAndUpdate(
      { userId: req.user._id },
      { ...config },
      { upsert: true, new: true }
    );
    
    res.json({ message: 'Configuration updated successfully' });
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Trading history route
app.get('/api/trading/history', authenticateToken, async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('signalId');
    
    res.json(trades);
  } catch (error) {
    console.error('Trading history error:', error);
    res.status(500).json({ error: 'Failed to fetch trading history' });
  }
});

// News with sentiment route
app.get('/api/news/sentiment', authenticateToken, async (req, res) => {
  try {
    const { symbols } = req.query;
    
    // Mock news data with sentiment (replace with real news API)
    const mockNews = [
      {
        id: '1',
        headline: 'Apple Reports Strong Q4 Earnings',
        summary: 'Apple Inc. announced quarterly earnings that beat expectations.',
        source: 'Reuters',
        timestamp: new Date().toISOString(),
        sentiment_score: 0.85,
        sentiment_label: 'positive',
        symbols: ['AAPL']
      },
      {
        id: '2',
        headline: 'Tesla Production Challenges Continue',
        summary: 'Tesla faces ongoing supply chain issues affecting production.',
        source: 'Bloomberg',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        sentiment_score: 0.25,
        sentiment_label: 'negative',
        symbols: ['TSLA']
      }
    ];
    
    res.json(mockNews);
  } catch (error) {
    console.error('News sentiment error:', error);
    res.status(500).json({ error: 'Failed to fetch news with sentiment' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    services: {
      sentiment_service: SENTIMENT_SERVICE_URL,
      trading_service: TRADING_SERVICE_URL,
      scheduler_service: SCHEDULER_SERVICE_URL
    }
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('subscribe_to_updates', (data) => {
    const { userId, symbols } = data;
    socket.join(`user_${userId}`);
    
    if (symbols && symbols.length > 0) {
      symbols.forEach(symbol => {
        socket.join(`symbol_${symbol}`);
      });
    }
    
    console.log(`User ${userId} subscribed to updates for symbols:`, symbols);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Real-time data broadcasting (simulate market updates)
setInterval(async () => {
  try {
    // Simulate market data updates
    const symbols = ['AAPL', 'TSLA', 'MSFT', 'NVDA'];
    const marketUpdates = symbols.map(symbol => ({
      symbol,
      price: 100 + Math.random() * 100,
      change: (Math.random() - 0.5) * 10,
      timestamp: new Date().toISOString()
    }));
    
    // Broadcast to all connected clients
    io.emit('market_data_update', marketUpdates);
    
    // Cache in Redis
    // Store in MongoDB if needed for historical data
    
  } catch (error) {
    console.error('Real-time update error:', error);
  }
}, 5000); // Update every 5 seconds

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
  console.log(`MongoDB connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});