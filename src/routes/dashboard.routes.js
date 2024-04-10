import { Router } from "express";
import { getChannelVideos , getChannelStats} from '../controllers/dashboard.controller.js'
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router  = Router()
router.use(verifyJwt)

router.route('/stats').get(getChannelStats)
router.route('/channelvideo').get(getChannelVideos)


export default router