const mongoose = require('mongoose');

const userConfigurationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Trading Settings
  maxPositionSize: {
    type: Number,
    default: 10000,
    min: 100,
    max: 1000000
  },
  maxDailyLoss: {
    type: Number,
    default: 1000,
    min: 50,
    max: 100000
  },
  maxOpenPositions: {
    type: Number,
    default: 5,
    min: 1,
    max: 20
  },
  riskTolerance: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Bot Configuration
  autoTradingEnabled: {
    type: Boolean,
    default: false
  },
  tradingMode: {
    type: String,
    enum: ['paper', 'live'],
    default: 'paper'
  },
  
  // Sentiment Analysis Settings
  minSentimentThreshold: {
    type: Number,
    default: 0.6,
    min: 0,
    max: 1
  },
  maxSentimentThreshold: {
    type: Number,
    default: 0.8,
    min: 0,
    max: 1
  },
  sentimentWeight: {
    type: Number,
    default: 0.7,
    min: 0,
    max: 1
  },
  technicalWeight: {
    type: Number,
    default: 0.3,
    min: 0,
    max: 1
  },
  
  // Risk Management
  stopLossPercentage: {
    type: Number,
    default: 5,
    min: 1,
    max: 20
  },
  takeProfitPercentage: {
    type: Number,
    default: 15,
    min: 5,
    max: 50
  },
  
  // API Keys (encrypted)
  apiKeys: {
    alpacaApiKey: { type: String, default: null },
    alpacaSecretKey: { type: String, default: null },
    finnhubApiKey: { type: String, default: null },
    newsApiKey: { type: String, default: null }
  },
  
  // Watched Assets
  watchedSymbols: [{
    type: String,
    uppercase: true
  }],
  
  // Notification Settings
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    tradeAlerts: { type: Boolean, default: true },
    sentimentAlerts: { type: Boolean, default: true },
    riskAlerts: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Validate sentiment weights sum to 1
userConfigurationSchema.pre('save', function(next) {
  if (Math.abs((this.sentimentWeight + this.technicalWeight) - 1) > 0.01) {
    this.technicalWeight = 1 - this.sentimentWeight;
  }
  next();
});

module.exports = mongoose.model('UserConfiguration', userConfigurationSchema);