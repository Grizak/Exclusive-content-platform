const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  file: {
    type: String, // Storing file path or URL
    required: true,
  },
});

const videoModel = mongoose.model('Video', videoSchema);
module.exports = videoModel;
