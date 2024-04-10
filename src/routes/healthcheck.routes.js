import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { healthChecker } from "../controllers/healthcheck.controller.js";

const router = Router()

router.use(verifyJwt)

router.route('/').get(healthChecker)

export default router