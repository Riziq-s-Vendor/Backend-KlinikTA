import { Router } from "express";
import { checkJwt } from '../../utils/checkJwt'
import {getUser,getUserById,createUser,updateUser,deleteUser}  from '../../controller/Admin/userManagment/userManagementAdminController';

const router = Router()

router.get('/getUser', [checkJwt,getUser])
router.get('/getUserById/:id',[checkJwt,getUserById])
router.post('/createUser',[checkJwt,createUser])
router.put('/updateUserById/:id',[checkJwt,updateUser])
router.delete('/deleteUser/:id',[checkJwt,deleteUser])

export default router


