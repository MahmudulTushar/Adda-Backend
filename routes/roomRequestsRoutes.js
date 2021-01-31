const {Router} = require('express');
const roomRequstsController = require('../controllers/roomRequestsController');
const router = Router();

router.get('/rooms/request/:receiverEmail', roomRequstsController.GetRoomRequestByEmailId);
router.post('/rooms/request',roomRequstsController.PostRoomRequst);
router.delete('/rooms/request/:requestId',roomRequstsController.DeleteRoomRequest);

module.exports = router;