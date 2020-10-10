const serverless = require('serverless-http');
const express = require('express');
const app = express();

if (!process.env.SERVERLESS) {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports.handler = serverless(app);