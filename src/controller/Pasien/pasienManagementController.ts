import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import Joi, { equal, required, string } from "joi";
import { User } from "../../model/User";
import { Pasien } from "../../model/Pasien";
import { RiwayatPasien } from "../../model/RiwayatPasien";
import exp from "constants";
import { Equal } from 'typeorm'; // Pastikan Equal diimpor dari typeorm




const { successResponse, errorResponse, validationResponse } = require('../../utils/response')

const userRepository = AppDataSource.getRepository(User);

const pasienRepository = AppDataSource.getRepository(Pasien);

const riwayatPasienRepository = AppDataSource.getRepository(RiwayatPasien);

export const getPasien = async (req: Request, res: Response) => {    
    try {    
        const { limit: queryLimit, page: page, namaPasien } = req.query;    
    
        const queryBuilder = pasienRepository.createQueryBuilder('Pasien')    
            .orderBy('Pasien.createdAt', 'DESC');    
    
        if (namaPasien) {    
            queryBuilder.where('Pasien.namaLengkap LIKE :namaLengkap', {    
                namaPasien: `%${namaPasien}%`    
            });    
        }    
    
        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id });    
    
        if (!userAcces) {    
            return res.status(200).send(successResponse('User is Not Authorized', { data: userAcces }));    
        }    
    
        const dynamicLimit = queryLimit ? parseInt(queryLimit as string) : null;    
        const currentPage = page ? parseInt(page as string) : 1; // Convert page to number, default to 1    
        const skip = (currentPage - 1) * (dynamicLimit || 0);    
    
        const [data, totalCount] = await queryBuilder    
            .skip(skip)    
            .take(dynamicLimit || undefined)    
            .getManyAndCount();    
    
        const modifiedData = data.map((pasien) => {      
            const { tempatLahir, tanggalLahir, kelurahan_desa, kecamatan, kabupaten, ...rest } = pasien; // Destructuring untuk menghapus properti yang tidak diinginkan  
              
            // Format tanggal  
            const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };  
            const formattedDate = new Date(tanggalLahir).toLocaleDateString('id-ID', options); // Format sesuai dengan locale Indonesia  
  
            // Mengubah format tanggal menjadi "18 November 2000"  
            const [day, MONTTH, year] = formattedDate.split(' ');  
            const formattedTTL = `${day} ${MONTTH.toLowerCase()} ${year}`; // Mengubah bulan menjadi huruf kecil  
  
            return {      
                ...rest,    
                TTL: `${tempatLahir}, ${formattedTTL}`, // Gunakan tanggal yang sudah diformat  
                alamat: `${kelurahan_desa}, ${kecamatan}, ${kabupaten}`, 
                tangalLahir :`${tanggalLahir}`     
            };      
        });    
    
        return res.status(200).send(successResponse('Get Pasien Success', {    
            data: modifiedData,    
            totalCount,    
            currentPage,    
            totalPages: Math.ceil(totalCount / (dynamicLimit || 1)),    
        }, 200));    
    
    } catch (error) {    
        res.status(500).json({ msg: error.message });    
    }    
}  

export const CountPasien = async (req: Request, res: Response) => {
    try {
        const { limit: queryLimit, page: page, namaPasien } = req.query;

        const limit = parseInt(queryLimit as string) || 10; // Default limit is 10
        const offset = (parseInt(page as string) || 1 -1) * limit; // Default page is 1

        const queryBuilder = pasienRepository.createQueryBuilder('Pasien')
            .orderBy('Pasien.createdAt', 'DESC')
            .limit(limit)
            .offset(offset);

        if (namaPasien) {
            queryBuilder.where('Pasien.namaLengkap LIKE :namaLengkap', {    
                namaPasien: `%${namaPasien}%`
            });
        }

        const [pasien, total] = await queryBuilder.getManyAndCount();

        return res.status(200).json({
            message: 'Total data Pasien',
            total: total,
        });
    } catch (error) {
        console.error("Error fetching pasien:", error);
        return res.status(500).json({ message: "Failed to fetch pasien" });
    }
};



