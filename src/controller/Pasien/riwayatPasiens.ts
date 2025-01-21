import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import Joi, { equal, required, string } from "joi";
import { User,UserRole } from "../../model/User";
import { Pasien } from "../../model/Pasien";
import { RiwayatPasien,Status } from "../../model/RiwayatPasien";
import exp from "constants";
import { Equal } from 'typeorm'; // Pastikan Equal diimpor dari typeorm




const { successResponse, errorResponse, validationResponse } = require('../../utils/response')

const userRepository = AppDataSource.getRepository(User);

const pasienRepository = AppDataSource.getRepository(Pasien);

const riwayatPasienRepository = AppDataSource.getRepository(RiwayatPasien);

export const getRekamMedis = async (req: Request, res: Response) => {  
    try {  
        const { limit: queryLimit, page: page, nomerRM } = req.query; // Mengganti namaPasien dengan nomerRM untuk mencocokkan model  
  
        const queryBuilder = riwayatPasienRepository.createQueryBuilder('RiwayatPasien')  
            .leftJoinAndSelect('RiwayatPasien.Pasiens', 'Pasien') // Mengambil data pasien  
            .leftJoinAndSelect('RiwayatPasien.Dokters', 'Dokter') // Mengambil data dokter  
            .orderBy('RiwayatPasien.createdAt', 'DESC');  
  
        if (nomerRM) {  
            queryBuilder.where('RiwayatPasien.nomerRM LIKE :nomerRM', {  
                nomerRM: `%${nomerRM}%`  
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
  
        const modifiedData = data.map((riwayat) => {  
            const { Pasiens, Dokters, ...rest } = riwayat; // Destructuring untuk menghapus properti yang tidak diinginkan  
  
            // Format tanggal lahir pasien  
            const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };  
            const formattedDate = new Date(Pasiens.tanggalLahir).toLocaleDateString('id-ID', options); // Format sesuai dengan locale Indonesia  
  
            // Mengubah format tanggal menjadi "18 November 2000"  
            const [day, month, year] = formattedDate.split(' ');  
            const formattedTTL = `${day} ${month.toLowerCase()} ${year}`; // Mengubah bulan menjadi huruf kecil  
  
            return {  
                ...rest,  
                pasien: Pasiens.namaPasien, // Menyertakan nama pasien  
                dokter: Dokters.namaLengkap, // Menyertakan nama dokter,
                TTL: `${Pasiens.tempatLahir}, ${formattedTTL}`, // Gunakan tanggal yang sudah diformat  
                alamat: `${Pasiens.kelurahan_desa}, ${Pasiens.kecamatan}, ${Pasiens.kabupaten}`,  
                eTTd : Dokters.eTTD
            };  
        });  
  
        return res.status(200).send(successResponse('Get Rekam Medis Success', {  
            data: modifiedData,  
            totalCount,  
            currentPage,  
            totalPages: Math.ceil(totalCount / (dynamicLimit || 1)),  
        }, 200));  
  
    } catch (error) {  
        res.status(500).json({ msg: error.message });  
    }  
}  




export const getRekamMedisById = async (req: Request, res: Response) => {  
    try {  
        const id = req.params.id;  
  
        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id });  
  
        if (!userAcces) {  
            return res.status(200).send(successResponse('User is Not Authorized', { data: userAcces }));  
        }  
  
        // Mengambil data rekam medis berdasarkan ID  
        const rekamMedis = await riwayatPasienRepository.findOne({  
            where: { id: id },  
            relations: ['Pasiens', 'Dokters'] // Mengambil data pasien dan dokter  
        });  
  
        if (!rekamMedis) {  
            return res.status(404).json({ msg: 'Rekam medis tidak ditemukan' });  
        }  
  
        // Modifikasi data untuk menggabungkan TTL dan alamat  
        const { Pasiens, Dokters, ...rest } = rekamMedis; // Destructuring untuk menghapus properti yang tidak diinginkan  
  
        // Format tanggal lahir pasien  
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };  
        const formattedDate = new Date(Pasiens.tanggalLahir).toLocaleDateString('id-ID', options); // Format sesuai dengan locale Indonesia  
  
        // Mengubah format tanggal menjadi "18 November 2000"  
        const [day, month, year] = formattedDate.split(' ');  
        const formattedTTL = `${day} ${month.toLowerCase()} ${year}`; // Mengubah bulan menjadi huruf kecil  
  
        const modifiedRekamMedis = {  
            ...rest,  
            pasien: Pasiens.namaPasien, // Menyertakan nama pasien  
            dokter: Dokters.namaLengkap, // Menyertakan nama dokter  
            TTL: `${Pasiens.tempatLahir}, ${formattedTTL}`, // Gunakan tanggal yang sudah diformat  
            alamat: `${Pasiens.kelurahan_desa}, ${Pasiens.kecamatan}, ${Pasiens.kabupaten}`,  
        };  
  
        return res.status(200).send(successResponse("Get Rekam Medis by ID Success", { data: modifiedRekamMedis }, 200));  
  
    } catch (error) {  
        res.status(500).json({ msg: error.message });  
    }  
}  


 



