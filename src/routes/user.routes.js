import  Router  from "express";
import   { registerUser,logOutUser, loginUser, changeCurrentPassword, currentUser, updateAccount, updateAvatar, updateCoverImage, getUserChannelProfile, getUserWatchHistory }  from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { refreshToken } from "../controllers/user.controller.js";

//what we doing is file handling so we are importing multer bcoz its helps to handle files its a miidleware so wee uploading it in the middlde
const router = Router()

router.route('/register').post(upload.fields(
    [
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]
)
,registerUser) //fields inbuilt fn accepts array

router.route('/login').post(loginUser)  //for login in time loginuser function runs

router.route('/logout').post(verifyJwt, logOutUser)  //we are injecting verifyjwt to verify the access token is matching or not

router.route('/refresh-token').post(refreshToken) // check
router.route('/change-password').post(verifyJwt , changeCurrentPassword)
router.route("/current-user").get(verifyJwt , currentUser) //check
router.route('/update-account').patch(verifyJwt , updateAccount)  
router.route("/avatar").patch(verifyJwt , upload.single("avatar") , updateAvatar) //check
router.route('/coverimage').patch(verifyJwt , upload.single("coverImage"), updateCoverImage) //check
router.route("/c/:userName").get(verifyJwt , getUserChannelProfile) //check
router.route("/History").get(verifyJwt , getUserWatchHistory) //check

export default router
