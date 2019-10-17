const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const AnnouncementSchema = new Schema({
    announcementId: ObjectId,
    title: String,
    message: { type: String, default: ''},
    priority: { type: Number, default: 1 },
    expires: Date,
}, { collection: 'announcements' });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