export const createRekamMedis = async (req: Request, res: Response) => {
    const createRekamMedisSchema = (input) => Joi.object({
        Dokter: Joi.string().required(),  
        pasien: Joi.string().required(),  
        noRM: Joi.string().optional(),  
        lamaPenyakit: Joi.string().optional(),  
        lain_lain: Joi.string().optional(),  
        waktuPermeriksaan: Joi.string().optional(),  
        fisik: Joi.string().optional(),  
        lain_lainHasilPemeriksaan: Joi.string().optional(),  
        laboratorium: Joi.string().optional(),  
        radiologi: Joi.string().optional(),  
        keadaanKeluarRS: Joi.string().optional(),  
        prognosa: Joi.string().optional(),  
        kapanPenyakitDahulu: Joi.string().optional(),  
        pengobatan: Joi.string().optional(),  
        faktorEtimologi: Joi.string().optional(),  
        diagnosaAkhir: Joi.string().optional(),  
        masalahDihadapi: Joi.string().optional(),  
        konsultasi: Joi.string().optional(),  
        pengobatanTindakan: Joi.string().optional(),  
        perjalananPeyakit: Joi.string().optional(),  
        sebabMeninggal: Joi.string().optional(),  
        usulTidakLanjut: Joi.string().optional(),  

        
    }).validate(input);

    try {
        const body = req.body;
        const schema = createRekamMedisSchema(req.body);

        console.log(req.body);  


        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema));
        }

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id });
      // Validasi role pengguna yang sedang login  
      if (!user || user.role !== 'DOKTER' ) {  
        return res.status(403).send(errorResponse('Access Denied: Only DOKTER can create Rekam Medis', 403));  
    }  

    const dokter = await userRepository.findOneBy({ id: body.Dokter, role: UserRole.DOKTER });  
        if (!dokter) {  
            return res.status(422).send(errorResponse('Invalid Dokter ID: Dokter not found', 422));  
        }  

    const pasien = await pasienRepository.findOneBy({ id: body.pasien });  
    if (!pasien) {  
            return res.status(422).send(errorResponse('Invalid Pasien ID: Pasien not found', 422));  
        }  

        // Query untuk mendapatkan `nomerRM` terakhir
        const lastPasien = await riwayatPasienRepository
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
        const newRekamMedis = new RiwayatPasien();
        newRekamMedis.nomerRM = nextNomerRM
        newRekamMedis.Dokters = dokter; // Menggunakan objek dokter  
        newRekamMedis.Pasiens = pasien;
        newRekamMedis.statusPeminjaman = Status.TERSEDIA
        newRekamMedis.lamaPenyakit = body.lamaPenyakit
        newRekamMedis.lain_lain = body.lain_lain
        newRekamMedis.waktuPermeriksaan = body.waktuPermeriksaan
        newRekamMedis.fisik = body.fisik
        newRekamMedis.lain_lainHasilPemeriksaan = body.lain_lainHasilPemeriksaan
        newRekamMedis.laboratorium = body.laboratorium
        newRekamMedis.radiologi = body.radiologi
        newRekamMedis.keadaanKeluarRS = body.keadaanKeluarRS
        newRekamMedis.prognosa = body.prognosa
        newRekamMedis.kapanPenyakitDahulu = body.kapanPenyakitDahulu
        newRekamMedis.pengobatan = body.pengobatan
        newRekamMedis.faktorEtimologi = body.faktorEtimologi
        newRekamMedis.diagnosaAkhir = body.diagnosaAkhir
        newRekamMedis.masalahDihadapi = body.masalahDihadapi
        newRekamMedis.konsultasi = body.konsultasi
        newRekamMedis.pengobatanTindakan = body.pengobatanTindakan
        newRekamMedis.perjalananPeyakit = body.perjalananPeyakit
        newRekamMedis.sebabMeninggal = body.sebabMeninggal
        newRekamMedis.usulTidakLanjut = body.sebabMeninggal
        await riwayatPasienRepository.save(newRekamMedis);

      

        return res.status(200).send(successResponse("Create Rekam Medis Success", {
            data: newRekamMedis,
        }, 200));

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: error.message });
    }
};


