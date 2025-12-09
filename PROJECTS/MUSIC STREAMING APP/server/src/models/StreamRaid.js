import mongoose from 'mongoose';

const streamRaidSchema = new mongoose.Schema({
  fromStreamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stream',
    required: true
  },
  toStreamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stream',
    required: true
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewerCount: {
    type: Number,
    default: 0
  },
  message: String
}, {
  timestamps: true
});

// streamRaidSchema.index({ toStreamId: 1, createdAt: -1 });
// streamRaidSchema.index({ fromUserId: 1, createdAt: -1 });

export default mongoose.model('StreamRaid', streamRaidSchema);
