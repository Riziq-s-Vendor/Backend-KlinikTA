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
 
        // Fetch all log activities
        const logEntries = await logActivityRepository.find();

        if (!logEntries || logEntries.length === 0) {
            return res.status(404).send(errorResponse('No log activities found', 404));
        }

        // Prepare an array to hold the detailed log activities
        const detailedLogActivities = await Promise.all(logEntries.map(async (logEntry) => {
            // Fetch user details by Petugas ID
            const user = await userRepository.findOne({ 
                where: { id: logEntry.Petugas } 
            });
            if (!user) return null;

            // Fetch riwayatPasien details by nomerRM
            const riwayatPasien = await riwayatPasienRepository.findOne({ 
                where: { id: logEntry.nomerRM } 
            });
            if (!riwayatPasien) return null;

            // Prepare the detailed log activity object
            return {
                logActivity: {
                    id: logEntry.id,
                    no: logEntry.no,
                    nomerRM: logEntry.nomerRM,
                    waktu: logEntry.waktu,
                    Petugas: logEntry.Petugas,
                    Dokter: logEntry.Dokter,
                    Aksi: logEntry.Aksi,
                    Deskripsi: logEntry.Deskripsi,
                    createdAt: logEntry.createdAt,
                    updatedAt: logEntry.updatedAt,
                    deletedAt: logEntry.deletedAt,
                },
                user: {
                    id: user.id,
                    nama: user.namaLengkap, // Assuming there is a 'nama' field in the User entity
                    role: user.role,
                },
                riwayatPasien: {
                    id: riwayatPasien.id,
                    namaPasien: riwayatPasien.Pasiens.namaLengkap, // Assuming there is a 'namaPasien' field in the RiwayatPasien entity
                    statusPeminjaman: riwayatPasien.statusPeminjaman,
                },
            };
        }));

        // Filter out any null entries (where user or riwayatPasien was not found)
        const filteredLogActivities = detailedLogActivities.filter(activity => activity !== null);

        return res.status(200).send(successResponse('Log activities retrieved successfully', { data: filteredLogActivities }));
    } catch (error) {
        console.error('Error fetching log activities:', error);
        return res.status(500).send(errorResponse('Internal server error', 500));
    }
};