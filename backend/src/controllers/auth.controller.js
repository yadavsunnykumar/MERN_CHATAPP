import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// controller for signup function i.e signup controller
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    //validate user input
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // validating password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    //checking that user already exists or not
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create new user
    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      //generate token
      generateToken(newUser._id, res);

      //save user to database
      await newUser.save();
      res.status(201).json({
        message: "User created successfully",
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(500).json({ message: "Failed to create user" });
    }
  } catch (error) {
    console.log("Error in signup controller", error, message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// controller for login function i.e login controller
export const login = async (req, res) => {
  // Taking email and password from user and validating it from database and giving proper response

  const { email, password } = req.body;

  try {
    // validating user input fields that it should not be empty
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // checking user exist or not in database
    const user = await User.findOne({ email });
    // if user does not exist in database
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    // if password is incorrect
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // if password is correct then generate token
    generateToken(user._id, res);

    // sending response to user
    res.status(200).json({
      message: "User logged in successfully",
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error, message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// controller for logout function i.e logout controller
export const logout = (req, res) => {
  try {
    // clearing cookie
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error, message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// controller for updateProfile function i.e updateProfile controller
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    // taking user id from the request which is sent from the middleware after verifying the token that user is logged in or not
    const userID = req.user._id;
    // if the profile picture is not provided by the user
    if (!profilePic) {
      return res
        .status(400)
        .json({ message: "Please provide profile picture" });
    }
    // upload profile picture to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    // find user by id and update profile picture
    const updatedUser = await User.findByIdAndUpdate(
      userID,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    if (updatedUser) {
      res.status(200).json({
        message: "Profile picture updated successfully",
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      });
    }
  } catch (error) {
    console.log("Error in updateProfile controller", error, message);
    res.status(500).json({ message: "Internal server error" });
  }
};


// controller for checkAuth function i.e checkAuth controller
export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error, message);
    res.status(500).json({ message: "Internal server error" });
  }
}
  