var PostModel = require('../models/PostModel');
var CommentModel = require('../models/CommentModel');
const PostViewLogModel = require('../models/PostViewLogModel');

/**
 * PostController.js
 *
 *
 * @description :: Server-side logic for managing Posts.
 */

module.exports = {
  list: async function (req, res) {
    if (req.query.hot === 'true') {
      try {
        const now = new Date();
    
        const hotPostsData = await PostViewLogModel.aggregate([
          {
            $addFields: {
              timeDifference: { $subtract: [now, "$createdAt"] }
            }
          },
          {
            $project: {
              postId: 1,
              timeDifference: 1,
              weight: {
                $switch: {
                  branches: [
                    { case: { $lt: ["$timeDifference", 3600000] }, then: 5 },  // Less than 1 hour
                    { case: { $lt: ["$timeDifference", 43200000] }, then: 3 }, // Less than 12 hours
                    { case: { $lt: ["$timeDifference", 86400000] }, then: 2 }, // Less than 24 hours
                    { case: { $gte: ["$timeDifference", 86400000] }, then: 1 } // Older than 24 hours
                  ],
                  default: 1
                }
              }
            }
          },
          {
            $group: {
              _id: "$postId",
              totalViews: { $sum: "$weight" }
            }
          },
          { $sort: { totalViews: -1 } },
          { $limit: 3 }
        ]);
    
        const postIds = hotPostsData.map(item => item._id);
    
        const posts = await PostModel.find({ _id: { $in: postIds } })
          .populate('userId', 'username')
          .lean();
    
        const hotPosts = posts.map(post => {
          const postData = hotPostsData.find(item => String(item._id) === String(post._id));
          return {
            ...post,
            views: postData?.totalViews || 0,
          };
        });
    
        return res.json(hotPosts);
      } catch (err) {
        console.error("Error when getting hot posts:", err);
        return res.status(500).json({ message: "Error when getting hot posts", error: err });
      }
    }
    try {
      const posts = await PostModel.find()
        .populate('userId', 'username')
        .exec();
  
      const postsWithViews = await Promise.all(
        posts.map(async (post) => {
          const viewCount = await PostViewLogModel.countDocuments({ postId: post._id });
          return {
            ...post.toObject(),
            views: viewCount,
          };
        })
      );
  
      return res.json(postsWithViews);
    } catch (err) {
      console.error('Error when getting Posts:', err);
      return res.status(500).json({
        message: 'Error when getting Posts.',
        error: err,
      });
    }
  },  

  // Posodobljena metoda za prikaz posamezne objave
  show: async function (req, res) {
    const id = req.params.id;
    const userId = req.query.userId;
  
    try {
      const post = await PostModel.findOne({ _id: id })
        .populate('userId', 'username')
        .populate({
          path: 'comments',
          populate: { path: 'userId', select: 'username' },
        })
        .exec();
  
      if (!post) {
        return res.status(404).json({ message: 'No such Post' });
      }
  
      if (userId && String(userId) !== String(post.userId._id)) {
        await PostViewLogModel.create({ postId: id });
      } else {
        console.log("User that created the post has viewed it, not counting this as a view.");
      }
  
      const viewCount = await PostViewLogModel.countDocuments({ postId: post._id });
      const postsWithViews = {
        ...post.toObject(),
        views: viewCount,
      };

      return res.json(postsWithViews);
    } catch (err) {
      console.error('Error when getting post:', err);
      return res.status(500).json({ message: 'Error when getting Post', error: err });
    }
  },  

  create: function (req, res) {
    var newPost = new PostModel({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      userId: req.body.userId,
      image: req.body.image || '',
    });
    console.log(newPost);

    newPost.save(function (err, Post) {
      if (err) {
        return res.status(500).json({
          message: 'Error when creating Post',
          error: err,
        });
      }
      return res.status(201).json(Post);
    });
  },

  report: function (req, res) {
    const { id } = req.params;
    const { userId } = req.body;

    console.log(id);
    console.log(userId);

    PostModel.findOne({ _id: id }, function (err, post) {
      if (err) {
        console.error(err);
        return res.status(500).send({ error: 'Failed to retrieve post' });
      }
  
      if (!post) {
        return res.status(404).send({ error: 'Post not found' });
      }

      if (post.reports && post.reports.includes(userId)) {
        return res.status(200).send({ message: 'You have already reported this post' });
      }
  
      post.reports = post.reports || [];
      post.reports.push(userId);
  
      if (post.reports.length > 5) {
        post.remove(function (removeErr) {
          if (removeErr) {
            console.error(removeErr);
            return res.status(500).send({ error: 'Failed to delete post' });
          }
  
          res.status(200).send({ message: 'Post deleted due to excessive reports' });
        });
      } else {
        post.save(function (saveErr) {
          if (saveErr) {
            console.error(saveErr);
            return res.status(500).send({ error: 'Failed to report post' });
          }
  
          res.status(200).send({ message: 'Report submitted successfully' });
        });
      }
    });
  },

  update: function (req, res) {
    var id = req.params.id;

    PostModel.findOne({ _id: id }, function (err, post) {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting post',
          error: err,
        });
      }

      if (!post) {
        return res.status(404).json({
          message: 'No such post',
        });
      }

      post.title = req.body.title ? req.body.title : post.title;
      post.content = req.body.content ? req.body.content : post.content;
      post.category = req.body.category ? req.body.category : post.category;
      post.image = req.body.image ? req.body.image : post.image;

      post.save(function (err, post) {
        if (err) {
          return res.status(500).json({
            message: 'Error when updating post.',
            error: err,
          });
        }

        return res.json(post);
      });
    });
  },

  remove: function (req, res) {
    var id = req.params.id;

    PostModel.findByIdAndRemove(id, function (err, Post) {
      if (err) {
        return res.status(500).json({
          message: 'Error when deleting the Post.',
          error: err,
        });
      }

      return res.status(204).json();
    });
  },
  toggleLike: async function (req, res) {
    const { id } = req.params;
    const { userId } = req.body;
    const postId = id;
    try {
      const post = await PostModel.findById(postId);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      const hasLiked = post.likes.includes(userId);
      const hasDisliked = post.dislikes.includes(userId);
  
      if (hasLiked) {
        post.likes.pull(userId);
      } else {
        if (hasDisliked) {
          post.dislikes.pull(userId);
        }
        post.likes.push(userId);
      }
  
      await post.save();
  
      return res.status(200).json({ message: 'Post updated', post });
    } catch (err) {
      console.log('Error:', err.message || err);
      return res.status(500).json({
        message: 'Error when updating likes/dislikes',
        error: err.message || err,
      });
    }
  },
  
  toggleDislike: async function (req, res) {
    const { id } = req.params;
    const { userId } = req.body;
    const postId = id;
  
    try {
      const post = await PostModel.findById(postId);
  
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      const hasLiked = post.likes.includes(userId);
      const hasDisliked = post.dislikes.includes(userId);
  
      if (hasDisliked) {
        post.dislikes.pull(userId);
      } else {
        if (hasLiked) {
          post.likes.pull(userId);
        }
        post.dislikes.push(userId);
      }
  
      await post.save();
  
      return res.status(200).json({ message: 'Post updated', post });
    } catch (err) {
      console.log('Error:', err.message || err);
      return res.status(500).json({
        message: 'Error when updating likes/dislikes',
        error: err.message || err,
      });
    }
  },
  addComment: async function (req, res) {
    const postId = req.params.id;

    // Preveri, ali so potrebni podatki prisotni
    if (!req.body.content || !req.body.userId) {
      return res.status(400).json({
        message: 'Content and userId are required',
      });
    }

    try {
      const newComment = new CommentModel({
        content: req.body.content,
        userId: req.body.userId,
      });

      const comment = await newComment.save();
      console.log('Saved Comment:', comment);

      // Dodaj komentar v objavo
      const post = await PostModel.findByIdAndUpdate(
        postId,
        { $push: { comments: comment._id } },
        { new: true }
      )
        .populate('comments')
        .exec();

      // console.log('Updated Post with New Comment:', post);
      return res.status(201).json(post);
    } catch (err) {
      console.log('Error:', err.message || err);
      return res.status(500).json({
        message: 'Error when creating comment or updating post',
        error: err.message || err,
      });
    }
  },

  removeComment: async function (req, res) {
    const postId = req.params.id;
    const commentId = req.params.commentId;

    try {
      const comment = await CommentModel.findByIdAndRemove(commentId);

      if (!comment) {
        return res.status(404).json({
          message: 'No such comment',
        });
      }

      const post = await PostModel.findByIdAndUpdate(
        postId,
        { $pull: { comments: commentId } },
        { new: true }
      )
        .populate('comments')
        .exec();

      return res.status(204).json(post);
    } catch (err) {
      console.log('Error:', err.message || err);
      return res.status(500).json({
        message: 'Error when deleting comment or updating post',
        error: err.message || err,
      });
    }
  },
};
