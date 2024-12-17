const mongoose = require('mongoose');

const PostViewLogSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  viewedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('view_log', PostViewLogSchema);
