import { IsDate, IsNumber, IsString,IsUppercase } from "class-validator";
import { Entity,OneToMany,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn } from "typeorm";
import { RiwayatPasien } from "./RiwayatPasien";


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
    public agama: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public noTelp: string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public BPJS: string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public alamat: string



    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

    @OneToMany (() => RiwayatPasien, (RiwayatPasiens) => RiwayatPasiens.Pasiens)
    public RiwayatPasiens : RiwayatPasien

 
}