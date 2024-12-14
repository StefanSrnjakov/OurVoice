var PostModel = require('../models/PostModel');
var CommentModel = require('../models/CommentModel');

/**
 * PostController.js
 *
 *
 * @description :: Server-side logic for managing Posts.
 */

module.exports = {
  list: function (req, res) {
    PostModel.find()
      .populate('userId', 'username') // Dodano za pridobitev username polja iz User modela
      .exec(function (err, Posts) {
        if (err) {
          return res.status(500).json({
            message: 'Error when getting Post.',
            error: err,
          });
        }
        return res.json(Posts);
      });
  },

  // Posodobljena metoda za prikaz posamezne objave
  show: function (req, res) {
    var id = req.params.id;

    PostModel.findOne({ _id: id })
      .populate('userId', 'username') // Populacija za prikaz avtorja
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'username' }, // Populacija uporabnikov v komentarjih
      })
      .exec(function (err, post) {
        if (err) {
          return res.status(500).json({
            message: 'Error when getting Post.',
            error: err,
          });
        }

        if (!post) {
          return res.status(404).json({
            message: 'No such Post',
          });
        }

        return res.json(post);
      });
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
