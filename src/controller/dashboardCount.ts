import { AppDataSource } from "../data-source";
import { Request, Response } from "express";

import { Pasien } from "../model/Pasien";
import { RiwayatPasien, StatusRM } from "../model/RiwayatPasien";
import { User } from "../model/User";
import { peminjamanRekamMedis } from "../model/peminjamanRekamMedis";

const userRepository = AppDataSource.getRepository(User);
const pasienRepository = AppDataSource.getRepository(Pasien);
const riwayatPasienRepository = AppDataSource.getRepository(RiwayatPasien);
const peminjamanRekamMedisRepository = AppDataSource.getRepository(peminjamanRekamMedis);

const countRekamMedis = async () => {
  try {
    const total = await riwayatPasienRepository.count();
    return { totalRekamMedis: total };
  } catch (error) {
    console.error("Error counting rekam medis:", error);
    throw new Error("Failed to count rekam medis");
  }
};

const countIncompleteRekamMedis = async () => {
  try {
    const rekamMedisList = await AppDataSource.getRepository(
      RiwayatPasien
    ).find();

    const totalIncompleteRecords = rekamMedisList.filter((rekamMedis) => {
      return Object.entries(rekamMedis).some(
        ([key, value]) => value === null && key !== "deletedAt"
      );
    }).length;

    return { totalIncompleteRekamMedis: totalIncompleteRecords };
  } catch (error) {
    console.error("Error counting incomplete rekam medis:", error);
    throw new Error(
      "Terjadi kesalahan saat menghitung rekam medis yang tidak lengkap."
    );
  }
};

const countPeminjamanRekamMedisByStatusDipinjam = async () => {
  try {
    const total = await peminjamanRekamMedisRepository
      .createQueryBuilder("peminjaman")
      .leftJoinAndSelect("peminjaman.Dokters", "dokter")
      .leftJoinAndSelect("peminjaman.RiwayatPasiens", "riwayatPasien")
      .leftJoinAndSelect("riwayatPasien.Pasiens", "Pasien")
      .where("riwayatPasien.statusPeminjaman = :status", {
        status: StatusRM.DIPINJAM,
      })
      .getCount();

    return { totalPeminjamanDipinjam: total };
  } catch (error) {
    console.error("Error counting peminjaman rekam medis:", error);
    throw new Error(
      "Terjadi kesalahan saat menghitung peminjaman rekam medis."
    );
  }
};

const countPeminjamanRekamMedisByStatusTerlambat = async () => {
  try {
    const total = await peminjamanRekamMedisRepository
      .createQueryBuilder("peminjaman")
      .leftJoinAndSelect("peminjaman.Dokters", "dokter")
      .leftJoinAndSelect("peminjaman.RiwayatPasiens", "riwayatPasien")
      .leftJoinAndSelect("riwayatPasien.Pasiens", "Pasien")
      .where("riwayatPasien.statusPeminjaman = :status", {
        status: StatusRM.TERLAMBATDIKEMBALIKAN,
      })
      .getCount();

    return { totalPeminjamanTerlambat: total };
  } catch (error) {
    console.error("Error counting peminjaman rekam medis:", error);
    throw new Error(
      "Terjadi kesalahan saat menghitung peminjaman rekam medis."
    );
  }
};

const countPasien = async () => {
  try {
    const total = await pasienRepository.count();
    return { totalPasien: total };
  } catch (error) {
    console.error("Error counting pasien:", error);
    throw new Error("Failed to count pasien");
  }
};

export const getCounts = async (req: Request, res: Response) => {
  try {
    const [
      rekamMedisCount,
      incompleteRekamMedisCount,
      peminjamanDipinjamCount,
      peminjamanTerlambatCount,
      pasienCount,
    ] = await Promise.all([
      countRekamMedis(),
      countIncompleteRekamMedis(),
      countPeminjamanRekamMedisByStatusDipinjam(),
      countPeminjamanRekamMedisByStatusTerlambat(),
      countPasien(),
    ]);

    const response = {
      ...rekamMedisCount,
      ...incompleteRekamMedisCount,
      ...peminjamanDipinjamCount,
      ...peminjamanTerlambatCount,
      ...pasienCount,
    };

    return res.status(200).json({
      message: "Total counts",
      data: response,
    });
  } catch (error) {
    console.error("Error fetching counts:", error);
    return res.status(500).json({ message: "Failed to fetch counts" });
  }
};
