import mongoose from 'mongoose';

const streamModeratorSchema = new mongoose.Schema({
  streamerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permissions: [{
    type: String,
    enum: ['DELETE_MESSAGES', 'TIMEOUT_USERS', 'BAN_USERS', 'MANAGE_POLLS', 'MANAGE_SETTINGS']
  }],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

//streamModeratorSchema.index({ streamerId: 1, userId: 1 }, { unique: true });

export default mongoose.model('StreamModerator', streamModeratorSchema);
