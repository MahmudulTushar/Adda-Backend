const {Router} = require('express');
const roomsController = require('../controllers/roomsController');
const router = Router();

router.get('/rooms/sync/:emailId', roomsController.GetRoomsByEmailId);
router.get('/rooms/:roomId',roomsController.GetRoomsByRoomId);
router.post('/rooms/new',roomsController.PostRoom);

module.exports = router;