export const getPasienById = async (req: Request, res: Response) => {    
    try {    
        const id = req.params.id;    

        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id });    

        if (!userAcces) {    
            return res.status(200).send(successResponse('User is Not Authorized', { data: userAcces }));    
        }    

        const pasien = await pasienRepository.findOne({    
            where: { id: id },    
            relations: ['RiwayatPasiens'] 
        });    

        if (!pasien) {    
            return res.status(404).json({ msg: 'Pasien tidak ditemukan' });    
        }    

        return res.status(200).send(successResponse("Get Pasien by ID Success", { 
            data: pasien 
        }, 200));    

    } catch (error) {    
        res.status(500).json({ msg: error.message });    
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

     // Query untuk mendapatkan `nomerRM` terakhir
    const lastPasien = await pasienRepository
    .createQueryBuilder("pasien")
    .orderBy("pasien.nomerRM", "DESC")
    .getOne();
    // Hitung `nomerRM` baru
    let nextNomerRM = "000001"; // Default jika belum ada data pasien
    if (lastPasien) {
        const currentNumber = parseInt(lastPasien.nomerRM, 10);
        nextNomerRM = String(currentNumber + 1).padStart(6, "0");
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


export const updatePasien = async (req : Request, res: Response) =>{
    const updatePasienSchema = (input) => Joi.object({
        namaPasien: Joi.string().optional(),
        namaLengkap: Joi.string().optional(),
        jenisKelamin: Joi.string().optional(),
        tanggalLahir: Joi.date().optional(),
        tempatLahir: Joi.string().optional(),
        noBPJS_KIS: Joi.string().optional(),
        kelurahan_desa: Joi.string().optional(),
        kecamatan: Joi.string().optional(),
        kabupaten: Joi.string().optional(),
        riwayatAlergi: Joi.string().optional(),
        riwayatPenyakit: Joi.string().optional(),  
        NIK: Joi.string().optional(),
        usia: Joi.number().optional(),      
    }).validate(input);

    try {
        const body = req.body
        const id = req.params.id;
        const pasienId = id
        // const schema = updatePasienSchema(req.body)
        
        // if ('error' in schema) {
        //     return res.status(422).send(validationResponse(schema))
        // }

        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: userAcces }))
        }

        // if (!userAcces || userAcces.role !== 'ADMIN' ) {  
        //     return res.status(403).send(errorResponse('Access Denied: Only ADMIN can update pasien', 403));  
        // }  

  

        const updatePasien = await pasienRepository.findOneBy({ id });
        updatePasien.namaPasien = body.namaPasien
        updatePasien.namaLengkap = body.namaLengkap
        updatePasien.jenisKelamin = body.jenisKelamin;
        updatePasien.tanggalLahir = body.tanggalLahir;
        updatePasien.tempatLahir = body.tempatLahir;
        updatePasien.noBPJS_KIS = body.noBPJS_KIS
        updatePasien.kelurahan_desa = body.kelurahan_desa
        updatePasien.kecamatan = body.kecamatan
        updatePasien.kabupaten = body.kabupaten
        updatePasien.riwayatAlergi = body.riwayatAlergi
        updatePasien.riwayatPenyakit = body.riwayatPenyakit
        updatePasien.usia = body.usia
        updatePasien.NIK = body.NIK
        await pasienRepository.save(updatePasien)

     

        console.log(updatePasien)
        return res.status(200).send(successResponse("Update Pasien and Riwayat Success", { data: updatePasien }, 200))

    }catch(error){
        res.status(500).json({ msg: error.message })
    }



}

export const deletePasien = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        // Cek apakah pengguna memiliki akses
        const userAccess = await userRepository.findOneBy({ id: req.jwtPayload.id });
       
       
        // if (!userAccess || userAccess.role !== 'ADMIN' ) {  
        //     return res.status(403).send(errorResponse('Access Denied: Only ADMIN can deleted users', 403));  
        // } 

        if (!userAccess) {
            return res.status(200).send(successResponse('User is Not Authorized', { data: userAccess }))
        }

        // Cari pasien berdasarkan ID
        const pasien = await pasienRepository.findOne({
            where: {
                id: id,
            },
        });

        if (!pasien) {
            return res.status(404).send({ message: 'Pasien Not Found' });
        }

        // Hapus semua riwayat pasien yang terkait dengan pasien
        const riwayatPasien = await riwayatPasienRepository.find({
            where: { Pasiens: { id: pasien.id } },
        });

        if (riwayatPasien.length > 0) {
            await riwayatPasienRepository.remove(riwayatPasien);
        }

        // Hapus data pasien
        await pasienRepository.remove(pasien);

        return res.status(200).send(
            successResponse('Success delete Pasien and related RiwayatPasien', { data: pasien, riwayatPasien }, 200)
        );
    } catch (error) {
        return res.status(500).send(errorResponse(error.message, 500));
    }
};




