import { IsDate, IsNumber, IsString,IsUppercase } from "class-validator";
import { Entity,OneToMany,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn } from "typeorm";
import { RiwayatPasien } from "./RiwayatPasien";
import { peminjamanRekamMedis } from "./peminjamanRekamMedis";

export enum StatusRM {
    TERSEDIA = 'TERSEDIA',
    DIPINJAM = 'DIPINJAM',
    TerlambatDikembalikan = ' TerlambatDikembalikan',

}

@Entity()
export class Pasien{

    @PrimaryGeneratedColumn('uuid')
    public id : string

    @Column({
        default: null,
        nullable: true,
        type :"varchar",
        length : 10
    })
    @IsString()
    public nomerRM: string


    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public namaPasien: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public namaLengkap: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public jenisKelamin: string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsDate()
    public tanggalLahir: Date

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public tempatLahir: String


    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public noBPJS_KIS: string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public kelurahan_desa: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public kecamatan: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public kabupaten: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public riwayatAlergi: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public riwayatPenyakit: string

    @Column({
        type: 'enum',
        enum: StatusRM,
        })
        @IsString()
        public statusPeminjaman: StatusRM



    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

    @OneToMany (() => RiwayatPasien, (RiwayatPasiens) => RiwayatPasiens.Pasiens)
    public RiwayatPasiens : RiwayatPasien

    @OneToMany (() => peminjamanRekamMedis, (peminjamanRekamMedis) => peminjamanRekamMedis.RiwayatPasiens)
    public peminjamanRekamMedis : peminjamanRekamMedis

 
}