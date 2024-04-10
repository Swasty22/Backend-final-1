import  {Router} from "express";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"


const router = Router()

router.use(verifyJwt , upload.none())//we are not accepting any files like images so using upload.none here
router.route("/:videoId").get(getVideoComments).post(addComment)

router.route("/c/:commentId").delete(deleteComment).patch(updateComment)

export default router   