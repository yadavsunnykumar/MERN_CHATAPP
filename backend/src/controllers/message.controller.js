import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import cloudinary from '../lib/cloudinary.js';
import { getReceiverSocketId,io } from '../lib/socket.js';


// controllers for getting all the users for the sidebar to show the users in the chat
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUser = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
        res.status(200).json(filteredUser);
    } catch (error) {
        console.log("Error in getUsersForSidebar", error.message);
        res.status(500).json({ message: "Internal server error" });
        
    }
}


// getting the messages between the logged in user and the user in which we are clicking
export const getMessages = async (req, res) => { 
    try {
        const {id:userToChatId} = req.params;
        const myId = req.user._id;
        const messages =  await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        })
        res.status(200).json(messages);
        
    } catch (error) {
        console.log("Error in getMessages", error.message);
        res.status(500).json({ message: "Internal server error" });
        
    }
}


// controller for sending the message to other user after clicking it or user having some specific id
export const sendMessage = async (req, res) => {
    try {
        //. getting test and image from the request body
        const {text,image} = req.body;
        // getting receiver id from the request params
        const {id:receiverId} = req.params;
        // getting own id i.e who is going to send the message
        const senderId = req.user._id;

        // upload image to cloudinary if user is sending image
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        // creating new message
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });
        // saving the message
        await newMessage.save();

        //todo: realtime functionality goes here => socket.io
        const receiverSocketId = getReceiverSocketId(receiverId)
        if(receiverId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }

        // sending the message
        res.status(200).json(newMessage);
        
    } catch (error) {
        console.log("Error in sendMessage", error.message);
        res.status(500).json({ message: "Internal server error" });
        
    }
 }