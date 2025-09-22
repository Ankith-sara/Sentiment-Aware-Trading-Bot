// Simplified backend server for Python microservices proxy
// Firebase handles all data storage, this server only proxies to Python services

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

// Market data routes (proxy to trading service)
app.get('/api/market-data/:symbols', async (req, res) => {
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
app.post('/api/sentiment/analyze', async (req, res) => {
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
    
    // Note: Sentiment scores are now stored in Firebase by the frontend
    res.json(sentimentData);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ error: 'Sentiment analysis failed' });
  }
});

// Trading signals routes
app.post('/api/trading/signals', async (req, res) => {
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
    
    // Note: Trading signals are now stored in Firebase by the frontend
    res.json(signals);
  } catch (error) {
    console.error('Trading signals error:', error);
    res.status(500).json({ error: 'Failed to generate trading signals' });
  }
});

// Execute trade route
app.post('/api/trading/execute', async (req, res) => {
  try {
    const { signal, quantity } = req.body;
    
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
    
    // Note: Trades are now stored in Firebase by the frontend
    res.json(tradeResult);
  } catch (error) {
    console.error('Trade execution error:', error);
    res.status(500).json({ error: 'Trade execution failed' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'firebase', // Using Firebase instead of MongoDB
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
  console.log(`Using Firebase for data storage`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});