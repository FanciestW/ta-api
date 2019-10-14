const serverless = require('serverless-http');
const express = require('express');
const app = express();
const { google } = require('googleapis');
const { handleInternalError } = require('./utils/errorHandler');
require('dotenv').config();

app.get('/events', function (req, res) {
    const APIKEY = process.env.CAL_API_KEY;
    if (!APIKEY) {
        return handleInternalError(req, res, 'Bad API Key', 'Unable to access Google Calendar API');
    }
    const calendar = google.calendar('v3');
    const eventsParams = {
        calendarId: '0h3m4vqmstfon4fpsjj54st57k@group.calendar.google.com',
        auth: APIKEY,
        maxResults: 400,
        timeMin: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        timeMax: new Date(new Date().setMonth(new Date().getMonth() + 6))
    };
    calendar.events.list(eventsParams, function(gErr, gRes) {
        if (gErr) {
            handleInternalError(req, res, 'Google Calendar Error', gErr);
        }
        const events = gRes.data.items.filter((event) => {
            return event.status == 'confirmed' && event.start && event.end;
        });
        const formattedEvents = events.map((event) => {
            return {
                title: `${event.summary} ${event.location ? '@ ' + event.location : ''}`,
                start: event.start.dateTime || '',
                end: event.end.dateTime || '',
            };
        });
        res.status(200).send({events: formattedEvents,});
    });
});

const isInLambda = !!process.env.LAMBDA_TASK_ROOT;
if (isInLambda) {
    module.exports.handler = serverless(app);
} else {
    app.listen(3000, () => console.log('Listening on 3000'));
}