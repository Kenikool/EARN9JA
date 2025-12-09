import mongoose from 'mongoose';

const streamPollSchema = new mongoose.Schema({
  streamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stream',
    required: true
  },
  question: {
    type: String,
    required: true,
    maxlength: 200
  },
  options: [{
    text: {
      type: String,
      required: true,
      maxlength: 100
    },
    votes: {
      type: Number,
      default: 0
    }
  }],
  duration: {
    type: Number,
    required: true,
    min: 10,
    max: 600
  },
  endsAt: {
    type: Date,
    required: true
  },
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// streamPollSchema.index({ streamId: 1, isActive: 1 });

export default mongoose.model('StreamPoll', streamPollSchema);
