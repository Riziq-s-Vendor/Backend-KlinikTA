import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import Joi, { equal, required, string } from "joi";
import { User,UserRole } from "../../model/User";
import { RiwayatPasien,StatusRM } from "../../model/RiwayatPasien";
import { peminjamanRekamMedis } from "../../model/peminjamanRekamMedis";
import { Pasien } from "../../model/Pasien";
const { successResponse, errorResponse, validationResponse } = require('../../utils/response')
import { logActivity } from "../../model/logActivity";



const userRepository = AppDataSource.getRepository(User);
const riwayatPasienRepository = AppDataSource.getRepository(RiwayatPasien);
const peminjamanRekamMedisRepository = AppDataSource.getRepository(peminjamanRekamMedis)
const pasienRepository = AppDataSource.getRepository(Pasien);
const logActivityRepository = AppDataSource.getRepository(logActivity)






export const getPeminjamanRekamMedis = async (req: Request, res: Response) => {    
    try {    
        const { limit: queryLimit, page, status, search,start_date,end_date } = req.query;   

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
            queryBuilder.andWhere("riwayatPasien.namaLengkap LIKE :search OR riwayatPasien.nomerRM LIKE :search", {    
                search: `%${search}%`    
            });    
        } 
          // Apply date range filter if both start_date and end_date are provided
        if (startDate && endDate) {
            queryBuilder.andWhere(
                'peminjaman.createdAt >= :startDate AND peminjaman.createdAt <= :endDate',
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
    
        // Memetakan data untuk format yang diinginkan  
        const modifiedData = data.map((peminjaman, index) => {    
            return {  
                id : peminjaman.id,  
                No: index + 1, // Menambahkan nomor urut    
                NamaPasien: peminjaman.RiwayatPasiens.Pasiens.namaLengkap,     
                NoRMPasien: peminjaman.RiwayatPasiens.Pasiens.nomerRM,     
                tanggalPeminjaman : peminjaman.tanggalPeminjaman,
                tanggalDikembalikan: peminjaman.tanggalDikembalikan,     
                // DiagnosaAkhir: peminjaman.RiwayatPasiens.diagnosaAkhir, // sementara di komen menunggu mau di ganti dengan data apa     
                Pengobatan: peminjaman.alasanPeminjaman,     
                // KeadaanWaktuKeluarRS: peminjaman.RiwayatPasiens.keadaanKeluarRS, // sementara di komen menunggu mau di ganti dengan data apa 
                StatusPeminjaman: peminjaman.RiwayatPasiens.statusPeminjaman, 
                idRekamMedis : peminjaman.RiwayatPasiens.id,
                subjektif : peminjaman.RiwayatPasiens.subjektif,
                diagnosaPenyakit : peminjaman.RiwayatPasiens.diagnosaPenyakit,
                // keluhan : peminjaman.RiwayatPasiens.keluhan
                




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
            relations: ["Dokters", "RiwayatPasiens","RiwayatPasiens.Pasiens"], // Menyertakan relasi yang diperlukan  
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


export const createPasien = async (req: Request, res: Response) => {
    const createPasienSchema = (input) => Joi.object({
        namaPasien: Joi.string().required(),
        namaLengkap: Joi.string().required(),
        jenisKelamin: Joi.string().required(),
        tanggalLahir: Joi.date().required(),
        tempatLahir: Joi.string().required(),
        noBPJS_KIS: Joi.string().required(),
        kecamatan: Joi.string().optional(),
        kelurahan_desa: Joi.string().required(),
        kabupaten: Joi.string().required(),
        riwayatAlergi: Joi.string().required(),
        riwayatPenyakit: Joi.string().required(),
        NIK: Joi.string().required(),
        usia: Joi.number().required(),
        kodeWilayah: Joi.string().required(),
        
    }).validate(input);

    try {
        const body = req.body;
        // const schema = createPasienSchema(req.body);

        // console.log(req.body);  


        // if ('error' in schema) {
        //     return res.status(422).send(validationResponse(schema));
        // }

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id });
      // Validasi role pengguna yang sedang login  
    //   if (!user || user.role == 'DOKTER' ) {  
    //     return res.status(403).send(errorResponse('Access Denied: Only ADMIN and PETUGAS can create pasiens', 403));  
    // }  

    if (!user ) {  
        return res.status(403).send(errorResponse('User not Authoorized', 403));  
    }  
        const kodeWilayah = body.kodeWilayah;
        
        const lastPasien = await pasienRepository
            .createQueryBuilder("pasien")
            .where("pasien.nomerRM LIKE :kodeWilayah", { kodeWilayah: `${kodeWilayah}-%` })
            .andWhere("SUBSTRING(pasien.nomerRM, 4) != '000000'")
            .orderBy("pasien.nomerRM", "DESC")
            .getOne();
        
        let nextNomerRM = `${kodeWilayah}-000001`; // Default jika belum ada data pasien dengan kodeWilayah tsb
        if (lastPasien) {
            const currentNumber = parseInt(lastPasien.nomerRM.split('-')[1], 10);
            nextNomerRM = `${kodeWilayah}-${String(currentNumber + 1).padStart(6, "0")}`;
        }


        // Membuat entitas pasien baru
        const newPasien = new Pasien();
        newPasien.nomerRM = nextNomerRM
        newPasien.namaPasien = body.namaPasien
        newPasien.namaLengkap = body.namaLengkap
        newPasien.jenisKelamin = body.jenisKelamin
        newPasien.tanggalLahir = body.tanggalLahir
        newPasien.tempatLahir = body.tempatLahir
        newPasien.noBPJS_KIS = body.noBPJS_KIS
        newPasien.kelurahan_desa = body.kelurahan_desa
        newPasien.kecamatan = body.kecamatan
        newPasien.kabupaten = body.kabupaten
        newPasien.riwayatAlergi = body.riwayatAlergi
        newPasien.riwayatPenyakit = body.riwayatPenyakit
        newPasien.usia = body.usia
        newPasien.NIK = body.NIK
        await pasienRepository.save(newPasien);

      

        return res.status(200).send(successResponse("Create Pasien Success", {
            data: newPasien,
        }, 200));

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: error.message });
    }
};

export const updateStatusPeminjamanRekamMedis = async (req : Request, res: Response) =>{
    const updateStatusPeminjamanRekamMedisSchema = (input) => Joi.object({
        statusPeminjaman : Joi.string().required(),
        tanggalDikembalikan : Joi.date().optional()
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

        if (!updateStatusRM) {
            return res.status(404).send(errorResponse('Rekam medis tidak ditemukan', 404));
        }

    


        updateStatusRM.statusPeminjaman = body.statusPeminjaman

        await riwayatPasienRepository.save(updateStatusRM)

        
        if (body.statusPeminjaman === "DIPINJAM") {
            console.log("Meminjam data peminjaman dengan RiwayatPasiens ID:", id)
            
            const peminjaman = await AppDataSource.getRepository(peminjamanRekamMedis).findOne({
                where: { RiwayatPasiens: { id: id } },
                relations: ['RiwayatPasiens', 'RiwayatPasiens.Pasiens', 'Dokters'], // Adjusted relation names
            });

            if (peminjaman){
                peminjaman.tanggalDikembalikan = body.tanggalDikembalikan
                await AppDataSource.getRepository(peminjamanRekamMedis).save(peminjaman)

                const maxNoLog = await logActivityRepository
                .createQueryBuilder("logActivity")
                .select("MAX(logActivity.no)", "max")
                .getRawOne();
            
                // Hitung nomer berikutnya
                const nextNo = (maxNoLog?.max || 0) + 1;
    
                const updateStatusDipinjamLogActivity = new logActivity();
                updateStatusDipinjamLogActivity.no = nextNo;
                updateStatusDipinjamLogActivity.tanggalPeminjaman = peminjaman.tanggalPeminjaman
                updateStatusDipinjamLogActivity.tanggalDikembalikan = peminjaman.tanggalDikembalikan
                updateStatusDipinjamLogActivity.nomerRM = peminjaman.RiwayatPasiens.Pasiens.nomerRM; // Assuming the medical record number is the ID of RiwayatPasiens
                updateStatusDipinjamLogActivity.waktu = new Date(); // Current time
                updateStatusDipinjamLogActivity.Petugas = user.namaLengkap || "Unknown User"; // Handle potential null/undefined
                updateStatusDipinjamLogActivity.Dokter = peminjaman.Dokters.namaLengkap;
                updateStatusDipinjamLogActivity.Aksi = "Update Status Peminjaman Rekam Medis Menjadi DIPINJAM";
                updateStatusDipinjamLogActivity.Deskripsi = `Dokter ${peminjaman.Dokters.namaLengkap} meminjam rekam medis nomor ${peminjaman.RiwayatPasiens.Pasiens.nomerRM} untuk keperluan ${peminjaman.alasanPeminjaman}`;
        
                await logActivityRepository.save(updateStatusDipinjamLogActivity);
            }

          

        
        }



        if (body.statusPeminjaman === "TERSEDIA") {
            console.log("Menghapus data peminjaman dengan RiwayatPasiens ID:", id);
          
            // 1. Fetch the peminjaman record before deletion to log details
            const peminjaman = await AppDataSource.getRepository(peminjamanRekamMedis).findOne({
              where: { RiwayatPasiens: { id: id } },
              relations: ['RiwayatPasiens', 'RiwayatPasiens.Pasiens', 'Dokters'], // Load required relations
            });
          
            if (peminjaman) {
              // 2. Generate next log number (same logic as DIPINJAM case)
              const maxNoLog = await logActivityRepository
                .createQueryBuilder("logActivity")
                .select("MAX(logActivity.no)", "max")
                .getRawOne();
              const nextNo = (maxNoLog?.max || 0) + 1;
          
              // 3. Create log entry for "TERSEDIA" status
              const updateStatusTersediaLogActivity = new logActivity();
              updateStatusTersediaLogActivity.no = nextNo;
              updateStatusTersediaLogActivity.tanggalPeminjaman = peminjaman.tanggalPeminjaman
              updateStatusTersediaLogActivity.tanggalDikembalikan = peminjaman.tanggalDikembalikan
              updateStatusTersediaLogActivity.nomerRM = peminjaman.RiwayatPasiens.Pasiens.nomerRM;
              updateStatusTersediaLogActivity.waktu = new Date();
              updateStatusTersediaLogActivity.Petugas = user.namaLengkap || "Unknown User";
              updateStatusTersediaLogActivity.Dokter = peminjaman.Dokters.namaLengkap;
              updateStatusTersediaLogActivity.Aksi = "Mengembalikan Peminjaman Rekam Medis";
              updateStatusTersediaLogActivity.Deskripsi = `Dokter ${peminjaman.Dokters.namaLengkap} mengembalikan rekam medis nomor ${peminjaman.RiwayatPasiens.Pasiens.nomerRM}`;
          
              // 4. Save the log
              await logActivityRepository.save(updateStatusTersediaLogActivity);
          
              // 5. Delete the peminjaman record after logging
              await AppDataSource.getRepository(peminjamanRekamMedis).delete({ 
                RiwayatPasiens: { id: id } 
              });
            } else {
              console.warn("No peminjaman record found for deletion. Proceeding without logging.");
            }
          }

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
        tanggalPeminjaman : Joi.date().required(),


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
        updatePeminjamanRekamMedis.tanggalPeminjaman = body.tanggalPeminjaman
        updatePeminjamanRekamMedis.tanggalDikembalikan = body.tanggalDikembalikan
        updatePeminjamanRekamMedis.RiwayatPasiens = Riwayatpasien
        updatePeminjamanRekamMedis.Dokters = dokter
        
        await peminjamanRekamMedisRepository.save(updatePeminjamanRekamMedis)


        const newLogActivityOnUpdatePeminjamanRekamMedis = new logActivity();
        newLogActivityOnUpdatePeminjamanRekamMedis.no = nextNo;
        newLogActivityOnUpdatePeminjamanRekamMedis.tanggalPeminjaman = updatePeminjamanRekamMedis.tanggalPeminjaman
        newLogActivityOnUpdatePeminjamanRekamMedis.tanggalDikembalikan = updatePeminjamanRekamMedis.tanggalDikembalikan
        newLogActivityOnUpdatePeminjamanRekamMedis.nomerRM = updatePeminjamanRekamMedis.RiwayatPasiens.Pasiens.nomerRM; // Assuming the medical record number is the ID of RiwayatPasiens
        newLogActivityOnUpdatePeminjamanRekamMedis.waktu = new Date(); // Current time
        newLogActivityOnUpdatePeminjamanRekamMedis.Petugas = user.namaLengkap || "Unknown User"; // Handle potential null/undefined
        newLogActivityOnUpdatePeminjamanRekamMedis.Dokter = updatePeminjamanRekamMedis.Dokters.namaLengkap;
        newLogActivityOnUpdatePeminjamanRekamMedis.Aksi = "UPDATE DATA PEMINJAMAN REKAM MEDIS";
        newLogActivityOnUpdatePeminjamanRekamMedis.Deskripsi = `Dokter ${dokter.namaLengkap} update data rekam medis nomor ${updatePeminjamanRekamMedis.RiwayatPasiens.Pasiens.nomerRM} untuk keperluan ${body.alasanPeminjaman}`;

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



