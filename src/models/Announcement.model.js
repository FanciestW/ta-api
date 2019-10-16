const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const AnnouncementSchema = new Schema({
    announcementId: ObjectId,
    title: String,
    message: String,
    expires: Date,
}, { collection: 'announcements' });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
