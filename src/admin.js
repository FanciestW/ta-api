require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Announcement = require('./models/Announcement.model');
const { handleInternalError } = require('./utils/errorHandler');

const mongoUser = process.env.ENV === 'prod' ? process.env.MONGODB_ANNOUNCEMENT_READ_WRITE_USER : process.env.MONGODB_ANNOUNCEMENT_DEV_READ_WRITE_USER;
const mongoPW = process.env.ENV == 'prod' ? process.env.MONGODB_ANNOUNCEMENT_READ_WRITE_PW : process.env.MONGODB_ANNOUNCEMENT_DEV_READ_WRITE_PW;
const mongoCluster = process.env.MONGO_CLUSTER;
const mongoDB = process.env.ENV == 'prod' ? process.env.MONGODB_DB || 'ta' : process.env.MONGODB_DB_DEV || 'ta-dev';
const DB_CONNECTION_STR = `mongodb+srv://${mongoUser}:${mongoPW}@${mongoCluster}/${mongoDB}?retryWrites=true&w=majority`;
const mongoDBOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose.connect(DB_CONNECTION_STR, mongoDBOptions).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log(`Failed to connect to MongoDB with error: ${err}`);
});

app.get('/api/announcements', (req, res) => {
  Announcement.find({$and: [{expires: {$gt: Date.now()}}, { $or: [ {starts: {$lt: Date.now()}}, {starts: null}]}]}, null, {sort: {priority: 1 }}, (err, docs) => {
    if (err) {
      console.log('Error occurred in fetching announcements.');
      return handleInternalError(req, res, 'Error Fetching Announcements', err);
    }
    res.status(200).send(JSON.stringify({announcements: docs}));
  });
});

if (!process.env.SERVERLESS && !process.env.IS_OFFLINE) {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports.handler = serverless(app);