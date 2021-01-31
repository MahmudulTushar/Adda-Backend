const mongoose = require('mongoose');
const roomRequestsTableName = 'roomrequests';
const whatsRoomRequestSchema = mongoose.Schema({
  roomId : String,
  receiverEmail: String,
  received : Boolean,
  timeStamp: String
})
const RoomRequestTable = mongoose.model(roomRequestsTableName, whatsRoomRequestSchema);
module.exports = {RoomRequestTable, roomRequestsTableName};