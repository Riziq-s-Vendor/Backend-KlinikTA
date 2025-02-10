import {io} from "../../../index";
import { Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { User } from "../../../model/User";
import { Pasien } from "../../../model/Pasien";
import { RiwayatPasien,StatusRM } from "../../../model/RiwayatPasien";
import { In,LessThan,Not,IsNull } from "typeorm";




const userRepository = AppDataSource.getRepository(User);

const pasienRepository = AppDataSource.getRepository(Pasien);

const riwayatPasienRepository = AppDataSource.getRepository(RiwayatPasien);



export const checkRekamMedisStatus = async (req: Request, res: Response) => {
  try {
    const rekamMedisList = await riwayatPasienRepository.find({
      where: { 
        statusPeminjaman: StatusRM.DIPINJAM,
        peminjamanRekamMedis: {
          tanggalDikembalikan: LessThan(new Date())
        }
      },
      relations: ["peminjamanRekamMedis"],
      select: ["id", "statusPeminjaman"]
    });

    const sekarangUTC = new Date().toISOString();
    
    // [FIX] Akses relasi yang benar (array -> ambil index 0)
    const idsToUpdate = rekamMedisList
      .filter(rekamMedis => {
        const peminjaman = rekamMedis.peminjamanRekamMedis[0]; // Ambil elemen pertama
        if (!peminjaman) return false;
        
        const tglKembali = peminjaman.tanggalDikembalikan;
        if (!tglKembali || isNaN(new Date(tglKembali).getTime())) {
          console.warn(`Invalid date for RM ${rekamMedis.id}:`, tglKembali);
          return false;
        }
        
        return new Date(tglKembali).toISOString() < sekarangUTC;
      })
      .map(rekamMedis => rekamMedis.id);

    if (idsToUpdate.length > 0) {
      await riwayatPasienRepository.update(
        { id: In(idsToUpdate) },
        { statusPeminjaman: StatusRM.TERLAMBATDIKEMBALIKAN }
      );

      io.emit('notification', {
        message: `${idsToUpdate.length} rekam medis terlambat`,
        details: idsToUpdate
      });
    }

    const updatedRecords = await riwayatPasienRepository.find({
      where: { id: In(idsToUpdate) },
      relations: ["peminjamanRekamMedis"]
    });

    res.status(200).send({
      message: "Pemeriksaan selesai",
      totalTerupdate: idsToUpdate.length,
      rekamMedisList: updatedRecords
    });
    
  } catch (error) {
    console.error('[ERROR] checkRekamMedisStatus:', error);
    res.status(500).send({ 
      message: "Gagal memeriksa status",
      error: process.env ? error.message : null
    });
  }
};

  