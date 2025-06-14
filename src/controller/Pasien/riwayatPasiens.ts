import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import Joi, { equal, required, string } from "joi";
import { User,UserRole } from "../../model/User";
import { Pasien } from "../../model/Pasien";
import { RiwayatPasien,StatusRM } from "../../model/RiwayatPasien";
import exp from "constants";
import { Equal } from 'typeorm'; // Pastikan Equal diimpor dari typeorm
import { assessmentRekamMedis } from "../../model/AssessmentRekamMedis";
import { autonamnesisRekamMedis } from "../../model/AutonamnesisRekamMedis";
import { objektifRekamMedis } from "../../model/objektiRekamMedis";
import { planningRekamMedis,Edukasi } from "../../model/planningRekamMedis";

const { successResponse, errorResponse, validationResponse } = require('../../utils/response')

const userRepository = AppDataSource.getRepository(User);

const pasienRepository = AppDataSource.getRepository(Pasien);

const riwayatPasienRepository = AppDataSource.getRepository(RiwayatPasien);

const assessmentRekamMedisRepository = AppDataSource.getRepository(assessmentRekamMedis)

const autonamnesisRekamMedisRepository = AppDataSource.getRepository(autonamnesisRekamMedis)

const objekRekamMedisRepository = AppDataSource.getRepository(objektifRekamMedis)

const planningRekamMedisRepository = AppDataSource.getRepository(planningRekamMedis)


export const analyzeRekamMedis = async (req: Request, res: Response) => {
    try {
        const rekamMedisList = await riwayatPasienRepository.find({
            relations : ["Pasiens"]
        });

        // Filter rekam medis yang memiliki nilai null atau string kosong
        const incompleteRecords = rekamMedisList.filter(rekamMedis => {
            return Object.entries(rekamMedis).some(([key, value]) => (value === null || value === ''));
        });

        return res.status(200).json({
            message: 'Data rekam medis yang tidak lengkap',
            results: {data: incompleteRecords}
            
        });
    } catch (error) {
        console.error('Error analyzing rekam medis:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat menganalisis rekam medis.' });
    }
};

export const checkCompleteRekamMedis = async (req: Request, res: Response) => {
    try {
        const rekamMedisList = await riwayatPasienRepository.find({
            relations: ["Pasiens"]
        });

        // Filter rekam medis yang tidak memiliki nilai null atau string kosong
        const completeRecords = rekamMedisList.filter(rekamMedis => {
            return !Object.entries(rekamMedis).some(([key, value]) => (value === null || value === ''));
        });

        return res.status(200).json({
            message: 'Data rekam medis yang lengkap',
            results: { data: completeRecords }
        });
    } catch (error) {
        console.error('Error checking complete rekam medis:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat memeriksa rekam medis yang lengkap.' });
    }
};



export const countIncompleteRekamMedis = async (req: Request, res: Response) => {
    try {
        const rekamMedisList = await AppDataSource.getRepository(RiwayatPasien).find();

        // Hitung jumlah rekam medis yang memiliki nilai null (kecuali deletedAt)
        const totalIncompleteRecords = rekamMedisList.filter(rekamMedis => {
            return Object.entries(rekamMedis).some(([key, value]) => value === null);
        }).length;

        return res.status(200).json({
            message: 'Total data rekam medis yang tidak lengkap',
            total: totalIncompleteRecords
        });
    } catch (error) {
        console.error('Error counting incomplete rekam medis:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat menghitung rekam medis yang tidak lengkap.' });
    }
};

export const countCompleteRekamMedis = async (req: Request, res: Response) => {
    try {
        const rekamMedisList = await AppDataSource.getRepository(RiwayatPasien).find();

        // Hitung jumlah rekam medis yang tidak memiliki nilai null atau string kosong
        const totalCompleteRecords = rekamMedisList.filter(rekamMedis => {
            return !Object.entries(rekamMedis).some(([key, value]) => (value === null || value === ''));
        }).length;

        return res.status(200).json({
            message: 'Total data rekam medis yang lengkap',
            total: totalCompleteRecords
        });
    } catch (error) {
        console.error('Error counting complete rekam medis:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan saat menghitung rekam medis yang lengkap.' });
    }
};


