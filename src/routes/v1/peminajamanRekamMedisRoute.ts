import { Router } from "express";
import { checkJwt } from '../../utils/checkJwt'
import {getPeminjamanRekamMedis,
        getPeminjamanRekamMedisById,
        CountPeminjamanRekamMedisByStatusDipinjam,
        CountPeminjamanRekamMedisByStatusTerlamabat,
        createPeminjamanRekamMedis,
        updatePeminjamanRekamMedis,
        updateStatusPeminjamanRekamMedis,
        deletePeminjamanRekamMedis}  from '../../controller/Pasien/peminjamanRekamMedisController';
import { checkRekamMedisStatus } from "../../controller/Pasien/Change status & message peminjaman rm/checkRekamMedisStstus";

const router = Router()

router.get('/getPeminjamanRekamMedis', [checkJwt,getPeminjamanRekamMedis])
router.get('/countPeminjamanRekamMedisDipinjam', [checkJwt,CountPeminjamanRekamMedisByStatusDipinjam])
router.get('/countPeminjamanRekamMedisTerlamabat', [checkJwt,CountPeminjamanRekamMedisByStatusTerlamabat])
router.get('/getPeminjamanRekamMedisById/:id',[checkJwt,getPeminjamanRekamMedisById])
router.post('/createPeminjamanRekamMedis',[checkJwt,createPeminjamanRekamMedis])
router.put('/updatePeminjamanRekamMedisById/:id',[checkJwt,updatePeminjamanRekamMedis])
router.put('/updateStatusPeminjamanRekamMedis/:id',[checkJwt,updateStatusPeminjamanRekamMedis])
router.delete('/deletePeminjamanRekamMedis/:id',[checkJwt,deletePeminjamanRekamMedis])

router.get('/check-rekam-medis-status', [checkJwt,checkRekamMedisStatus]);


export default router

