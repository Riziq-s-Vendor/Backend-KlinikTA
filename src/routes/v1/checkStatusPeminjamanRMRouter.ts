import { Router } from "express";
import { checkRekamMedisStatus } from "../../controller/Pasien/Change status & message peminjaman rm/checkRekamMedisStstus";

const router = Router()


router.get('/check-rekam-medis-status', checkRekamMedisStatus);


export default router

