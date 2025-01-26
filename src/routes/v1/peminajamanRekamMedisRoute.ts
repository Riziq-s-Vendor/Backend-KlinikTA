import { Router } from "express";
import { checkJwt } from '../../utils/checkJwt'
import {getPeminjamanRekamMedis,getPeminjamanRekamMedisById,createPeminjamanRekamMedis,updatePeminjamanRekamMedis,updateStatusPeminjamanRekamMedis,deletePeminjamanRekamMedis}  from '../../controller/Pasien/peminjamanRekamMedisController';

const router = Router()

router.get('/getPeminjamanRekamMedis', [checkJwt,getPeminjamanRekamMedis])
router.get('/getPeminjamanRekamMedisById/:id',[checkJwt,getPeminjamanRekamMedisById])
router.post('/createPeminjamanRekamMedis',[checkJwt,createPeminjamanRekamMedis])
router.put('/updatePeminjamanRekamMedisById/:id',[checkJwt,updatePeminjamanRekamMedis])
router.put('/updateStatusPeminjamanRekamMedis/:id',[checkJwt,updateStatusPeminjamanRekamMedis])
router.delete('/deletePeminjamanRekamMedis/:id',[checkJwt,deletePeminjamanRekamMedis])

export default router

