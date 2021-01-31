const mongoose = require('mongoose');
const roomContentTableName = 'roomcontents';
const whatsRoomContentSchema = mongoose.Schema({
  name: String,
  roomOwner: String,
  roomOwnerDisplayName: String,
  friends:[String]
})

const RoomContentTable = mongoose.model(roomContentTableName, whatsRoomContentSchema);
module.exports = {RoomContentTable, roomContentTableName};