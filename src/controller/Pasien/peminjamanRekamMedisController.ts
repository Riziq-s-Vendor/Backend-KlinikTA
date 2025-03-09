import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import Joi, { equal, required, string } from "joi";
import { User,UserRole } from "../../model/User";
import { RiwayatPasien,StatusRM } from "../../model/RiwayatPasien";
import { peminjamanRekamMedis } from "../../model/peminjamanRekamMedis";
import { Pasien } from "../../model/Pasien";
import { logActivity } from "../../model/logActivity";
const { successResponse, errorResponse, validationResponse } = require('../../utils/response')


const userRepository = AppDataSource.getRepository(User);
const riwayatPasienRepository = AppDataSource.getRepository(RiwayatPasien);
const peminjamanRekamMedisRepository = AppDataSource.getRepository(peminjamanRekamMedis)
const pasienRepository = AppDataSource.getRepository(Pasien);
const logActivityRepository = AppDataSource.getRepository(logActivity)





export const getPeminjamanRekamMedis = async (req: Request, res: Response) => {    
    try {    
        const { limit: queryLimit, page, status, search } = req.query;    
    
        const queryBuilder = peminjamanRekamMedisRepository.createQueryBuilder("peminjaman")    
            .leftJoinAndSelect("peminjaman.Dokters", "dokter")    
            .leftJoinAndSelect("peminjaman.RiwayatPasiens", "riwayatPasien")
            .leftJoinAndSelect("riwayatPasien.Pasiens", "Pasien")
            .orderBy("peminjaman.createdAt", "DESC");    
    
        // status berdasarkan status peminjaman    
        if (status) {    
    queryBuilder.andWhere("riwayatPasien.statusPeminjaman = :status", { status });    
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
                id : peminjaman.id,  
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

export const CountPeminjamanRekamMedisByStatusDipinjam = async (req: Request, res: Response) => {
    try {


        const total = await peminjamanRekamMedisRepository.createQueryBuilder("peminjaman")
            .leftJoinAndSelect("peminjaman.Dokters", "dokter")
            .leftJoinAndSelect("peminjaman.RiwayatPasiens", "riwayatPasien")
            .leftJoinAndSelect("riwayatPasien.Pasiens", "Pasien")
            .where("riwayatPasien.statusPeminjaman = :status", { status: StatusRM.DIPINJAM }) // Menggunakan enum StatusRM
            .getCount();


            return res.status(200).json({
                message: 'Total data Rekam Medis dengan Status di pinjam',
                total
            });    
        } catch (error) {
        console.error("Error counting peminjaman rekam medis:", error);
        return res.status(500).json({ message: "Terjadi kesalahan saat menghitung peminjaman rekam medis." });
    }
};

export const CountPeminjamanRekamMedisByStatusTerlamabat = async (req: Request, res: Response) => {
    try {


        const total = await peminjamanRekamMedisRepository.createQueryBuilder("peminjaman")
            .leftJoinAndSelect("peminjaman.Dokters", "dokter")
            .leftJoinAndSelect("peminjaman.RiwayatPasiens", "riwayatPasien")
            .leftJoinAndSelect("riwayatPasien.Pasiens", "Pasien")
            .where("riwayatPasien.statusPeminjaman = :status", { status: StatusRM.TERLAMBATDIKEMBALIKAN }) // Menggunakan enum StatusRM
            .getCount();


            return res.status(200).json({
                message: 'Total data Rekam Medis dengan Status di Terlambat Di Kembalikan',
                total
            });    
        } catch (error) {
        console.error("Error counting peminjaman rekam medis:", error);
        return res.status(500).json({ message: "Terjadi kesalahan saat menghitung peminjaman rekam medis." });
    }
};


  
export const getPeminjamanRekamMedisById = async (req: Request, res: Response) => {  
    try {  
        const id = req.params.id;  
  
        // Cek akses pengguna yang sedang login  
        const userAccess = await userRepository.findOneBy({ id: req.jwtPayload.id });  
  
        // if (!userAccess || (userAccess.role !== 'PETUGAS' && userAccess.role !== 'ADMIN')) {  
        //     return res.status(403).send(errorResponse('Access Denied: Only PETUGAS and ADMIN can access this resource', 403));  
        // }  
        if (!userAccess) {
            return res.status(200).send(successResponse('User is Not Authorized', { data: userAccess }))
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

        peminjaman.Dokters.eTTD = peminjaman.Dokters.eTTD?`${peminjaman.Dokters.eTTD.replace(/\\/g, '/')}` : null; 
  
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
        // const schema = createPeminjamanRekamMedisSchema(req.body)
        
        // if ('error' in schema) {
        //     return res.status(422).send(validationResponse(schema))
        // }

    const user = await userRepository.findOneBy({ id: req.jwtPayload.id})

       // Validasi role pengguna yang sedang login  
    // if (!user || user.role == 'DOKTER') {  
    //     return res.status(403).send(errorResponse('Access Denied: Only PETUGAS and ADMIN can create Peminjaman Rekam Medis', 403));  
    // }  

    if (!user) {
        return res.status(200).send(successResponse('User is Not Authorized', { data: user }))
    }

    const getNameByLogin =  await userRepository.findOneBy({namaLengkap : user.namaLengkap})

    const dokter = await userRepository.findOneBy({ id: body.Dokter, role: UserRole.DOKTER });  
    if (!dokter) {  
        return res.status(422).send(errorResponse('Invalid Dokter ID: Dokter not found', 422));  
    } 

    const RiwayatPasien = await riwayatPasienRepository.findOne({
        where: { id: body.RekamMedis },
        relations: { // This line is crucial
            Pasiens: true // Include the Pasiens relation
        }
    });

    if (!RiwayatPasien) {  
        return res.status(422).send(errorResponse('Invalid Rekam Medis Pasien ID: Rekam Medis Pasien not found', 422));  
    } 

    const checkStatusRM = await riwayatPasienRepository.findOneBy({statusPeminjaman : StatusRM.TERSEDIA})
    if (!checkStatusRM) {
        return res.status(422).send(errorResponse('Invalid Peminajaman Rekam Medis : Rekam Medis Belum di kemablikan atau Di Pinjam', 422));  
    }


    const maxNoLog = await logActivityRepository
    .createQueryBuilder("logActivity")
    .select("MAX(logActivity.no)", "max")
    .getRawOne();

    // Hitung nomer berikutnya
    const nextNo = (maxNoLog?.max || 0) + 1;


        const newPeminjamanRekamMedis = new peminjamanRekamMedis()
        newPeminjamanRekamMedis.alasanPeminjaman = body.alasanPeminjaman
        newPeminjamanRekamMedis.tanggalDikembalikan = body.tanggalDikembalikan
        newPeminjamanRekamMedis.RiwayatPasiens = RiwayatPasien
        newPeminjamanRekamMedis.Dokters = dokter
        await peminjamanRekamMedisRepository.save(newPeminjamanRekamMedis)

        RiwayatPasien.statusPeminjaman = StatusRM.DIPINJAM; // Assuming StatusRM.DIPINJAM is the status for borrowed medical records
        await riwayatPasienRepository.save(RiwayatPasien);



        const newActivityLogOnCreatePeminjamanRekamMedis = new logActivity();
        newActivityLogOnCreatePeminjamanRekamMedis.no = nextNo;
        newActivityLogOnCreatePeminjamanRekamMedis.nomerRM = newPeminjamanRekamMedis.RiwayatPasiens.Pasiens.nomerRM; // Assuming the medical record number is the ID of RiwayatPasiens
        newActivityLogOnCreatePeminjamanRekamMedis.waktu = new Date(); // Current time
        newActivityLogOnCreatePeminjamanRekamMedis.Petugas = user.namaLengkap || "Unknown User"; // Handle potential null/undefined
        newActivityLogOnCreatePeminjamanRekamMedis.Dokter = newPeminjamanRekamMedis.Dokters.namaLengkap;
        newActivityLogOnCreatePeminjamanRekamMedis.Aksi = "MEMINJAM";
        newActivityLogOnCreatePeminjamanRekamMedis.Deskripsi = `Dokter ${dokter.namaLengkap} meminjam rekam medis nomor ${newPeminjamanRekamMedis.RiwayatPasiens.Pasiens.nomerRM} untuk keperluan ${body.alasanPeminjaman}`;

        await logActivityRepository.save(newActivityLogOnCreatePeminjamanRekamMedis);


        


        console.log(newPeminjamanRekamMedis)
        return res.status(200).send(successResponse("Create Peminjaman Rekam Medis Success", { data: newPeminjamanRekamMedis,newActivityLogOnCreatePeminjamanRekamMedis }, 200))

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
        // const schema = updateStatusPeminjamanRekamMedisSchema(req.body)
        const id = req.params.id;


        // if ('error' in schema) {
        //     return res.status(422).send(validationResponse(schema))
        // }

    const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

       // Validasi role pengguna yang sedang login  
    // if (!user || (user.role !== 'PETUGAS' && user.role !== 'ADMIN')) {  
    //     return res.status(403).send(errorResponse('Access Denied: Only PETUGAS and ADMIN can create users', 403));  
    // }  

    if (!user) {  
        return res.status(403).send(errorResponse('Access Denied: Only PETUGAS and ADMIN can create users', 403));  
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
        // const schema = updatePeminjamanRekamMedisSchema(req.body)
        const id = req.params.id;

        
        // if ('error' in schema) {
        //     return res.status(422).send(validationResponse(schema))
        // }

    const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

       // Validasi role pengguna yang sedang login  
    // if (!user || (user.role !== 'PETUGAS' && user.role !== 'ADMIN')) {  
    //     return res.status(403).send(errorResponse('Access Denied: Only PETUGAS abd ADMIN can create users', 403));  
    // }  

    if (!user){  
        return res.status(403).send(errorResponse('Access Denied: user is not authorized', 403));  
    }  


    const dokter = await userRepository.findOneBy({ id: body.Dokter, role: UserRole.DOKTER });  
    if (!dokter) {  
        return res.status(422).send(errorResponse('Invalid Dokter ID: Dokter not found', 422));  
    } 

    const Riwayatpasien = await riwayatPasienRepository.findOne({ 
       where :  {id: body.RekamMedis} ,
       relations : ['Pasiens']
        
    
    });  
    if (!RiwayatPasien) {  
        return res.status(422).send(errorResponse('Invalid Rekam Medis Pasien ID: Rekam Medis Pasien not found', 422));  
    } 

    const checkStatusRM = await riwayatPasienRepository.findOneBy({statusPeminjaman : StatusRM.TERSEDIA})
    if (!checkStatusRM) {
        return res.status(422).send(errorResponse('Invalid Peminajaman Rekam Medis : Rekam Medis Belum di kemablikan atau Di Pinjam', 422));  
    }


    const maxNoLog = await logActivityRepository
    .createQueryBuilder("logActivity")
    .select("MAX(logActivity.no)", "max")
    .getRawOne();

    // Hitung nomer berikutnya
    const nextNo = (maxNoLog?.max || 0) + 1;

        const updatePeminjamanRekamMedis = await peminjamanRekamMedisRepository.findOneBy({id})
        updatePeminjamanRekamMedis.alasanPeminjaman = body.alasanPeminjaman
        updatePeminjamanRekamMedis.tanggalDikembalikan = body.tanggalDikembalikan
        updatePeminjamanRekamMedis.RiwayatPasiens = Riwayatpasien
        updatePeminjamanRekamMedis.Dokters = dokter
        
        await peminjamanRekamMedisRepository.save(updatePeminjamanRekamMedis)

        const newLogActivityOnUpdatePeminjamanRekamMedis = new logActivity();
        newLogActivityOnUpdatePeminjamanRekamMedis.no = nextNo;
        newLogActivityOnUpdatePeminjamanRekamMedis.nomerRM = updatePeminjamanRekamMedis.RiwayatPasiens.Pasiens.nomerRM; // Assuming the medical record number is the ID of RiwayatPasiens
        newLogActivityOnUpdatePeminjamanRekamMedis.waktu = new Date(); // Current time
        newLogActivityOnUpdatePeminjamanRekamMedis.Petugas = user.namaLengkap || "Unknown User"; // Handle potential null/undefined
        newLogActivityOnUpdatePeminjamanRekamMedis.Dokter = updatePeminjamanRekamMedis.Dokters.namaLengkap;
        newLogActivityOnUpdatePeminjamanRekamMedis.Aksi = "MEMINJAM";
        newLogActivityOnUpdatePeminjamanRekamMedis.Deskripsi = `Dokter ${dokter.namaLengkap} meminjam rekam medis nomor ${updatePeminjamanRekamMedis.RiwayatPasiens.Pasiens.nomerRM} untuk keperluan ${body.alasanPeminjaman}`;

        await logActivityRepository.save(newLogActivityOnUpdatePeminjamanRekamMedis);
        console.log(updatePeminjamanRekamMedis)
        return res.status(200).send(successResponse("update Peminjaman Rekam Medis Success", { data: updatePeminjamanRekamMedis,newLogActivityOnUpdatePeminjamanRekamMedis }, 200))

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



