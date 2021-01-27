
const express = require('express');
const mongoose = require('mongoose');
let ObjectId = require('mongodb').ObjectID;
const WhatsAppTable = require('./dbMessages.js');
const Message = WhatsAppTable.MessageContentTable;
const RoomContentTable = WhatsAppTable.RoomContentTable;
const RoomRequestTable = WhatsAppTable.RoomRequestTable;
const roomRequestsTableName = WhatsAppTable.roomRequestsTableName;
const roomRoomContentTableTableName = WhatsAppTable.roomRoomContentTableTableName;
const Pusher = require("pusher");
const app = express();
const connectionUrl = process.env.mongoDbconnectionUrl;
const port = process.env.PORT || 9000;
const pusher = new Pusher({
  appId: process.env.pusherAppId,
  key: process.env.pusherAppkey,
  secret: process.env.pusherAppSecret,
  cluster: process.env.pusherAppCluster,
  useTLS: process.env.pusherAppUseTLS
});
// middleware
app.use(express.json());

app.use((req, res, next) =>{
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
})

mongoose.connect(connectionUrl,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;
db.once('open', () =>{
  console.log('DB connected');
  const msgCollection = db.collection('messagecontents');
  const roomCollection = db.collection('roomcontents');
  const roomRequestsCollection = db.collection('roomrequests');
  const changeStreamOnMessagecontents = msgCollection.watch();
  const changeStreamOnRoomscontents = roomCollection.watch();
  const changeStreamOnRoomRequests = roomRequestsCollection.watch();
  changeStreamOnMessagecontents.on('change',(change)=>{
    console.log(change);
    if (change.operationType === "insert")
    {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "insert", messageDetails);
    }
    else
    {
    }
  })

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

  changeStreamOnRoomRequests.on('change',(change)=>{
    console.log(change);
    if (change.operationType === "insert")
    {
      const newNotification = change.fullDocument;
      pusher.trigger("roomRequest", "insert", newNotification);
    }
    else
    {
    }
  })
})

app.get('/',(req, res) =>{
    res.status(200).send('Hello World');
})


app.get('/messages/sync',(req, res) =>{
  Message.find((err, data) =>{
    if (err){
      res.status(500).send(err)
    }
    else{
      res.status(200).send(data);
    }
  })
})

app.get('/messages/:roomId',(req, res) =>{
  let roomId = req.params.roomId;
  Message.find({'roomId':roomId},(err, data) =>{
    if (err){
      res.status(500).send(err)
    }
    else{
      res.status(200).send(data);
    }
  })
})


app.post('/messages/new',(req, res) =>{
  const dbMessage = req.body;
  Message.create(dbMessage, (err, data) =>{
    if (err){
      res.status(500).send(err)
    }
    else{
      res.status(201).send(`New message created: \n ${data}`);
    }
  })
})
//-----------------------------------------
app.post('/rooms/new',(req, res) =>{
  const newRoom = req.body;
  RoomContentTable.create(newRoom, (err, data) =>{
    if (err){
      res.status(500).send(err)
    }
    else{
      res.status(201).send(`New Room created: \n ${data}`);
    }
  })
})

app.get('/rooms/sync/:emailId',(req, res) =>{
  let emailId = req.params.emailId;
  RoomContentTable.find({ $or: [ { roomOwner: emailId }, { friends: emailId } ] }, (err, data) =>{
    if (err){
      res.status(500).send(err)
    }
    else{
      res.status(200).send(data);
    }
  })
})

app.get('/rooms/:roomId',(req, res) =>{
  let roomId = req.params.roomId;
  console.log(roomId)
  RoomContentTable.findOne({'_id':roomId},(err, data) =>{
    if (err){
      res.status(500).send(err)
    }
    else{
      res.status(200).send(data);
    }
  })
})
//---------------------------
app.post('/rooms/request',(req, res) =>{
  const newRoomRequest = req.body;
  RoomContentTable.countDocuments({ $and: [ { _id: newRoomRequest.roomId }, { friends: newRoomRequest.receiverEmail } ] }, (errFromRoomTable, numberOfRecord) =>{
    if (errFromRoomTable){
      res.status(500).send(errFromRoomTable)
    }
    else{
      if (numberOfRecord > 0)
        res.status(409).send(`This user already a member of this room: \n ${numberOfRecord}`);
      else
      {
        RoomRequestTable.create(newRoomRequest, (err, data) =>{
          if (err){
            res.status(500).send(err)
          }
          else{
            res.status(201).send(`New Room Request created: \n ${data}`);
          }
        })
      }  
    }
  })

})

app.get('/rooms/request/:receiverEmail',(req, res) =>{
  let receiverEmail = req.params.receiverEmail;
  console.log(roomRoomContentTableTableName);
  RoomRequestTable.aggregate((
    [ { $match : { receiverEmail : receiverEmail}},
      {$project: {roomId: { $toObjectId : "$roomId"}}},
      {  
      $lookup: {
      from: roomRoomContentTableTableName,
      localField: "roomId",    
      foreignField: "_id",  
      as: "roomInformation"} 
     }]
    ), (err,data) =>{
      if (err){
        res.status(500).send(err)
      }
      else{
        res.status(200).send(data);
      }
    })
})

app.delete('/rooms/request/:requestId',(req, res) =>{
  const requesBody = req.body;
  const requestId = req.params.requestId;
  RoomRequestTable.deleteOne(({_id: ObjectId(requestId)}), (err, data) =>{
    if (err){
      res.status(500).send({err, message:`Error while deleting the request id : ${requestId}`})
    }
    else{
      if (requesBody.requestAccepted)
      {
        RoomContentTable.updateOne(
          { '_id': ObjectId(requesBody.roomId) },
          { $addToSet: { friends: requesBody.receiverEmail } }
          , (errFromRoomContentTable, dataFromFromRoomContentTable) =>{
          if (errFromRoomContentTable)
          {
             // If failed to join in the room then roolback the room request
             let oldRoomRequest = {};
             oldRoomRequest.roomId = requesBody.roomId;
             oldRoomRequest.receiverEmail = requesBody.receiverEmail;
             oldRoomRequest.received = false;
             RoomRequestTable.create(oldRoomRequest, (errFromRoomRequest, dataFromRoomRequest) =>{
              if (errFromRoomRequest){
                res.status(500).send({err, message:`Error while adding friends to the room id : ${requesBody.roomId}`});
              }
              else{
                res.status(200).send(`Error while adding friends to the room id : ${requesBody.roomId}. Roolbacking the request`);
              }
            }) 
          }
          else
          {
            res.status(201).send(`Friend(${requesBody.receiverEmail}) Added to the room: ${requesBody.roomId}. Data:   \n ${JSON.stringify(dataFromFromRoomContentTable)}`);
          }
        })  
      }
      else 
        res.status(200).send(`Request for room id: ${requestId} deleted. Data: \n ${data}`);
    }
  })
 
})

//---------------------------


app.listen(port, () => console.log(`Listening on loclhost: ${port}`));