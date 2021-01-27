// import mongoose from "mongoose";
const mongoose = require('mongoose');
const roomRequestsTableName = 'roomrequests';
const roomRoomContentTableTableName = 'roomcontents';
const whatsMessageContentSchema = mongoose.Schema({
  message: String,
  name: String,
  timeStamp: String,
  roomId: String,
  senderEmail: String
})

const whatsRoomContentSchema = mongoose.Schema({
  name: String,
  roomOwner: String,
  roomOwnerDisplayName: String,
  friends:[String]
})

const whatsRoomRequestSchema = mongoose.Schema({
  roomId : String,
  receiverEmail: String,
  received : Boolean,
  timeStamp: String
})
const MessageContentTable = mongoose.model('messagecontents', whatsMessageContentSchema);
const RoomContentTable = mongoose.model(roomRoomContentTableTableName, whatsRoomContentSchema);
const RoomRequestTable = mongoose.model(roomRequestsTableName, whatsRoomRequestSchema);
module.exports = {MessageContentTable,RoomContentTable, RoomRequestTable, roomRequestsTableName, roomRoomContentTableTableName};