import { Router } from "express";
import { getAllLogActivities } from "../../controller/logActivityController";
import { checkJwt } from '../../utils/checkJwt'


const router = Router()
router.get('/get-log-activity', [checkJwt,getAllLogActivities])



export default router



