require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Announcement = require('./models/Announcement.model');

const mongoUser = process.env.ENV === 'prod' ? process.env.MONGODB_ANNOUNCEMENT_READ_WRITE_USER : process.env.MONGODB_ANNOUNCEMENT_DEV_READ_WRITE_USER;
const mongoPW = process.env.ENV == 'prod' ? process.env.MONGODB_ANNOUNCEMENT_READ_WRITE_PW : process.env.MONGODB_ANNOUNCEMENT_DEV_READ_WRITE_PW;
const mongoCluster = process.env.MONGO_CLUSTER;
const mongoDB = process.env.ENV == 'prod' ? process.env.MONGODB_DB : process.env.MONGODB_DB_DEV;
const DB_CONNECTION_STR = `mongodb+srv://${mongoUser}:${mongoPW}@${mongoCluster}/${mongoDB}?retryWrites=true&w=majority`;
const mongoDBOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose.connect(DB_CONNECTION_STR, mongoDBOptions).then(() => {
  console.log('Connected to MongoDB');
}).catch(() => {
  console.log('Failed to connect to MongoDB');
});

if (!process.env.SERVERLESS) {
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports.handler = serverless(app);