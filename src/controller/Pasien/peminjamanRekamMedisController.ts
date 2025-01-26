import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import Joi, { equal, required, string } from "joi";
import { User,UserRole } from "../../model/User";
import { RiwayatPasien,StatusRM } from "../../model/RiwayatPasien";
import { peminjamanRekamMedis } from "../../model/peminjamanRekamMedis";
import { Pasien } from "../../model/Pasien";
const { successResponse, errorResponse, validationResponse } = require('../../utils/response')


const userRepository = AppDataSource.getRepository(User);
const riwayatPasienRepository = AppDataSource.getRepository(RiwayatPasien);
const peminjamanRekamMedisRepository = AppDataSource.getRepository(peminjamanRekamMedis)
const pasienRepository = AppDataSource.getRepository(Pasien);





export const getPeminjamanRekamMedis = async (req: Request, res: Response) => {    
    try {    
        const { limit: queryLimit, page, filter, search } = req.query;    
    
        const queryBuilder = peminjamanRekamMedisRepository.createQueryBuilder("peminjaman")    
            .leftJoinAndSelect("peminjaman.Dokters", "dokter")    
            .leftJoinAndSelect("peminjaman.RiwayatPasiens", "riwayatPasien")
            .leftJoinAndSelect("riwayatPasien.Pasiens", "Pasien")
            .orderBy("peminjaman.createdAt", "DESC");    
    
        // Filter berdasarkan status peminjaman    
        if (filter) {    
            queryBuilder.where("peminjaman.statusPeminjaman = :filter", { filter });    
        }    
    
        // Search berdasarkan nama pasien atau no RM pasien    
        if (search) {    
            queryBuilder.andWhere("riwayatPasien.namaPasien LIKE :search OR riwayatPasien.nomerRM LIKE :search", {    
                search: `%${search}%`    
            });    
        }    
    
        const dynamicLimit = queryLimit ? parseInt(queryLimit as string) : null;    
        const currentPage = page ? parseInt(page as string) : 1; // Convert page to number, default to 1    
        const skip = (currentPage - 1) * (dynamicLimit || 0);    
    
        const [data, totalCount] = await queryBuilder    
            .skip(skip)    
            .take(dynamicLimit || undefined)    
            .getManyAndCount();    
    
        // Memetakan data untuk format yang diinginkan  
        const modifiedData = data.map((peminjaman, index) => {    
            return {    
                No: index + 1, // Menambahkan nomor urut    
                NamaPasien: peminjaman.RiwayatPasiens.Pasiens.namaPasien, // Ganti dengan field yang sesuai    
                NoRMPasien: peminjaman.RiwayatPasiens.Pasiens.nomerRM, // Ganti dengan field yang sesuai    
                TanggalBerobat: peminjaman.tanggalDikembalikan, // Sesuaikan jika ada field lain    
                DiagnosaAkhir: peminjaman.RiwayatPasiens.diagnosaAkhir, // Sesuaikan jika ada field lain    
                Pengobatan: peminjaman.alasanPeminjaman, // Sesuaikan jika ada field lain    
                KeadaanWaktuKeluarRS: peminjaman.RiwayatPasiens.keadaanKeluarRS, // Sesuaikan jika ada field lain    
                StatusPeminjaman: peminjaman.RiwayatPasiens.statusPeminjaman, // Sesuaikan jika ada field lain    
            };    
        });    
    
        return res.status(200).send(successResponse('Get Peminjaman Rekam Medis Success', {    
            data: modifiedData,    
            totalCount,    
            currentPage,    
            totalPages: Math.ceil(totalCount / (dynamicLimit || 1)),    
        }, 200));    
    
    } catch (error) {    
        return res.status(500).json({ msg: error.message });    
    }    
};  


  
export const getPeminjamanRekamMedisById = async (req: Request, res: Response) => {  
    try {  
        const id = req.params.id;  
  
        // Cek akses pengguna yang sedang login  
        const userAccess = await userRepository.findOneBy({ id: req.jwtPayload.id });  
  
        if (!userAccess || userAccess.role !== 'PETUGAS') {  
            return res.status(403).send(errorResponse('Access Denied: Only PETUGAS can access this resource', 403));  
        }  
  
        // Mencari peminjaman rekam medis berdasarkan ID  
        const peminjaman = await peminjamanRekamMedisRepository.findOne({  
            where: { id: id },  
            relations: ["Dokters", "RiwayatPasiens"], // Menyertakan relasi yang diperlukan  
        });  
  
        // Jika peminjaman tidak ditemukan  
        if (!peminjaman) {  
            return res.status(404).send(errorResponse('Peminjaman Rekam Medis not found', 404));  
        }  
  
        return res.status(200).send(successResponse("Get Peminjaman Rekam Medis by ID Success", { data: peminjaman }, 200));  
  
    } catch (error) {  
        return res.status(500).send(errorResponse(error.message, 500));  
    }  
};  


