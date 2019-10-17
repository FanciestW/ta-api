const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const { google } = require('googleapis');
const { handleInternalError } = require('./utils/errorHandler');
const mongoose = require('mongoose');
const Announcement = require('./models/Announcement.model');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const DB_CONNECTION_STR = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PW}@ta-cluster-i0zdc.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
mongoose.connect(DB_CONNECTION_STR).then(() => {
    console.log('Connected to MongoDB');
}).catch(() => {
    console.log('Failed to Connect to MongoDB');
});

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
            };
        });
        res.status(200).send({events: formattedEvents,});
    });
});

app.get('/announcements', (req, res) => {
    Announcement.find({expires: {$gt: Date.now()}}, null, {sort: {expires: -1 }}, (err, docs) => {
        if (err) {
            console.log('Error occurred in fetching announcements.');
            return handleInternalError(req, res, 'Error Fetching Announcements', err);
        }
        console.log(docs);
        res.status(200).send(JSON.stringify({announcements: docs}));
    });
});

const isInLambda = !!process.env.LAMBDA_TASK_ROOT;
if (isInLambda) {
    module.exports.handler = serverless(app);
} else {
    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
}