export const getRekamMedis = async (req: Request, res: Response) => {  
    try {  
        const { limit: queryLimit, page: page, nomerRM,start_date,end_date } = req.query; // Mengganti namaPasien dengan nomerRM untuk mencocokkan model  

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
     
        const queryBuilder = riwayatPasienRepository.createQueryBuilder('RiwayatPasien')  
            .leftJoinAndSelect('RiwayatPasien.Pasiens', 'Pasien') // Mengambil data pasien  
            .leftJoinAndSelect('RiwayatPasien.Dokters', 'Dokter') // Mengambil data dokter  
            .orderBy('RiwayatPasien.createdAt', 'DESC');  
  
        if (nomerRM) {  
            queryBuilder.where('RiwayatPasien.nomerRM LIKE :nomerRM', {  
                nomerRM: `%${nomerRM}%`  
            });  
        }  
   // Apply date range filter if both start_date and end_date are provided
        if (startDate && endDate) {
            queryBuilder.andWhere(
                'RiwayatPasien.createdAt >= :startDate AND RiwayatPasien.createdAt <= :endDate',
                {
                    startDate,
                    endDate,
                }
            );
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
                pasien: Pasiens.id, // Menyertakan id pasien  
                namaPasien: Pasiens.namaLengkap, // Menyertakan nama pasien  
                Dokter: Dokters.id, // Menyertakan nama dokter,
                namaDokter: Dokters.namaLengkap, // Menyertakan nama dokter,
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
} ;

export const CountRekamMedis = async (req: Request, res: Response) => {
    try {
        const { limit: queryLimit, page: page, nomerRM } = req.query;

        const limit = parseInt(queryLimit as string) || 10; // Default limit is 10
        const offset = (parseInt(page as string) || 1 -1) * limit; // Default page is 1

        const queryBuilder = riwayatPasienRepository.createQueryBuilder("RiwayatPasien")
            .leftJoinAndSelect("RiwayatPasien.Pasiens", "Pasien")
            .leftJoinAndSelect("RiwayatPasien.Dokters", "Dokter");

        if (nomerRM) {
            queryBuilder.where("Pasien.nomerRM = :nomerRM", { nomerRM });
        }

        const [result, total] = await queryBuilder
            .orderBy("RiwayatPasien.createdAt", "DESC")
            .limit(limit)
            .offset(offset)
            .getManyAndCount();

        return res.status(200).json({
            message: 'Total data Rekam Medis',
            total
        });
    } catch (error) {
        console.error("Error fetching rekam medis:", error);
        return res.status(500).json({ message: "Failed to fetch rekam medis" });
    }
};




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
            pasien: Pasiens.id, // Menyertakan id pasien  
            namaPasien: Pasiens.namaLengkap, // Menyertakan nama pasien  
            noRM : Pasiens.nomerRM, 
            Dokter: Dokters.id, // Menyertakan nama dokter  
            namaDokter: Dokters.namaLengkap, // Menyertakan nama dokter  
            TTL: `${Pasiens.tempatLahir}, ${formattedTTL}`, // Gunakan tanggal yang sudah diformat  
            alamat: `${Pasiens.kelurahan_desa}, ${Pasiens.kecamatan}, ${Pasiens.kabupaten}`,  
            ettd : Dokters.eTTD?`${Dokters.eTTD.replace(/\\/g, '/')}` : null,
           statusPeminjaman : rekamMedis.statusPeminjaman,
           tanggalKunjungan : rekamMedis.tanggalKunjungan,
           subjektif : rekamMedis.subjektif,
           ku : rekamMedis.ku,
           kt : rekamMedis.kt,
           rpd : rekamMedis.rpd,
           rpo : rekamMedis.rpo,
           rpk : rekamMedis.rpk,
           td : rekamMedis.td,
           hr : rekamMedis.hr,
           rr : rekamMedis.rr,
           t : rekamMedis.t,
           tb : rekamMedis.tb,
           bb : rekamMedis.bb,
           pemeriksaanFisik : rekamMedis.pemeriksaanFisik,
           catatanKeperawatan : rekamMedis.catatanKeperewatan,
           diagnosaPenyakit : rekamMedis.diagnosaPenyakit,
           therapy : rekamMedis.therapy,
           eso : rekamMedis.eso,
           rencanaPemeriksaanPenunjang : rekamMedis.rencanaPemeriksaanPenunjang,
           rencanaEdukasi : rekamMedis.rencanaEdukasi,
           rencanaRujukan : rekamMedis.rencanaRujukan
  
        };  

  
        return res.status(200).send(successResponse("Get Rekam Medis by ID Success", { data: modifiedRekamMedis }, 200));  
  
    } catch (error) {  
        res.status(500).json({ msg: error.message });  
    }  
}  

