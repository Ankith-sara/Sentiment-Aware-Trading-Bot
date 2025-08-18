// MongoDB initialization script for Trading Bot

// Switch to trading_bot database
db = db.getSiblingDB('trading_bot');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'name'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        },
        name: {
          bsonType: 'string',
          minLength: 1
        },
        accountType: {
          enum: ['free', 'premium', 'enterprise']
        }
      }
    }
  }
});

db.createCollection('userconfigurations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId'],
      properties: {
        maxPositionSize: {
          bsonType: 'number',
          minimum: 100,
          maximum: 1000000
        },
        maxDailyLoss: {
          bsonType: 'number',
          minimum: 50,
          maximum: 100000
        },
        riskTolerance: {
          enum: ['low', 'medium', 'high']
        },
        tradingMode: {
          enum: ['paper', 'live']
        }
      }
    }
  }
});

db.createCollection('trades', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'symbol', 'action', 'quantity', 'price', 'totalValue'],
      properties: {
        action: {
          enum: ['buy', 'sell']
        },
        status: {
          enum: ['pending', 'executed', 'cancelled', 'failed']
        },
        quantity: {
          bsonType: 'number',
          minimum: 1
        },
        price: {
          bsonType: 'number',
          minimum: 0
        }
      }
    }
  }
});

db.createCollection('tradingsignals', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'symbol', 'action', 'confidence', 'combinedScore'],
      properties: {
        action: {
          enum: ['buy', 'sell', 'hold']
        },
        confidence: {
          bsonType: 'number',
          minimum: 0,
          maximum: 1
        },
        sentimentScore: {
          bsonType: 'number',
          minimum: 0,
          maximum: 1
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ firebaseUid: 1 }, { unique: true, sparse: true });

db.userconfigurations.createIndex({ userId: 1 }, { unique: true });

db.trades.createIndex({ userId: 1, createdAt: -1 });
db.trades.createIndex({ symbol: 1, createdAt: -1 });
db.trades.createIndex({ status: 1 });

db.tradingsignals.createIndex({ userId: 1, createdAt: -1 });
db.tradingsignals.createIndex({ symbol: 1, createdAt: -1 });
db.tradingsignals.createIndex({ action: 1, confidence: -1 });

db.sentimentscores.createIndex({ userId: 1, createdAt: -1 });
db.sentimentscores.createIndex({ symbol: 1, createdAt: -1 });
db.sentimentscores.createIndex({ source: 1, createdAt: -1 });

db.assets.createIndex({ symbol: 1 }, { unique: true });
db.assets.createIndex({ assetType: 1, isActive: 1 });

// Insert sample assets
db.assets.insertMany([
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    assetType: 'stock',
    exchange: 'NASDAQ',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    isActive: true,
    isTradeable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    assetType: 'stock',
    exchange: 'NASDAQ',
    sector: 'Automotive',
    industry: 'Electric Vehicles',
    isActive: true,
    isTradeable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    assetType: 'stock',
    exchange: 'NASDAQ',
    sector: 'Technology',
    industry: 'Software',
    isActive: true,
    isTradeable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    assetType: 'stock',
    exchange: 'NASDAQ',
    sector: 'Technology',
    industry: 'Semiconductors',
    isActive: true,
    isTradeable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    assetType: 'stock',
    exchange: 'NASDAQ',
    sector: 'Technology',
    industry: 'Internet Services',
    isActive: true,
    isTradeable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('MongoDB initialization completed successfully!');