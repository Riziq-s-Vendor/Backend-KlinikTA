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

export const getPasien = async(req : Request, res: Response) =>{
    try{
        const {limit: queryLimit, page: page,namaPasien} = req.query
     

        const queryBuilder = riwayatPasienRepository.createQueryBuilder('RiwayatPasiens')
        .leftJoinAndSelect('RiwayatPasiens.Pasiens', 'Pasien') 
        .orderBy('RiwayatPasiens.createdAt', 'DESC'); 


        if (namaPasien){
            queryBuilder.where('Pasien.namaPasien LIKE :namaPasien', {
                namaPasien: `%${namaPasien}%`
            })
    
        }

        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces) {
            return res.status(200).send(successResponse('User is Not Authorized', { data: userAcces }))
        }

    
    const dynamicLimit = queryLimit ? parseInt(queryLimit as string) : null;
    const currentPage = page ? parseInt(page as string) : 1; // Convert page to number, default to 1
    const skip = (currentPage - 1) * (dynamicLimit || 0);

    const [data, totalCount] = await queryBuilder
    .skip(skip)
    .take(dynamicLimit || undefined)
    .getManyAndCount();


    return res.status(200).send(successResponse('Get Pasien succes',
    { 

    data, 
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / (dynamicLimit || 1)), }, 200))
    
    }catch(error){
        res.status(500).json({ msg: error.message })    
    }
}

export const getPasienById =  async (req : Request, res : Response) =>{
    try{
        const id = req.params.id;

        
        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces) {
            return res.status(200).send(successResponse('user is Not Authorized', { data: userAcces }))
        }
        const pasien = await riwayatPasienRepository.findOne({
            where: { id : id },
            relations : ['Pasiens']
        });

        if (!pasien) {
            return res.status(404).json({ msg: 'Riwayat Pasien tidak ditemukan' });
        }

        return res.status(200).send(successResponse("Get Riwayat Pasien by ID Success", { data: pasien }, 200));

    }catch(error){
        res.status(500).json({ msg: error.message })
    }
}

export const createPasien = async (req: Request, res: Response) => {
    const createPasienSchema = (input) => Joi.object({
        namaPasien: Joi.string().required(),
        jenisKelamin: Joi.string().required(),
        tanggalLahir: Joi.date().required(),
        tempatLahir: Joi.string().required(),
        agama: Joi.string().required(),
        noTelp: Joi.string().required(),
        BPJS: Joi.string().required(),
        alamat: Joi.string().required(),
        noUrut: Joi.number().required(),
        poliklinik: Joi.string().required(),
        namaDoktor: Joi.string().required(),
        petugasAnalisis: Joi.string().required(),
        tanggalEntry: Joi.string().required(),
        jumlahLengkap: Joi.string().required(),
        jumlahTidakLengkap: Joi.string().required(),
        presentase: Joi.string().required(),
        keterangan: Joi.string().required(),
        tanggalBerobat: Joi.date().required(),
        riwayatKeshatan: Joi.string().required(),
        pemeriksaanFisik: Joi.string().required(),
        pengkajianDokter: Joi.string().required(),
        diagnosa: Joi.string().required(),
        TTDDokter: Joi.string().required(),
    }).validate(input);

    try {
        const body = req.body;
        const schema = createPasienSchema(req.body);

        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema));
        }

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id });

        if (!user) {
            return res.status(403).send(successResponse('Add Pasien is Not Authorized', { data: user }));
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
        newPasien.nomerRM = nextNomerRM;
        newPasien.namaPasien = body.namaPasien;
        newPasien.jenisKelamin = body.jenisKelamin;
        newPasien.tanggalLahir = body.tanggalLahir;
        newPasien.tempatLahir = body.tempatLahir;
        newPasien.agama = body.agama;
        newPasien.noTelp = body.noTelp;
        newPasien.BPJS = body.BPJS;
        newPasien.alamat = body.alamat;
        await pasienRepository.save(newPasien);

        // Membuat entitas riwayat pasien baru
        const newRiwayatPasien = new RiwayatPasien();
        newRiwayatPasien.Pasiens = newPasien;
        newRiwayatPasien.noUrut = body.noUrut;
        newRiwayatPasien.poliklinik = body.poliklinik;
        newRiwayatPasien.namaDoktor = body.namaDoktor;
        newRiwayatPasien.petugasAnalisis = body.petugasAnalisis;
        newRiwayatPasien.tanggalEntry = body.tanggalEntry;
        newRiwayatPasien.jumlahLengkap = body.jumlahLengkap;
        newRiwayatPasien.jumlahTidakLengkap = body.jumlahTidakLengkap;
        newRiwayatPasien.presentase = body.presentase;
        newRiwayatPasien.keterangan = body.keterangan;
        newRiwayatPasien.tanggalBerobat = body.tanggalBerobat;
        newRiwayatPasien.riwayatKeshatan = body.riwayatKeshatan;
        newRiwayatPasien.pemeriksaanFisik = body.pemeriksaanFisik;
        newRiwayatPasien.pengkajianDokter = body.pengkajianDokter;
        newRiwayatPasien.diagnosa = body.diagnosa;
        newRiwayatPasien.TTDDokter = body.TTDDokter;
        await riwayatPasienRepository.save(newRiwayatPasien);

        return res.status(200).send(successResponse("Create Pasien Success", {
            data: newPasien,
            riwayatPasien: newRiwayatPasien
        }, 200));

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: error.message });
    }
};


