
const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  imageBase64: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  timeOfDay: {
    type: String,
    default: ''
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true 
  }
}, {
  timestamps: true 
});


AnalysisSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Analysis', AnalysisSchema);