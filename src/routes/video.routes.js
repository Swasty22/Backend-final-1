import { Router } from 'express';
import {getAllVideos , publishVideo , getVideoById , updateVideo ,deleteVideo , togglePublishStatus}
from '../controllers/video.controller.js'
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from '../middlewares/multer.middleware.js';

const router = Router()

router.route('/').get(getAllVideos).post(verifyJwt , upload.fields(
    [
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbNail",
            maxCount:1
        }
    ]
    ),publishVideo
 )


 router.route('/v/:videoId').get(verifyJwt , getVideoById)
 .patch(verifyJwt , upload.single("thumbNail") , updateVideo)
 .delete(verifyJwt , deleteVideo)
 router.route("/toggle/publish/:videoId")
 .patch(verifyJwt, togglePublishStatus);

export default router

 