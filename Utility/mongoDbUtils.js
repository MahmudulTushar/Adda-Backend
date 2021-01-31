const mongoose = require('mongoose');
const mongoDbConnectionUrl = process.env.mongoDbconnectionUrl;
mongoose.connect(mongoDbConnectionUrl,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
const db = mongoose.connection;
module.exports = db;