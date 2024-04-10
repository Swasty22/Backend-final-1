import { Router } from "express"

import {toggleSubscription,getUserChannelSubscribers,getSubscribedChannels} from "../controllers/subscription.controller.js"


import {verifyJwt} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:channelId").post(toggleSubscription);
router.route("/subscribedChannel").get(getSubscribedChannels)

router.route("/u/:channelId").get(getUserChannelSubscribers);

export default router