export const updatePasien = async (req : Request, res: Response) =>{
    const updatePasienSchema = (input) => Joi.object({
        nomerRM : Joi.number().optional(),
        namaPasien : Joi.string().optional(),
        jenisKelamin : Joi.string().optional(),
        tanggalLahir : Joi.date().optional(),
        tempatLahir : Joi.string().optional(),
        agama : Joi.string().optional(),
        noTelp : Joi.string().optional(),
        BPJS : Joi.string().optional(),
        alamat : Joi.string().optional(),
        noUrut : Joi.number().optional(),
        poliklinik : Joi.string().optional(),
        namaDoktor : Joi.string().optional(),
        petugasAnalisis : Joi.string().optional(),
        tanggalEntry : Joi.string().optional(),
        jumlahLengkap : Joi.string().optional(),
        jumlahTidakLengkap : Joi.string().optional(),
        presentase : Joi.string().optional(),
        keterangan : Joi.string().optional(),
        tanggalBerobat : Joi.date().optional(),
        riwayatKeshatan : Joi.string().optional(),
        pemeriksaanFisik : Joi.string().optional(),
        pengkajianDokter : Joi.string().optional(),
        diagnosa : Joi.string().optional(),
        TTDDokter : Joi.string().optional(),  
    }).validate(input);

    try {
        const body = req.body
        const id = req.params.id;
        const pasienId = id
        const schema = updatePasienSchema(req.body)
        
        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema))
        }

        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: userAcces }))
        }

        const updatePasien = await pasienRepository.findOneBy({ id });
        updatePasien.namaPasien = body.namaPasien
        updatePasien.jenisKelamin = body.jenisKelamin
        updatePasien.nomerRM = body.nomerRM
        updatePasien.tanggalLahir = body.tanggalLahir
        updatePasien.tempatLahir = body.tempatLahir
        updatePasien.agama = body.agama
        updatePasien.noTelp = body.noTelp
        updatePasien.BPJS = body.BPJS
        updatePasien.alamat = body.alamat
        await pasienRepository.save(updatePasien)

        const updateRiwayatPasien = await riwayatPasienRepository.findOne({
            where : {Pasiens : Equal(id)},
         })
        updateRiwayatPasien.noUrut = body.noUrut
        updateRiwayatPasien.poliklinik = body.poliklinik
        updateRiwayatPasien.namaDoktor = body.namaDoktor
        updateRiwayatPasien.petugasAnalisis = body.petugasAnalisis
        updateRiwayatPasien.tanggalEntry = body.tanggalEntry
        updateRiwayatPasien.jumlahLengkap = body.jumlahLengkap
        updateRiwayatPasien.jumlahTidakLengkap = body.jumlahTidakLengkap
        updateRiwayatPasien.presentase = body.presentase
        updateRiwayatPasien.keterangan = body.keterangan
        updateRiwayatPasien.tanggalBerobat = body.tanggalBerobat
        updateRiwayatPasien.riwayatKeshatan = body.riwayatKeshatan
        updateRiwayatPasien.pemeriksaanFisik = body.pemeriksaanFisik
        updateRiwayatPasien.pengkajianDokter = body.pengkajianDokter
        updateRiwayatPasien.diagnosa = body.diagnosa
        updateRiwayatPasien.TTDDokter = body.TTDDokter
         await riwayatPasienRepository.save(updateRiwayatPasien)

        console.log(updatePasien)
        return res.status(200).send(successResponse("Update Pasien and Riwayat Success", { data: updatePasien,updateRiwayatPasien }, 200))

    }catch(error){
        res.status(500).json({ msg: error.message })
    }



}

export const deletePasien = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;

        // Cek apakah pengguna memiliki akses
        const userAccess = await userRepository.findOneBy({ id: req.jwtPayload.id });
        if (!userAccess) {
            return res.status(403).send(successResponse('Delete Pasien is Not Authorized', { data: userAccess }));
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




