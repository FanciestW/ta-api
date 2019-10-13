const serverless = require('serverless-http');
const express = require('express');
const app = express();
const { handleInternalError } = require('./utils/errorHandler');
require('dotenv').config();

app.get('/events', function (req, res) {
    const APIKEY = undefined;
    if (!APIKEY) {
        return handleInternalError(req, res, 'Bad API Key', 'Unable to access Google Calendar API');
    }
    return res.send('Hello World!');
});

const isInLambda = !!process.env.LAMBDA_TASK_ROOT;
if (isInLambda) {
    module.exports.handler = serverless(app);
} else {
    app.listen(3000, () => console.log('Listening on 3000'));
}