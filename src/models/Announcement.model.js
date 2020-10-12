const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnnouncementSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, default: ''},
  priority: { type: Number, default: 0, min: 0, max: 2 },
  expires: { type: Date, required: false, default: () => new Date(+new Date() + 1*24*60*60*1000) }, // Default: next day
  starts: {type: Date, required: false, default: Date.now },
}, { collection: 'announcements' });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
