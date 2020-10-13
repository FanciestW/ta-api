const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(connectDB);
const { google } = require('googleapis');
const { handleInternalError } = require('./utils/errorHandler');
const mongoose = require('mongoose');
const Announcement = require('./models/Announcement.model');
require('dotenv').config();

function connectDB(_req, res, next) {
  const mongoUser = process.env.MONGODB_READ_WRITE_USER;
  const mongoPW = process.env.MONGODB_READ_WRITE_PW;
  const mongoCluster = process.env.MONGODB_CLUSTER;
  const mongoDB = process.env.MONGODB_DB;
  const DB_CONNECTION_STR = `mongodb+srv://${mongoUser}:${mongoPW}@${mongoCluster}/${mongoDB}?retryWrites=true&w=majority`;
  const mongodbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  mongoose.connect(DB_CONNECTION_STR, mongodbOptions).then(() => {
    console.log('Connected to MongoDB');
    next();
  }).catch(() => {
    console.log('Failed to Connect to MongoDB');
    return res.sendStatus(500);
  });
}
app.get('/events', (req, res) => {
  const APIKEY = process.env.CAL_API_KEY;
  if (!APIKEY) {
    return handleInternalError(req, res, 'Bad API Key', 'Unable to access Google Calendar API');
  }
  const calendar = google.calendar('v3');
  const eventsParams = {
    calendarId: '0h3m4vqmstfon4fpsjj54st57k@group.calendar.google.com',
    auth: APIKEY,
    maxResults: 400,
    singleEvents: true,
    timeMin: new Date(new Date().setMonth(new Date().getMonth() - 6)),
    timeMax: new Date(new Date().setMonth(new Date().getMonth() + 6))
  };
  calendar.events.list(eventsParams, function(gErr, gRes) {
    const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
    if (gErr) {
      console.log('Error occurred in fetching calendar events.');
      return handleInternalError(req, res, 'Google Calendar Error', gErr);
    }
    const events = gRes.data.items.filter((event) => {
      return event.status == 'confirmed' && event.start && event.end;
    });
    const formattedEvents = events.map((event) => {
      return {
        title: `${event.summary} ${!event.start.date ? event.location ? '\n' + event.location : '\nLibrary Café' : ''}`,
        start: event.start.dateTime || event.start.date || '',
        end: event.end.dateTime || event.end.date || '',
        allDay: event.start.date ? true : false,
        url: event.location ? event.location.match(urlRegex) ? event.location : undefined : undefined,
      };
    });
    res.status(200).send({events: formattedEvents,});
  });
});

app.get('/announcements', (req, res) => {
  Announcement.find({$and: [{expires: {$gt: Date.now()}}, { $or: [ {starts: {$lt: Date.now()}}, {starts: null}]}]}, null, {sort: {priority: 1 }}, (err, docs) => {
    if (err) {
      console.log('Error occurred in fetching announcements.');
      return handleInternalError(req, res, 'Error Fetching Announcements', err);
    }
    res.status(200).send(JSON.stringify({announcements: docs}));
  });
});

const isInLambda = !!process.env.LAMBDA_TASK_ROOT;
if (isInLambda) {
  module.exports.handler = serverless(app);
} else {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Listening on ${PORT}`));
}
