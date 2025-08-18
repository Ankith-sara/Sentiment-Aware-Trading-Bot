const mongoose = require('mongoose');

const sentimentScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    uppercase: true,
    default: null
  },
  text: {
    type: String,
    required: true
  },
  sentimentScore: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  label: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    required: true
  },
  source: {
    type: String,
    enum: ['news', 'social', 'earnings', 'manual'],
    default: 'manual'
  },
  sourceUrl: {
    type: String,
    default: null
  },
  processingTime: {
    type: Number,
    min: 0
  },
  modelVersion: {
    type: String,
    default: 'finbert-v1.0'
  }
}, {
  timestamps: true
});

// Index for efficient queries
sentimentScoreSchema.index({ userId: 1, createdAt: -1 });
sentimentScoreSchema.index({ symbol: 1, createdAt: -1 });
sentimentScoreSchema.index({ source: 1, createdAt: -1 });
sentimentScoreSchema.index({ label: 1, sentimentScore: -1 });

module.exports = mongoose.model('SentimentScore', sentimentScoreSchema);