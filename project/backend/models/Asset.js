const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  assetType: {
    type: String,
    enum: ['stock', 'crypto', 'forex', 'commodity'],
    required: true
  },
  exchange: {
    type: String,
    required: true
  },
  sector: {
    type: String,
    default: null
  },
  industry: {
    type: String,
    default: null
  },
  marketCap: {
    type: Number,
    min: 0,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isTradeable: {
    type: Boolean,
    default: true
  },
  metadata: {
    description: String,
    website: String,
    logo: String,
    tags: [String]
  }
}, {
  timestamps: true
});

// Index for efficient queries
assetSchema.index({ symbol: 1 });
assetSchema.index({ assetType: 1, isActive: 1 });
assetSchema.index({ exchange: 1 });

module.exports = mongoose.model('Asset', assetSchema);