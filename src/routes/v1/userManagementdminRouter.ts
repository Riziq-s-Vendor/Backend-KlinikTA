import { Router } from "express";
import { checkJwt } from '../../utils/checkJwt'
import {
    getUser,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    upload, 
    getDokter,
    getTotalAdmin,
    getTotalDokter,
    getTotalPetugas
}  from '../../controller/Admin/userManagment/userManagementAdminController';

const router = Router()

router.get('/getUser', [checkJwt,getUser])
router.get('/getTotalAdmin', [checkJwt,getTotalAdmin])
router.get('/getTotalDokter', [checkJwt,getTotalDokter])
router.get('/getTotalPetugas', [checkJwt,getTotalPetugas])
router.get('/getUserById/:id',[checkJwt,getUserById])
router.post('/createUser',upload.single('eTTD'),[checkJwt,createUser])
router.put('/updateUserById/:id',upload.single('eTTD'),[checkJwt,updateUser])
router.delete('/deleteUser/:id',[checkJwt,deleteUser])

router.get('/getDokter', [checkJwt, getDokter]);

export default router


