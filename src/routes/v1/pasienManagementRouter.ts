import { Router } from "express";
import { checkJwt } from '../../utils/checkJwt'
import {
    getPasien,getPasienById,
    createPasien,updatePasien,
    deletePasien,
    CountPasien
}  from '../../controller/Pasien/pasienManagementController';

const router = Router()

router.get('/getPasien', [checkJwt,getPasien])
router.get('/countPasien', [checkJwt,CountPasien])
router.get('/getPasienById/:id',[checkJwt,getPasienById])
router.post('/createPasien',[checkJwt,createPasien])
router.put('/updatePasienById/:id',[checkJwt,updatePasien])
router.delete('/deletePasien/:id',[checkJwt,deletePasien])

export default router


