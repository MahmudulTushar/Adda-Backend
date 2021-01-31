const {Router} = require('express');
const messagesController = require('../controllers/messagesController');
const router = Router();

router.get('/messages/sync', messagesController.GetMessages);
router.get('/messages/:roomId',messagesController.GetMessagesByRoomId);
router.post('/messages/new',messagesController.PostMessage);

module.exports = router;