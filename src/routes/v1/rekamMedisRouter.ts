import { Router } from "express";
import { checkJwt } from '../../utils/checkJwt'
import {
    getRekamMedis,
    CountRekamMedis,
    getRekamMedisById,
    getDokterAndPasienById,
    createRekamMedis,updateRekamMedis,
    deleteRekamMedis,
    analyzeRekamMedis,
    countIncompleteRekamMedis,
    checkCompleteRekamMedis,
    countCompleteRekamMedis

}  from '../../controller/Pasien/riwayatPasiens';
import { countReset } from "console";

const router = Router()

router.get('/analisis-rekam-medis', [checkJwt,analyzeRekamMedis])
router.get('/count-analisis-rekam-medis', [checkJwt,countIncompleteRekamMedis])
router.get('/complete-analisis-rekam-medis', [checkJwt,checkCompleteRekamMedis])
router.get('/count-complete-analisis-rekam-medis', [checkJwt,countCompleteRekamMedis])
router.get('/getRekamMedis', [checkJwt,getRekamMedis])
router.get('/count-rekam-medis', [checkJwt,CountRekamMedis])
router.get('/getRekamMedisById/:id',[checkJwt,getRekamMedisById])
router.get('/dokter-pasien/:dokterId/:pasienId', getDokterAndPasienById);
router.post('/createRekamMedis',[checkJwt,createRekamMedis])
router.put('/updateRekamMedisById/:id',[checkJwt,updateRekamMedis])
router.delete('/deleteRekamMedis/:id',[checkJwt,deleteRekamMedis])


export default router


