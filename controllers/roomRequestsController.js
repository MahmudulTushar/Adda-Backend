const RoomRequestTable = require('../Models/RoomRequest').RoomRequestTable;
const RoomContentTable = require('../Models/Room').RoomContentTable;
const roomContentTableName = require('../Models/RoomRequest').roomRequestsTableName;
const mongoDbInstance = require('../Utility/mongoDbUtils');
const pusher = require('../Utility/pusherUtils');
let ObjectId = require('mongodb').ObjectID;

mongoDbInstance.once('open', () =>{
  console.log('DB connected From Room request controller');
  const roomRequestsCollection = mongoDbInstance.collection(roomContentTableName);
  const changeStreamOnRoomRequests = roomRequestsCollection.watch();
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

module.exports.GetRoomRequestByEmailId = (req, res) =>{
  let receiverEmail = req.params.receiverEmail;
  RoomRequestTable.aggregate((
    [ { $match : { receiverEmail : receiverEmail}},
      {$project: {roomId: { $toObjectId : "$roomId"}}},
      {  
      $lookup: {
      from: roomContentTableName,
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
}

module.exports.PostRoomRequst = (req, res) =>{
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

}

module.exports.DeleteRoomRequest = (req, res)=>{
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
 
}
