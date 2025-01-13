import { IsDate, IsNumber, IsString,IsUppercase } from "class-validator";
import { Entity,OneToMany,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { Pasien } from "./Pasien";


@Entity()
export class RiwayatPasien{

    @PrimaryGeneratedColumn('uuid')
    public id : string

    @Column({
        default : null,
        nullable : true
    })
    @IsNumber()
    public noUrut : number

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public poliklinik: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public namaDoktor: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public petugasAnalisis: string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsDate()
    public tanggalEntry: Date

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public jumlahLengkap: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public jumlahTidakLengkap: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public presentase: string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public keterangan: string

    

    @Column({
        default: null,
        nullable: true
    })
    @IsDate()
    public tanggalBerobat: Date

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public riwayatKeshatan: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public pemeriksaanFisik: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public pengkajianDokter: string

        @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public diagnosa: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public TTDDokter: string


    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

    @ManyToOne (() => Pasien, (Pasiens) => Pasiens.RiwayatPasiens)
    @JoinColumn()
    public Pasiens : Pasien


    
    

 
}