const mongoose = require('mongoose');

const tradingSignalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  action: {
    type: String,
    enum: ['buy', 'sell', 'hold'],
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  sentimentScore: {
    type: Number,
    min: 0,
    max: 1
  },
  technicalScore: {
    type: Number,
    min: 0,
    max: 1
  },
  combinedScore: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  reasoning: {
    type: String,
    required: true
  },
  isExecuted: {
    type: Boolean,
    default: false
  },
  executedTradeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade',
    default: null
  },
  marketPrice: {
    type: Number,
    min: 0
  },
  volume: {
    type: Number,
    min: 0
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
tradingSignalSchema.index({ userId: 1, createdAt: -1 });
tradingSignalSchema.index({ symbol: 1, createdAt: -1 });
tradingSignalSchema.index({ action: 1, confidence: -1 });
tradingSignalSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TradingSignal', tradingSignalSchema);