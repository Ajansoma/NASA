const mongoose = require('mongoose');

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready!');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

const mongoConnect = async function () {
  await mongoose.connect(MONGO_URL);
};

const mongoDisconnect = async function () {
  await mongoose.disconnect();
};
module.exports = { mongoConnect, mongoDisconnect };