export const createPeminjamanRekamMedis = async (req : Request, res: Response) =>{
    const createPeminjamanRekamMedisSchema = (input) => Joi.object({
        alasanPeminjaman : Joi.string().required(),
        tanggalDikembalikan : Joi.date().required(),
        Dokter : Joi.string().required(),
        RekamMedis : Joi.string().required(),


    }).validate(input);

    try {
        const body = req.body
        const schema = createPeminjamanRekamMedisSchema(req.body)
        
        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema))
        }

    const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

       // Validasi role pengguna yang sedang login  
    if (!user || user.role !== 'PETUGAS') {  
        return res.status(403).send(errorResponse('Access Denied: Only PETUGAS can create Peminjaman Rekam Medis', 403));  
    }  

    const dokter = await userRepository.findOneBy({ id: body.Dokter, role: UserRole.DOKTER });  
    if (!dokter) {  
        return res.status(422).send(errorResponse('Invalid Dokter ID: Dokter not found', 422));  
    } 

    const RiwayatPasien = await riwayatPasienRepository.findOneBy({ id: body.RekamMedis });  
    if (!RiwayatPasien) {  
        return res.status(422).send(errorResponse('Invalid Rekam Medis Pasien ID: Rekam Medis Pasien not found', 422));  
    } 

    const checkStatusRM = await riwayatPasienRepository.findOneBy({statusPeminjaman : StatusRM.TERSEDIA})
    if (!checkStatusRM) {
        return res.status(422).send(errorResponse('Invalid Peminajaman Rekam Medis : Rekam Medis Belum di kemablikan atau Di Pinjam', 422));  
    }
        const newPeminjamanRekamMedis = new peminjamanRekamMedis()
        newPeminjamanRekamMedis.alasanPeminjaman = body.alasanPeminjaman
        newPeminjamanRekamMedis.tanggalDikembalikan = body.tanggalDikembalikan
        newPeminjamanRekamMedis.RiwayatPasiens = RiwayatPasien
        newPeminjamanRekamMedis.Dokters = dokter
        
        await peminjamanRekamMedisRepository.save(newPeminjamanRekamMedis)

        console.log(newPeminjamanRekamMedis)
        return res.status(200).send(successResponse("Create Peminjaman Rekam Medis Success", { data: newPeminjamanRekamMedis }, 200))

    }catch(error){
        res.status(500).json({ msg: error.message })
    }
}

export const updateStatusPeminjamanRekamMedis = async (req : Request, res: Response) =>{
    const updateStatusPeminjamanRekamMedisSchema = (input) => Joi.object({
        status : Joi.string().required(),
    }).validate(input);

    try {
        const body = req.body
        const schema = updateStatusPeminjamanRekamMedisSchema(req.body)
        const id = req.params.id;


        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema))
        }

    const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

       // Validasi role pengguna yang sedang login  
    if (!user || user.role !== 'PETUGAS') {  
        return res.status(403).send(errorResponse('Access Denied: Only PETUGAS can create users', 403));  
    }  

        const updateStatusRM = await riwayatPasienRepository.findOneBy({id})

        updateStatusRM.statusPeminjaman = body.status

        await riwayatPasienRepository.save(updateStatusRM)
        console.log(updateStatusRM)
        return res.status(200).send(successResponse("Update Status Peminjaman Rekam Medis Success", { data: updateStatusRM }, 200))

    }catch(error){
        res.status(500).json({ msg: error.message })
    }
}







export const updatePeminjamanRekamMedis = async (req : Request, res: Response) =>{
    const updatePeminjamanRekamMedisSchema = (input) => Joi.object({
        alasanPeminjaman : Joi.string().required(),
        tanggalDikembalikan : Joi.date().required(),
        Dokter : Joi.string().required(),
        RekamMedis : Joi.string().required(),


    }).validate(input);

    try {
        const body = req.body
        const schema = updatePeminjamanRekamMedisSchema(req.body)
        const id = req.params.id;

        
        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema))
        }

    const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

       // Validasi role pengguna yang sedang login  
    if (!user || user.role !== 'PETUGAS') {  
        return res.status(403).send(errorResponse('Access Denied: Only PETUGAS can create users', 403));  
    }  

    const dokter = await userRepository.findOneBy({ id: body.Dokter, role: UserRole.DOKTER });  
    if (!dokter) {  
        return res.status(422).send(errorResponse('Invalid Dokter ID: Dokter not found', 422));  
    } 

    const Riwayatpasien = await riwayatPasienRepository.findOneBy({ id: body.RekamMedis });  
    if (!RiwayatPasien) {  
        return res.status(422).send(errorResponse('Invalid Rekam Medis Pasien ID: Rekam Medis Pasien not found', 422));  
    } 

    const checkStatusRM = await riwayatPasienRepository.findOneBy({statusPeminjaman : StatusRM.TERSEDIA})
    if (!checkStatusRM) {
        return res.status(422).send(errorResponse('Invalid Peminajaman Rekam Medis : Rekam Medis Belum di kemablikan atau Di Pinjam', 422));  
    }
        const updatePeminjamanRekamMedis = await peminjamanRekamMedisRepository.findOneBy({id})
        updatePeminjamanRekamMedis.alasanPeminjaman = body.alasanPeminjaman
        updatePeminjamanRekamMedis.tanggalDikembalikan = body.tanggalDikembalikan
        updatePeminjamanRekamMedis.RiwayatPasiens = Riwayatpasien
        updatePeminjamanRekamMedis.Dokters = dokter
        
        await peminjamanRekamMedisRepository.save(updatePeminjamanRekamMedis)

        console.log(updatePeminjamanRekamMedis)
        return res.status(200).send(successResponse("update Peminjaman Rekam Medis Success", { data: updatePeminjamanRekamMedis }, 200))

    }catch(error){
        res.status(500).json({ msg: error.message })
    }
}




export const deletePeminjamanRekamMedis = async (req: Request, res: Response) => {
    try {

        
        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces) {
            return res.status(200).send(successResponse('User is Not Authorized', { data: userAcces }))
        }

        const peminjamanRM = await peminjamanRekamMedisRepository.findOneBy({ id: String(req.params.id) })
        if (!peminjamanRM) {
            return res.status(404).send(errorResponse('User not found', 404))
        }

        const deletedPeminjamanRM = await peminjamanRekamMedisRepository.remove(peminjamanRM)



        return res.status(200).send(successResponse('Success delete Peminjaman Rekam Medis', { data: peminjamanRM }, 200))
    } catch (error) {
        return res.status(400).send(errorResponse(error, 400))
    }
}



