import { Router } from "express";
import { checkJwt } from '../../utils/checkJwt'
import {getPasien,getPasienById,createPasien,updatePasien,deletePasien}  from '../../controller/Pasien/pasienManagementController';

const router = Router()

router.get('/getPasien', [checkJwt,getPasien])
router.get('/getPasienById/:id',[checkJwt,getPasienById])
router.post('/createPasien',[checkJwt,createPasien])
router.put('/updatePasienById/:id',[checkJwt,updatePasien])
router.delete('/deletePasien/:id',[checkJwt,deletePasien])

export default router


