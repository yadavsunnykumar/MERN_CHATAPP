import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// protect route that checks that user is logged in or not and then only user can access the protected routes
// if user is not logged in then user will be redirected to login page
// if user is logged in then user can access the protected routes
export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    // if token is not present in cookies
    if (!token) {
      return res.status(401).json({ message: "User is not logged in" });
    }
    // if token is present in cookies then it is decoded and saved in decoded variable. it contains of user id and  password
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
    // if token is not valid
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }
    // if token is valid then user is searched in database with the help of user id
    const user = await User.findById(decoded.userId).select("-password");
  
    // if user is not found in database then proper response is sent
    if (!user) {
      return res.status(404).json({ message: "User not found here" });
    }
    // if user is found in database then user is saved in req.user and next() is called to move to next middleware
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
