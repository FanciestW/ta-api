const serverless = require('serverless-http');
const express = require('express');
const app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/test', function (req, res){
  res.send('The test works');
})


const isInLambda = !!process.env.LAMBDA_TASK_ROOT;
if (isInLambda) {
  module.exports.handler = serverless(app);
} else {
    app.listen(3000, () => console.log(`Listening on 3000`));
}