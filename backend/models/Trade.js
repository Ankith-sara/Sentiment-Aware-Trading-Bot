const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
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
    enum: ['buy', 'sell'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalValue: {
    type: Number,
    required: true,
    min: 0
  },
  fees: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'executed', 'cancelled', 'failed'],
    default: 'pending'
  },
  brokerOrderId: {
    type: String,
    default: null
  },
  sentimentScore: {
    type: Number,
    min: 0,
    max: 1
  },
  signalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TradingSignal',
    default: null
  },
  executedAt: {
    type: Date,
    default: null
  },
  pnl: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Calculate P&L for completed trades
tradeSchema.methods.calculatePnL = function(currentPrice) {
  if (this.status !== 'executed') return 0;
  
  const priceDiff = currentPrice - this.price;
  const multiplier = this.action === 'buy' ? 1 : -1;
  return (priceDiff * multiplier * this.quantity) - this.fees;
};

// Index for efficient queries
tradeSchema.index({ userId: 1, createdAt: -1 });
tradeSchema.index({ symbol: 1, createdAt: -1 });
tradeSchema.index({ status: 1 });

module.exports = mongoose.model('Trade', tradeSchema);