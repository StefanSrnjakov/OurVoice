var express = require('express');
var router = express.Router();
var PostController = require('../controllers/PostController.js');

function requiresLogin(req, res, next){
    if(req.session && req.session.userId){
        return next();
    } else{
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}
router.get('/', PostController.list);
router.get('/reported', PostController.getReportedPosts);
router.get('/:id', PostController.show);

router.post('/', PostController.create);

router.put('/report/:id', PostController.report);

router.put('/:id/toggle-like', PostController.toggleLike);
router.put('/:id/toggle-dislike', PostController.toggleDislike);

router.put('/:id', PostController.update);

router.delete('/:id', PostController.remove);

router.post('/:id/comment', PostController.addComment);
router.delete('/:id/comment/:commentId', PostController.removeComment);

module.exports = router;
