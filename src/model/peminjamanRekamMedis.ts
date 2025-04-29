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
    public tanggalPeminjaman: Date

    @Column({
        default: null,
        nullable: true
    })
    @IsDate()
    public tanggalDikembalikan: Date

    
    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    // @DeleteDateColumn()
    // public deletedAt: Date

    
    @ManyToOne (() => RiwayatPasien, (RiwayatPasiens) => RiwayatPasiens.peminjamanRekamMedis)
    @JoinColumn()
    public RiwayatPasiens : RiwayatPasien

    @ManyToOne (() => User, (Dokters) => Dokters.peminjamanRekamMedis)
    @JoinColumn()
    public Dokters : User





}