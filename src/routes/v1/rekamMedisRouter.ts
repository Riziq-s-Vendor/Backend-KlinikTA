import { Router } from "express";
import { checkJwt } from '../../utils/checkJwt'
import {
    getRekamMedis,
    getRekamMedisById,
    getDokterAndPasienById,
    createRekamMedis,updateRekamMedis,
    deleteRekamMedis,
    analyzeRekamMedis,
    countIncompleteRekamMedis

}  from '../../controller/Pasien/riwayatPasiens';

const router = Router()

router.get('/analisis-rekam-medis', [checkJwt,analyzeRekamMedis])
router.get('/count-analisis-rekam-medis', [checkJwt,countIncompleteRekamMedis])
router.get('/getRekamMedis', [checkJwt,getRekamMedis])
router.get('/getRekamMedisById/:id',[checkJwt,getRekamMedisById])
router.get('/dokter-pasien/:dokterId/:pasienId', getDokterAndPasienById);
router.post('/createRekamMedis',[checkJwt,createRekamMedis])
router.put('/updateRekamMedisById/:id',[checkJwt,updateRekamMedis])
router.delete('/deleteRekamMedis/:id',[checkJwt,deleteRekamMedis])


export default router


