import { Router } from "express";
import { checkJwt } from '../../utils/checkJwt'
import {getRekamMedis,getRekamMedisById,createRekamMedis,updateRekamMedis,deleteRekamMedis}  from '../../controller/Pasien/riwayatPasiens';

const router = Router()

router.get('/getRekamMedis', [checkJwt,getRekamMedis])
router.get('/getRekamMedisById/:id',[checkJwt,getRekamMedisById])
router.post('/createRekamMedis',[checkJwt,createRekamMedis])
router.put('/updateRekamMedisById/:id',[checkJwt,updateRekamMedis])
router.delete('/deleteRekamMedis/:id',[checkJwt,deleteRekamMedis])

export default router


