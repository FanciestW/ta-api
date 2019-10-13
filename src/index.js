const serverless = require('serverless-http');
const express = require('express');
const app = express();
require('dotenv').config();

app.get('/events', function (req, res) {
    console.log(`Host: ${req.get('host')}`);
    res.send('Hello World!');
});


const isInLambda = !!process.env.LAMBDA_TASK_ROOT;
if (isInLambda) {
    module.exports.handler = serverless(app);
} else {
    app.listen(3000, () => console.log('Listening on 3000'));
}