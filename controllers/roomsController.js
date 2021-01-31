const RoomContentTable = require('../Models/Room').RoomContentTable;
const roomContentTableName = require('../Models/Room').roomContentTableName;
const mongoDbInstance = require('../Utility/mongoDbUtils');
const pusher = require('../Utility/pusherUtils');
let ObjectId = require('mongodb').ObjectID;

mongoDbInstance.once('open', () =>{
  console.log('DB connected From room controller');
  const roomCollection = mongoDbInstance.collection(roomContentTableName);
  const changeStreamOnRoomscontents = roomCollection.watch();
  changeStreamOnRoomscontents.on('change',(change)=>{
    console.log(change);
    if (change.operationType === "insert")
    {
      const roomDetails = change.fullDocument;
      pusher.trigger("rooms", "insert", roomDetails);
    }
    else
    {
    }
  })
})

module.exports.GetRoomsByEmailId = (req, res) =>{
  let emailId = req.params.emailId;
  RoomContentTable.find({ $or: [ { roomOwner: emailId }, { friends: emailId } ] }, (err, data) =>{
    if (err){
      res.status(500).send(err)
    }
    else{
      res.status(200).send(data);
    }
  })
}

module.exports.GetRoomsByRoomId = (req, res) =>{
  let roomId = req.params.roomId;
  RoomContentTable.findOne({'_id':roomId},(err, data) =>{
    if (err){
      res.status(500).send(err)
    }
    else{
      res.status(200).send(data);
    }
  })
}

module.exports.PostRoom = (req, res) =>{
  const newRoom = req.body;
  RoomContentTable.create(newRoom, (err, data) =>{
    if (err){
      res.status(500).send(err)
    }
    else{
      res.status(201).send(`New Room created: \n ${data}`);
    }
  })
}