export const updateRekamMedis = async (req : Request, res: Response) =>{
    const updateRekamMedisChema = (input) => Joi.object({
        Dokter: Joi.string().required(),  
        pasien: Joi.string().required(),  
        noRM: Joi.string().optional(),  
        lamaPenyakit: Joi.string().optional(),  
        lain_lain: Joi.string().optional(),  
        waktuPermeriksaan: Joi.string().optional(),  
        fisik: Joi.string().optional(),  
        lain_lainHasilPemeriksaan: Joi.string().optional(),  
        laboratorium: Joi.string().optional(),  
        radiologi: Joi.string().optional(),  
        keadaanKeluarRS: Joi.string().optional(),  
        prognosa: Joi.string().optional(),  
        kapanPenyakitDahulu: Joi.string().optional(),  
        pengobatan: Joi.string().optional(),  
        faktorEtimologi: Joi.string().optional(),  
        diagnosaAkhir: Joi.string().optional(),  
        masalahDihadapi: Joi.string().optional(),  
        konsultasi: Joi.string().optional(),  
        pengobatanTindakan: Joi.string().optional(),  
        perjalananPeyakit: Joi.string().optional(),  
        sebabMeninggal: Joi.string().optional(),  
        usulTidakLanjut: Joi.string().optional(),       
    }).validate(input);

    try {
        const body = req.body
        const id = req.params.id;
        const pasienId = id
        const schema = updateRekamMedisChema(req.body)
        
        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema))
        }

        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces) {
            return res.status(200).send(successResponse('Update User is Not Authorized', { data: userAcces }))
        }

        if (!userAcces || userAcces.role !== 'DOKTER' ) {  
            return res.status(403).send(errorResponse('Access Denied: Only DOKTER can update pasien', 403));  
        }  

      
    
        const dokter = await userRepository.findOneBy({ id: body.Dokter, role: UserRole.DOKTER });  
            if (!dokter) {  
                return res.status(422).send(errorResponse('Invalid Dokter ID: Dokter not found or not authorized', 422));  
            }  
        
        const pasien = await pasienRepository.findOneBy({ id: body.pasien });  
        if (!pasien) {  
                    return res.status(422).send(errorResponse('Invalid Pasien ID: Pasien not found', 422));  
                }  
    
            // Query untuk mendapatkan `nomerRM` terakhir
            const lastPasien = await riwayatPasienRepository
            .createQueryBuilder("pasien")
            .orderBy("pasien.nomerRM", "DESC")
            .getOne();
            // Hitung `nomerRM` baru
            let nextNomerRM = "000001"; // Default jika belum ada data pasien
            if (lastPasien) {
                const currentNumber = parseInt(lastPasien.nomerRM, 10);
                nextNomerRM = String(currentNumber + 1).padStart(6, "0");
            }

        const updateRekamMedis = await riwayatPasienRepository.findOneBy({ id });
        updateRekamMedis.nomerRM = nextNomerRM
        updateRekamMedis.Dokters = dokter; // Menggunakan objek dokter  
        updateRekamMedis.Pasiens = pasien
        updateRekamMedis.lamaPenyakit = body.lamaPenyakit
        updateRekamMedis.lain_lain = body.lain_lain
        updateRekamMedis.waktuPermeriksaan = body.waktuPermeriksaan
        updateRekamMedis.fisik = body.fisik
        updateRekamMedis.lain_lainHasilPemeriksaan = body.lain_lainHasilPemeriksaan
        updateRekamMedis.laboratorium = body.laboratorium
        updateRekamMedis.radiologi = body.radiologi
        updateRekamMedis.keadaanKeluarRS = body.riwayatAlergi
        updateRekamMedis.prognosa = body.prognosa
        updateRekamMedis.kapanPenyakitDahulu = body.kapanPenyakitDahulu
        updateRekamMedis.pengobatan = body.pengobatan
        updateRekamMedis.faktorEtimologi = body.faktorEtimologi
        updateRekamMedis.diagnosaAkhir = body.diagnosaAkhir
        updateRekamMedis.masalahDihadapi = body.masalahDihadapi
        updateRekamMedis.konsultasi = body.konsultasi
        updateRekamMedis.pengobatanTindakan = body.pengobatanTindakan
        updateRekamMedis.perjalananPeyakit = body.perjalananPeyakit
        updateRekamMedis.sebabMeninggal = body.sebabMeninggal
        updateRekamMedis.usulTidakLanjut = body.sebabMeninggal
        await riwayatPasienRepository.save(updateRekamMedis)

     

        console.log(updateRekamMedis)
        return res.status(200).send(successResponse("Update Rekam Medis", { data: updateRekamMedis }, 200))

    }catch(error){
        res.status(500).json({ msg: error.message })
    }



}


export const deleteRekamMedis = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        
        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces || userAcces.role !== 'DOKTER' ) {  
            return res.status(403).send(errorResponse('Access Denied: Only DOKTER can delete rekam medis', 403));  
        }  


        const rekamMedis = await riwayatPasienRepository.findOne({ 
            where : {id }
        })
        if (!rekamMedis) {
            return res.status(404).send(errorResponse('Rekam Medis not found', 404))
        }

        const deletedRekamMedis = await riwayatPasienRepository.remove(rekamMedis)



        return res.status(200).send(successResponse('Success delete Rekam Medis', { data: rekamMedis }, 200))
    } catch (error) {
        return res.status(400).send(errorResponse(error, 400))
    }
}





