require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
app.use(connectDB);
const mongoose = require('mongoose');
const validator = require('validator');
const Announcement = require('./models/Announcement.model');
const { handleInternalError } = require('./utils/errorHandler');

function connectDB(req, _res, next) {
  const mongoUser = process.env.MONGODB_READ_WRITE_USER;
  const mongoPW = process.env.MONGODB_READ_WRITE_PW;
  const mongoCluster = process.env.MONGODB_CLUSTER;
  const mongoDB = process.env.MONGODB_DB;
  const DB_CONNECTION_STR = `mongodb+srv://${mongoUser}:${mongoPW}@${mongoCluster}/${mongoDB}?retryWrites=true&w=majority`;
  const mongoDBOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  mongoose.connect(DB_CONNECTION_STR, mongoDBOptions).then(() => {
    console.log('Connected to MongoDB');
    next();
  }).catch((err) => {
    console.log(`Failed to connect to MongoDB with error: ${err}`);
    return req.sendStatus(500);
  });
}

app.get('/api/announcements', (req, res) => {
  Announcement.find({ $and: [{ expires: { $gt: Date.now() } }, { $or: [{ starts: { $lt: Date.now() } }, { starts: null }] }] }, null, { sort: { priority: 1 } }, (err, docs) => {
    if (err) {
      console.log('Error occurred in fetching announcements.');
      return handleInternalError(req, res, 'Error Fetching Announcements', err);
    }
    res.status(200).send(JSON.stringify({ announcements: docs }));
  });
});

app.post('/api/announcements', async (req, res) => {
  const newAnnouncement = new Announcement({
    title: validator.escape(req.body.title),
    message: validator.escape(req.body.message),
    priority: req.body.priority,
    expires: req.body.expires,
    starts: req.body.starts,
  });
  newAnnouncement.save((err) => {
    if (err) {
      res.status(500).send(`Failed with error: ${err}`);
    } else {
      res.sendStatus(200);
    }
  });
});

if (!process.env.SERVERLESS && !process.env.IS_OFFLINE) {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports.handler = serverless(app);