export const getDokterAndPasienById = async (req: Request, res: Response) => {
    try {
        const { dokterId, pasienId } = req.params; // Mengambil ID dokter dan pasien dari parameter URL

        // Mencari dokter berdasarkan ID dan role DOKTER
        const dokter = await userRepository.findOneBy({ id: dokterId, role: UserRole.DOKTER });

        // Mencari pasien berdasarkan ID
        const pasien = await pasienRepository.findOneBy({ id: pasienId });

        // Jika dokter atau pasien tidak ditemukan, kembalikan error
        if (!dokter) {
            return res.status(404).send(errorResponse('Dokter not found', 404));
        }
        if (!pasien) {
            return res.status(404).send(errorResponse('Pasien not found', 404));
        }

        dokter.eTTD = dokter.eTTD ? `${dokter.eTTD.replace(/\\/g, '/')}` : null; // Ganti dengan domain Anda  


        // Mengembalikan data dokter dan pasien dalam satu response
        return res.status(200).send(successResponse("Get Dokter and Pasien Success", {
            data: {
                dokter,
                pasien,
            },
        }, 200));

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: error.message });
    }
};

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
        // keluhan: Joi.string().optional(),  
        ku: Joi.string().optional(),  
        kt: Joi.string().optional(),  
        rpd: Joi.string().optional(),  
        rpo: Joi.string().optional(),  
        rpk: Joi.string().optional(),  
        td: Joi.string().optional(),  
        hr: Joi.string().optional(),  
        rr: Joi.string().optional(),  
        t: Joi.string().optional(),  
        tb: Joi.string().optional(),
        bb: Joi.string().optional(),  
        pemeriksaanFisik: Joi.string().optional(),  
        catatanKeperawatan: Joi.string().optional(),  
        diagnosaPenyakit: Joi.string().optional(),  
        therapy: Joi.string().optional(),  
        eso: Joi.string().optional(),  
        rencanaPemeriksaanPenunjang: Joi.string().optional(),  
        rencanaEdukasi: Joi.string().optional(),  
        rencanaRujukan: Joi.string().optional(),  
        tanggalKunjungan : Joi.date().optional(),
        subjektif: Joi.string().optional(),  



        
    }).validate(input);

    try {
        const body = req.body;
        // const schema = createRekamMedisSchema(req.body);

        // console.log(req.body);  


        // if ('error' in schema) {
        //     return res.status(422).send(validationResponse(schema));
        // }

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id });
      // Validasi role pengguna yang sedang login  
    //   if (!user || user.role !== 'DOKTER' ) {  
    //     return res.status(403).send(errorResponse('Access Denied: Only DOKTER can create Rekam Medis', 403));  
    // }  

    if (!user ) {  
        return res.status(403).send(errorResponse('Access Denied: Not Authorrized', 403));  
    }  


    const dokter = await userRepository.findOneBy({ id: body.Dokter, role: UserRole.DOKTER });  
        if (!dokter) {  
            return res.status(422).send(errorResponse('Invalid Dokter ID: Dokter not found', 422));  
        }  

    const pasien = await pasienRepository.findOneBy({ id: body.pasien });  
    if (!pasien) {  
            return res.status(422).send(errorResponse('Invalid Pasien ID: Pasien not found', 422));  
        }  

        //preparing for repeater input
        // const newAutonamnesisRekamMedis = new autonamnesisRekamMedis()
        // newAutonamnesisRekamMedis.ku = body.ku
        // newAutonamnesisRekamMedis.kt = body.kt
        // newAutonamnesisRekamMedis.rpd = body.rpd
        // newAutonamnesisRekamMedis.rpo = body.rpo
        // newAutonamnesisRekamMedis.rpk = body.rpk
        // await autonamnesisRekamMedisRepository.save(newAutonamnesisRekamMedis)

        //preparing for repeater input
        // const newObjektifRekamMedis = new objektifRekamMedis()
        // newObjektifRekamMedis.td = body.td
        // newObjektifRekamMedis.hr = body.hr
        // newObjektifRekamMedis.rr = body.rr
        // newObjektifRekamMedis.t = body.t
        // newObjektifRekamMedis.tb = body.tb
        // newObjektifRekamMedis.bb = body.bb
        // newObjektifRekamMedis.pemeriksaanFisik = body.pemeriksaanFisik
        // newObjektifRekamMedis.catatanKeperewatan = body.catatanKeperewatan
        // await objekRekamMedisRepository.save(newObjektifRekamMedis)

        //preparing for repeater input
        // const newAssessmentRekamMedis = new assessmentRekamMedis()
        // newAssessmentRekamMedis.diagnosaPenyakit = body.diagnosaPenyakit
        // await assessmentRekamMedisRepository.save(newAssessmentRekamMedis)

        //preparing for repeater input
        // const newPlanningRekamMedis = new planningRekamMedis()
        // newPlanningRekamMedis.therapy = body.therapy
        // newPlanningRekamMedis.eso = body.eso
        // newPlanningRekamMedis.rencanaPemeriksaanPenunjang = body.rencanaPemeriksaanPenunjang
        // newPlanningRekamMedis.rencanaEdukasi = body.Edukasi
        // newPlanningRekamMedis.rencanaRujukan = body.rencanaRujukan
        // await planningRekamMedisRepository.save(newPlanningRekamMedis)

        // Membuat entitas pasien baru
        const newRekamMedis = new RiwayatPasien();
        newRekamMedis.Dokters = dokter; // Menggunakan objek dokter  
        newRekamMedis.Pasiens = pasien;
        // newRekamMedis.lamaPenyakit = body.lamaPenyakit
        // newRekamMedis.lain_lain = body.lain_lain
        // newRekamMedis.waktuPermeriksaan = body.waktuPermeriksaan
        // newRekamMedis.fisik = body.fisik
        // newRekamMedis.lain_lainHasilPemeriksaan = body.lain_lainHasilPemeriksaan
        // newRekamMedis.laboratorium = body.laboratorium
        // newRekamMedis.radiologi = body.radiologi
        // newRekamMedis.keadaanKeluarRS = body.keadaanKeluarRS
        // newRekamMedis.prognosa = body.prognosa
        // newRekamMedis.kapanPenyakitDahulu = body.kapanPenyakitDahulu
        // newRekamMedis.pengobatan = body.pengobatan
        // newRekamMedis.faktorEtimologi = body.faktorEtimologi
        // newRekamMedis.diagnosaAkhir = body.diagnosaAkhir
        // newRekamMedis.masalahDihadapi = body.masalahDihadapi
        // newRekamMedis.konsultasi = body.konsultasi
        // newRekamMedis.pengobatanTindakan = body.pengobatanTindakan
        // newRekamMedis.perjalananPeyakit = body.perjalananPeyakit
        // newRekamMedis.sebabMeninggal = body.sebabMeninggal
        // newRekamMedis.usulTidakLanjut = body.sebabMeninggal
        newRekamMedis.statusPeminjaman = StatusRM.TERSEDIA
        newRekamMedis.tanggalKunjungan = body.tanggalKunjungan
        newRekamMedis.subjektif = body.subjektif
        // newRekamMedis.keluhan = body.keluhan
        newRekamMedis.ku = body.ku
        newRekamMedis.kt = body.kt
        newRekamMedis.rpd = body.rpd
        newRekamMedis.rpo = body.rpo
        newRekamMedis.rpk = body.rpk
        newRekamMedis.td = body.td
        newRekamMedis.hr = body.hr
        newRekamMedis.rr = body.rr
        newRekamMedis.t = body.t
        newRekamMedis.tb = body.tb
        newRekamMedis.bb = body.bb
        newRekamMedis.pemeriksaanFisik = body.pemeriksaanFisik
        newRekamMedis.catatanKeperewatan = body.catatanKeperawatan
        newRekamMedis.diagnosaPenyakit = body.diagnosaPenyakit
        newRekamMedis.therapy = body.therapy
        newRekamMedis.eso = body.eso
        newRekamMedis.rencanaPemeriksaanPenunjang = body.rencanaPemeriksaanPenunjang
        newRekamMedis.rencanaEdukasi = body.Edukasi
        newRekamMedis.rencanaRujukan = body.rencanaRujukan

        // newRekamMedis.autonamnesis = newAutonamnesisRekamMedis
        // newRekamMedis.objekRekamMedis = newObjektifRekamMedis
        // newRekamMedis.assessment = newAssessmentRekamMedis
        // newRekamMedis.planning = newPlanningRekamMedis

        await riwayatPasienRepository.save(newRekamMedis);

        return res.status(200).send(successResponse("Create Rekam Medis Success", {
            data: newRekamMedis

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
        // keluhan :  Joi.string().optional(), 
        ku: Joi.string().optional(),  
        kt: Joi.string().optional(),  
        rpd: Joi.string().optional(),  
        rpo: Joi.string().optional(),  
        rpk: Joi.string().optional(),  
        td: Joi.string().optional(),  
        hr: Joi.string().optional(),  
        rr: Joi.string().optional(),  
        t: Joi.string().optional(),  
        tb: Joi.string().optional(),
        bb: Joi.string().optional(),  
        pemeriksaanFisik: Joi.string().optional(),  
        catatanKeperawatan: Joi.string().optional(),  
        diagnosaPenyakit: Joi.string().optional(),  
        therapy: Joi.string().optional(),  
        eso: Joi.string().optional(),  
        rencanaPemeriksaanPenunjang: Joi.string().optional(),  
        rencanaEdukasi: Joi.string().optional(),  
        rencanaRujukan: Joi.string().optional(),  
        tanggalKunjungan : Joi.date().optional(),
        subjektif: Joi.string().optional(),  


    }).validate(input);

    try {
        const body = req.body
        const id = req.params.id;
        const pasienId = id
        // const schema = updateRekamMedisChema(req.body)
        
        // if ('error' in schema) {
        //     return res.status(422).send(validationResponse(schema))
        // }

        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces) {
            return res.status(200).send(successResponse('Update User is Not Authorized', { data: userAcces }))
        }

        // if (!userAcces || userAcces.role !== 'DOKTER' ) {  
        //     return res.status(403).send(errorResponse('Access Denied: Only DOKTER can update pasien', 403));  
        // }  

      
    
        const dokter = await userRepository.findOneBy({ id: body.Dokter, role: UserRole.DOKTER });  
            if (!dokter) {  
                return res.status(422).send(errorResponse('Invalid Dokter ID: Dokter not found or not authorized', 422));  
            }  
        
        const pasien = await pasienRepository.findOneBy({ id: body.pasien });  
        if (!pasien) {  
                    return res.status(422).send(errorResponse('Invalid Pasien ID: Pasien not found', 422));  
                }  
    


        const updateRekamMedis = await riwayatPasienRepository.findOneBy({ id });
        updateRekamMedis.Dokters = dokter; // Menggunakan objek dokter  
        updateRekamMedis.Pasiens = pasien
        // updateRekamMedis.lamaPenyakit = body.lamaPenyakit
        // updateRekamMedis.lain_lain = body.lain_lain
        // updateRekamMedis.waktuPermeriksaan = body.waktuPermeriksaan
        // updateRekamMedis.fisik = body.fisik
        // updateRekamMedis.lain_lainHasilPemeriksaan = body.lain_lainHasilPemeriksaan
        // updateRekamMedis.laboratorium = body.laboratorium
        // updateRekamMedis.radiologi = body.radiologi
        // updateRekamMedis.keadaanKeluarRS = body.riwayatAlergi
        // updateRekamMedis.prognosa = body.prognosa
        // updateRekamMedis.kapanPenyakitDahulu = body.kapanPenyakitDahulu
        // updateRekamMedis.pengobatan = body.pengobatan
        // updateRekamMedis.faktorEtimologi = body.faktorEtimologi
        // updateRekamMedis.diagnosaAkhir = body.diagnosaAkhir
        // updateRekamMedis.masalahDihadapi = body.masalahDihadapi
        // updateRekamMedis.konsultasi = body.konsultasi
        // updateRekamMedis.pengobatanTindakan = body.pengobatanTindakan
        // updateRekamMedis.perjalananPeyakit = body.perjalananPeyakit
        // updateRekamMedis.sebabMeninggal = body.sebabMeninggal
        // updateRekamMedis.usulTidakLanjut = body.sebabMeninggal
        updateRekamMedis.tanggalKunjungan = body.tanggalKunjungan
        updateRekamMedis.subjektif = body.subjektif
        // updateRekamMedis.keluhan = body.keluhan
        updateRekamMedis.ku = body.ku
        updateRekamMedis.kt = body.kt
        updateRekamMedis.rpd = body.rpd
        updateRekamMedis.rpo = body.rpo
        updateRekamMedis.rpk = body.rpk
        updateRekamMedis.td = body.td
        updateRekamMedis.hr = body.hr
        updateRekamMedis.rr = body.rr
        updateRekamMedis.t = body.t
        updateRekamMedis.tb = body.tb
        updateRekamMedis.bb = body.bb
        updateRekamMedis.pemeriksaanFisik = body.pemeriksaanFisik
        updateRekamMedis.catatanKeperewatan = body.catatanKeparawatan
        updateRekamMedis.diagnosaPenyakit = body.diagnosaPenyakit
        updateRekamMedis.therapy = body.therapy
        updateRekamMedis.eso = body.eso
        updateRekamMedis.rencanaPemeriksaanPenunjang = body.rencanaPemeriksaanPenunjang
        updateRekamMedis.rencanaEdukasi = body.Edukasi
        updateRekamMedis.rencanaRujukan = body.rencanaRujukan
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

        // if (!userAcces || userAcces.role !== 'DOKTER' ) {  
        //     return res.status(403).send(errorResponse('Access Denied: Only DOKTER can delete rekam medis', 403));  
        // }  

        if (!userAcces ) {  
            return res.status(403).send(errorResponse('Access Denied: USer Not Authorized', 403));  
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





