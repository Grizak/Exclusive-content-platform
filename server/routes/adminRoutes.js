const express = require('express');
const multer = require('multer');
const Video = require('../models/Video');

const { checkAdmin } = require('../middleware/checkAdmin');

const router = express.Router();
/*
const storage = multer.diskStorage({
  destination: '/uploads', // Directory to store video files
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });
*/
router.post('/upload-video', /*upload.single('video'),*/ async (req, res) => {
  try {
    // Create a new document in MongoDB with the file path and name
    const video = new Video({
      name: req.file.originalname,
      file: req.file.path, // Store the file path in MongoDB
    });
    await video.save();

    res.status(201).send('Video uploaded successfully');
  } catch (error) {
    res.status(500).send('Error uploading video');
  }
});

module.exports = router;
