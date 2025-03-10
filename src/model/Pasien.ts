import { IsDate, IsNumber, IsString,IsUppercase } from "class-validator";
import { Entity,OneToMany,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn } from "typeorm";
import { RiwayatPasien } from "./RiwayatPasien";
import { peminjamanRekamMedis } from "./peminjamanRekamMedis";


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
    public NIK: string

    @Column({
        default: null,
        nullable: true
    })
    @IsNumber()
    public usia: number

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

    @CreateDateColumn()
    createdAt: Date;
    
    // ini aku komen dulu ya mas, dihapus takut kepake di endpoint lain wkwk
    // @OneToMany (() => RiwayatPasien, (RiwayatPasiens) => RiwayatPasiens.peminjamanRekamMedis)
    // public RiwayatPasiens : RiwayatPasien


    // ini relasi biar kalau getpasien by id, rekam medis si pasien juga bisa ditampilin (kontroller getById aku modif dikit juga)
    @OneToMany (() => RiwayatPasien, (RiwayatPasiens) => RiwayatPasiens.Pasiens)
    public RiwayatPasiens : RiwayatPasien[]

 
}
