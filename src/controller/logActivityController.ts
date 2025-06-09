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
        const {limit : queryLimit, page: page, nomerRM,start_date,end_date} = req.query

       let startDate: Date | null = null;
       let endDate: Date | null = null;

       if (start_date) {
            startDate = new Date(start_date as string);
            if (isNaN(startDate.getTime())) {
                return res.status(400).json({ msg: 'Invalid start_date format. Expected YYYY-MM-DD.' });
            }
        }

        if (end_date) {
            endDate = new Date(end_date as string);
            if (isNaN(endDate.getTime())) {
                return res.status(400).json({ msg: 'Invalid end_date format. Expected YYYY-MM-DD.' });
            }
        } 

        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces) {
            return res.status(200).send(successResponse('User is Not Authorized', { data: userAcces }))
        }

        const queryBuilder = logActivityRepository.createQueryBuilder('logActivity')
        .orderBy('logActivity.createdAt','DESC')

        if(nomerRM) {
            queryBuilder.where('logActivity.nomerRM LIKE :nomerRM',{
                nomerRM : `%${nomerRM}%`
            })
        }

          // Apply date range filter if both start_date and end_date are provided
        if (startDate && endDate) {
            queryBuilder.andWhere(
                'logActivity.createdAt >= :startDate AND logActivity.createdAt <= :endDate',
                {
                    startDate,
                    endDate,
                }
            );
        }

        const dynamicLimit = queryLimit ? parseInt(queryLimit as string) : null;
        const currentPage = page ? parseInt(page as string) : 1; // Convert page to number, default to 1
        const skip = (currentPage - 1) * (dynamicLimit || 0);
    
        const [data, totalCount] = await queryBuilder
        .skip(skip)
        .take(dynamicLimit || undefined)
        .getManyAndCount();


        return res.status(200).send(successResponse('Get Log Activity Succes',
            { 
        
        data, 
        totalCount,
        currentPage,
        totalPages: Math.ceil(totalCount / (dynamicLimit || 1)), }, 200))
        
        }catch(error){
            res.status(500).json({ msg: error.message })    
        }
    }