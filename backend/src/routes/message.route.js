import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getUsersForSidebar,getMessages,sendMessage } from '../controllers/message.controller.js';

const router = express.Router();


// getting all the users for the sidebar to show the users
router.get('/users',protectRoute,getUsersForSidebar);

// routes to get the message for the user in which we are clicking in the specific user
router.get('/:id',protectRoute,getMessages);

router.post('/send/:id',protectRoute,sendMessage);



export default router;