import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'History',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  affectedFields: {
    type: [String],
    required: true
  },
  confidenceScores: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ['unreviewed', 'reviewed'],
    default: 'unreviewed'
  }
}, {
  timestamps: true
});

// Add indexes for efficient querying
alertSchema.index({ organizationId: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ organizationId: 1, status: 1 });

export default mongoose.model('Alert', alertSchema);
