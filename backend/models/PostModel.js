var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'comments',
    },
  ],
  image: { type: String },
  reports: {
    type: [String], 
    default: [] 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: 'users' }],
});

module.exports = mongoose.model('posts', PostSchema);
