const mongoose = require('mongoose');
const messageContentTableName = 'messagecontents';
const whatsMessageContentSchema = mongoose.Schema({
  message: String,
  name: String,
  timeStamp: String,
  roomId: String,
  senderEmail: String
})
const MessageContentTable = mongoose.model(messageContentTableName, whatsMessageContentSchema);

module.exports = {MessageContentTable, messageContentTableName};