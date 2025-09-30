import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    // get token
    const token = req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "No authentication token access denied",
      });
    }

    // verifying token and we are getting user id in the decoded variable
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // find userbyId as we get the user id the decoded variable and with the help of that we are searching the user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "Token is not valid",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error", error);
    return res.status(500).json({ message: "Token is not valid" });
  }
};
