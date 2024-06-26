import { Router } from "express";
import  { createPlaylist ,
    addVideoToPlaylist , 
    getUserPlaylistById , 
    removeVideoFromPlaylist ,
   updatePlaylist,
   deletePlaylist,
   getUserPlaylist
} from "../controllers/playlist.controller.js"

import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJwt)
router.route("/").post(createPlaylist)

router
    .route("/:playlistId")
    .get(getUserPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylist);


export default router