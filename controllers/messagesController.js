const Message = require('../Models/Message').MessageContentTable;
const messageContentTableName = require('../Models/Message').messageContentTableName;
const mongoDbInstance = require('../Utility/mongoDbUtils');
const pusher = require('../Utility/pusherUtils');
let ObjectId = require('mongodb').ObjectID;

mongoDbInstance.once('open', () =>{
  console.log('DB connected from Message controller');
  const msgCollection = mongoDbInstance.collection(messageContentTableName);
  const changeStreamOnMessagecontents = msgCollection.watch();
  changeStreamOnMessagecontents.on('change',(change)=>{
    if (change.operationType === "insert")
    {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "insert", messageDetails);
    }
    else
    {
    }
  })
})

module.exports.GetMessages = (req, res) =>{
  Message.find((err, data) =>{
    if (err){
      res.status(500).send(err)
    }
    else{
      res.status(200).send(data);
    }
  })
}

module.exports.GetMessagesByRoomId = (req, res) =>{
  let roomId = req.params.roomId;
  Message.find({'roomId':roomId},(err, data) =>{
    if (err){
      res.status(500).send(err)
    }
    else{
      res.status(200).send(data);
    }
  })
}

module.exports.PostMessage = (req, res) =>{
  const dbMessage = req.body;
  Message.create(dbMessage, (err, data) =>{
    if (err){
      res.status(500).send(err)
    }
    else{
      res.status(201).send(`New message created: \n ${data}`);
    }
  })
}