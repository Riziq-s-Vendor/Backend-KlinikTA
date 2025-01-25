import { IsDate, IsNumber, IsString,IsUppercase } from "class-validator";
import { Entity,OneToMany,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { RiwayatPasien } from "./RiwayatPasien";
import { User } from "./User";
import { Pasien } from "./Pasien";

@Entity()
export class peminjamanRekamMedis{
    @PrimaryGeneratedColumn('uuid')
    public id : string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public alasanPeminjaman: string

    @Column({
        default: null,
        nullable: true
    })
    @IsDate()
    public tanggalDikembalikan: Date

    
    @ManyToOne (() => Pasien, (RiwayatPasiens) => RiwayatPasiens.peminjamanRekamMedis)
    @JoinColumn()
    public RiwayatPasiens : Pasien

    @ManyToOne (() => User, (Dokters) => Dokters.peminjamanRekamMedis)
    @JoinColumn()
    public Dokters : User





}