const express = require('express');
const { checkSubscription } = require('../middleware/checkSub');
const multer = require('multer');
const Video = require('../models/Video');

const router = express.Router();

router.get('/', checkSubscription, (req, res) => {
  const videos = Video.find({});
  res.render('exclusive-content', { user: req.user, videos });
});

router.get('/video/:id', checkSubscription, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).send('Video not found');

    // Serve the video file from the server
    res.sendFile(video.file, { root: '.' }); // Adjust root if needed
  } catch (error) {
    res.status(500).send('Error fetching video');
  }
});

module.exports = router;
