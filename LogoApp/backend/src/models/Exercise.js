/**
 * Exercise Model
 */

const Exercise = {
  id: Number,
  title: String,
  type: String,       // 'text' | 'video' | 'audio'
  description: String,
  link: String,       // Optional URL for video/audio resources
  createdAt: Date,
};

module.exports = Exercise;
