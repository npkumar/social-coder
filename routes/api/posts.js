const express = require('express');
const _ = require('lodash');

const router = express.Router();
const passport = require('passport');

// Modal
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// Validator
const validatePostInput = require('../../validation/post');

// @route  GET api/posts/test
// @desc   Test posts route
// @access Public
router.get('/test', (req, res) => {
  res.json({
    message: 'Posts!',
  });
});

// @route  POST api/posts
// @desc   Create Post
// @access Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors } = validatePostInput(req.body);
  if (!_.isEmpty(errors)) {
    return res.status(400).json(errors);
  }

  const { text, name, avatar } = req.body;

  const newPost = new Post({
    text,
    name,
    avatar,
    user: req.user.id,
  });

  return newPost.save()
    .then(post => res.json(post))
    .catch(err => res.status(500).json(err));
});

// @route  GET api/posts
// @desc   Get all Posts
// @access Public
router.get('/', (req, res) => Post
  .find()
  .sort({ date: -1 })
  .then(posts => res.json(posts))
  .catch(() => res.status(404).json({ message: 'Not found!' })));

// @route  GET api/posts/:id
// @desc   Get a Post
// @access Public
router.get('/:id', (req, res) => Post.findById(req.params.id)
  .then(post => res.json(post))
  .catch(() => res.status(404).json({ message: 'Not found!' })));

// @route  DELETE api/posts/:id
// @desc   Delete a Post
// @access Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => Profile.findOne({ user: req.user.id })
  .then((profile) => {
    if (!_.isEmpty(profile)) {
      return Post.findById(req.params.id);
    }
    return null;
  })
  .then((post) => {
    if (post) {
      if (post.user === req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      return post.remove()
        .then(() => res.json({ succcess: true }));
    }

    return null;
  })
  .catch(() => res.status(404).json({ message: 'Not found' })));

// @route  POST api/posts/:id/like
// @desc   Like a Post
// @access Private
router.post('/:id/like', passport.authenticate('jwt', { session: false }), (req, res) => Profile.findOne({ user: req.user.id })
  .then((profile) => {
    if (!_.isEmpty(profile)) {
      return Post.findById(req.params.id);
    }
    return null;
  })
  .then((post) => {
    if (post) {
      if (_.filter(post.likes, like => like.user.toString() === req.user.id).length > 0) {
        return res.status(400).json({ message: 'Already liked!' });
      }
      post.likes.unshift({ user: req.user.id });
      return post.save().then(p => res.json(p));
    }

    return null;
  })
  .catch(() => res.status(404).json({ message: 'Not found' })));

// @route  POST api/posts/:id/unlike
// @desc   Unlike a Post
// @access Private
router.post('/:id/unlike', passport.authenticate('jwt', { session: false }), (req, res) => Profile.findOne({ user: req.user.id })
  .then((profile) => {
    if (!_.isEmpty(profile)) {
      return Post.findById(req.params.id);
    }
    return null;
  })
  .then((post) => {
    if (post) {
      if (_.filter(post.likes, like => like.user.toString() === req.user.id).length === 0) {
        return res.status(400).json({ message: 'Not liked!' });
      }
      const index = _.findIndex(post.likes, like => like.user.toString() === req.user.id);
      post.likes.splice(index, 1);
      return post.save().then(p => res.json(p));
    }

    return null;
  })
  .catch(() => res.status(404).json({ message: 'Not found' })));

// @route  POST api/posts/:id/comment
// @desc   Add a comment to post
// @access Private
router.post('/:id/comment', passport.authenticate('jwt', { session: false }), (req, res) => {
  const { errors } = validatePostInput(req.body);
  if (!_.isEmpty(errors)) {
    return res.status(400).json(errors);
  }

  const { text, name, avatar } = req.body;

  return Post.findById(req.params.id)
    .then((post) => {
      const newComment = {
        text,
        name,
        avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);
      return post.save().then(p => res.json(p));
    })
    .catch(() => res.status(404).json({ message: 'Not found' }));
});

// @route  DELETE api/posts/:id/comment/:comment_id
// @desc   Delete a comment from a post
// @access Private
router.delete('/:id/comment/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => Post.findById(req.params.id)
  .then((post) => {
    const index = _.findIndex(post.comments, comment => (comment.user.toString() === req.user.id && comment.id.toString() === req.params.comment_id));
    post.comments.splice(index, 1);

    return post.save().then(p => res.json(p));
  })
  .catch(() => res.status(404).json({ message: 'Not found' })));

module.exports = router;
