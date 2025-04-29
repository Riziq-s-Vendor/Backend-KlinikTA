import { IsNumber, IsString,IsUppercase,IsDate } from "class-validator";
import { Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn, OneToMany } from "typeorm";



@Entity()
export class logActivity{
    @PrimaryGeneratedColumn('uuid')
    public id : string

    @Column({
        default: null,
        nullable: true
    })
    @IsNumber()
    public no: number

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public nomerRM: string

    
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



    @Column({
        default: null,
        nullable: true
    })
    @IsDate()
    public waktu: Date

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public Petugas: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public Dokter: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public Aksi: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public Deskripsi: string


    @CreateDateColumn()
    createdAt: Date;

    
    @UpdateDateColumn()
    public updatedAt: Date

    // @DeleteDateColumn()
    // public deletedAt: Date

}