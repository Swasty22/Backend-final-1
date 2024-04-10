import { apiError } from "../utilities/apierror.js";
import { asyncHandler } from "../utilities/asynchandler.js";
import { User } from "../models/user.models.js";
import  jwt from "jsonwebtoken";

const verifyJwt = asyncHandler(async (req, res , next) => {
   try {
     const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ",'')  //we used cookies using cookie parser as middleware so on res adn req we can access cookies
    //req has access to cookie parser so we can use cookies here..req.cookie
     if (!token) {
         throw new apiError(400, "Unauthorized user ") //if token not avilable throw error
     }
     //if token available verify with jwt (json web token)bcoz it has access to our  id and email in user.model.js decode the token
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN)
 
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
     
     if (!user) {
         throw new apiError(401 , "Invalid Access Token")
     }
     req.user = user

     next()
   } catch (error) {
    throw new apiError(401, error?.message || "invalid access token")
   }

})


// ye kya kr rha h...
//cookie se ya authorization se token lelo , verify krlo , uske baadh decode b krlo..user ke info sahi h toh 
//req.user ko user k id de do...//next pe chal jao

export {verifyJwt}