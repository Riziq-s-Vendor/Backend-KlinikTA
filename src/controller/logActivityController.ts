import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import Joi, { equal, required, string } from "joi";
import { User,UserRole } from "../model/User";
import { RiwayatPasien,StatusRM } from "../model/RiwayatPasien";
import { peminjamanRekamMedis } from "../model/peminjamanRekamMedis";
import { Pasien } from "../model/Pasien";
import { logActivity } from "../model/logActivity";
const { successResponse, errorResponse, validationResponse } = require('../utils/response')


const userRepository = AppDataSource.getRepository(User);
const riwayatPasienRepository = AppDataSource.getRepository(RiwayatPasien);
const peminjamanRekamMedisRepository = AppDataSource.getRepository(peminjamanRekamMedis)
const pasienRepository = AppDataSource.getRepository(Pasien);
const logActivityRepository = AppDataSource.getRepository(logActivity)


export const getAllLogActivities = async (req: Request, res: Response) => {
    try {
        const logActivities = await logActivityRepository.find({
            // relations : ['logPetugas']
        });
        return res.status(200).send(successResponse({data : logActivities}, 'Successfully retrieved all log activities'));
    } catch (error) {
        console.error('Error fetching log activities:', error);
        return res.status(500).send(errorResponse('Internal server error', 500));
    }
};