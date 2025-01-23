import { IsDate, IsNumber, IsString,IsUppercase } from "class-validator";
import { Entity,OneToMany,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { Pasien } from "./Pasien";
import { User } from "./User";

export enum Status {
    TERSEDIA = 'TERSEDIA',
    DIKEMBALIKAN = 'DIKEMBALIKAN',
    TerlambatDikembalikan = ' TerlambatDikembalikan',

}


@Entity()
export class RiwayatPasien{

    @PrimaryGeneratedColumn('uuid')
    public id : string


    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public lamaPenyakit: string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public lain_lain: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public waktuPermeriksaan: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public fisik: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public lain_lainHasilPemeriksaan: string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public laboratorium: string

    

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public radiologi: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public keadaanKeluarRS: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public prognosa: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public kapanPenyakitDahulu: string

        @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public pengobatan: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public faktorEtimologi: string


    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public diagnosaAkhir: string


    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public masalahDihadapi: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public konsultasi: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public pengobatanTindakan: string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public perjalananPeyakit: string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public sebabMeninggal: string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public usulTidakLanjut: string

    @Column({
    type: 'enum',
    enum: Status,
    })
    @IsString()
    public statusPeminjaman: Status



    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

    @ManyToOne (() => Pasien, (Pasiens) => Pasiens.RiwayatPasiens)
    @JoinColumn()
    public Pasiens : Pasien

    @ManyToOne (() => User, (Dokters) => Dokters.RiwayatPasiens)
    @JoinColumn()
    public Dokters : User


    
    

 
}