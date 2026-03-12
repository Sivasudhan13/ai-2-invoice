import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false
  },
  filename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  extractedData: {
    type: Object,
    required: true
  },
  confidenceScores: {
    type: Object,
    required: false
  },
  processingTime: {
    type: String
  },
  provider: {
    type: String,
    default: 'Gemini Flash'
  }
}, {
  timestamps: true
});

// Add indexes for efficient querying
historySchema.index({ organizationId: 1 });
historySchema.index({ userId: 1 });
historySchema.index({ organizationId: 1, userId: 1 });

export default mongoose.model('History', historySchema);
