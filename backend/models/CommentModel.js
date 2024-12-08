var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    content: { type: String, required: true },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'users', 
        required: true },
    createdAt: { type: Date, default: Date.now },
    likes: { type: Array, default: [] },
});

module.exports = mongoose.model('comments', CommentSchema);