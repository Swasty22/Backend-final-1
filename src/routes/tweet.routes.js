import { Router } from "express";
import  { createTweet, getUserTweet, updateTweet , deleteTweet } from "../controllers/tweet.controller.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJwt)
router.route("/").post(createTweet);
router.route("/:userId").get(getUserTweet);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);
 

export default router