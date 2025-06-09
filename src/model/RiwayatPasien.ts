import { IsDate, IsNumber, IsString,IsUppercase } from "class-validator";
import { Entity,OneToMany,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { Pasien } from "./Pasien";
import { User } from "./User";
import { peminjamanRekamMedis } from "./peminjamanRekamMedis";
import { autonamnesisRekamMedis } from "./AutonamnesisRekamMedis";
import { objektifRekamMedis } from "./objektiRekamMedis";
import { assessmentRekamMedis } from "./AssessmentRekamMedis";
import { planningRekamMedis } from "./planningRekamMedis";

export enum StatusRM {
    TERSEDIA = 'TERSEDIA',
    DIPINJAM = 'DIPINJAM',
    TERLAMBATDIKEMBALIKAN = 'TERLAMBATDIKEMBALIKAN',

}

export enum Edukasi {
    POLAMAKAN = 'POLAMAKAN',
    POLAAKTIFITAS = 'POLAAKTIFITAS',
}



@Entity()
export class RiwayatPasien{

    @PrimaryGeneratedColumn('uuid')
    public id : string

    
    @Column({
        type: 'enum',
        enum: StatusRM,
        })
        @IsString()
        public statusPeminjaman: StatusRM

        @Column({
            default: null,
            nullable: true
        })
        @IsDate()
        public tanggalKunjungan: Date

        @Column({
            default: null,
            nullable: true
        })
        @IsString()
        public subjektif: string

        // @Column({
        //     default: null,
        //     nullable: true
        // })
        // @IsString()
        // public keluhan: string
    
    

        @Column({
            default: null,
            nullable: true
        })
        @IsString()
        public ku: string
    
        @Column({
            default: null,
            nullable: true
        })
        @IsString()
        public kt: string
    
        @Column({
            default: null,
            nullable: true
        })
        @IsString()
        public rpd: string
    
        @Column({
            default: null,
            nullable: true
        })
        @IsString()
        public rpo: string
    
    
        @Column({
            default: null,
            nullable: true
        })
        @IsString()
        public rpk: string

        @Column({
            default: null,
            nullable: true
        })
        @IsString()
        public td: string
    
        @Column({
            default: null,
            nullable: true
        })
        @IsString()
        public hr: string
    
        @Column({
            default: null,
            nullable: true
        })
        @IsString()
        public rr: string
    
    
        @Column({
            default: null,
            nullable: true
        })
        @IsString()
        public t: string
    
        @Column({
            default: null,
            nullable: true
        })
        @IsString()
        public tb: string
    
        @Column({
            default: null,
            nullable: true
        })
        @IsString()
        public bb: string
    
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
        public catatanKeperewatan: string

        @Column({
            default: null,
            nullable: true
        })
        @IsString()
        public diagnosaPenyakit: string


         @Column({
                default: null,
                nullable: true
            })
            @IsString()
            public therapy: string
        
            @Column({
                default: null,
                nullable: true
            })
            @IsString()
            public eso: string
        
            @Column({
                default: null,
                nullable: true
            })
            @IsString()
            public rencanaPemeriksaanPenunjang: string
        
            @Column({
                 type: 'enum',
                enum: Edukasi,
            })
            @IsString()
            public rencanaEdukasi: Edukasi
        
            @Column({
                default: null,
                nullable: true
            })
            @IsString()
            public rencanaRujukan: string
    


  



    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    // @DeleteDateColumn()
    // public deletedAt: Date

    @ManyToOne (() => Pasien, (Pasiens) => Pasiens.RiwayatPasiens)
    @JoinColumn({name: "pasienId"})
    public Pasiens : Pasien

    @ManyToOne (() => User, (Dokters) => Dokters.RiwayatPasiens)
    @JoinColumn()
    public Dokters : User

    @OneToMany (() => peminjamanRekamMedis, (peminjamanRekamMedis) => peminjamanRekamMedis.RiwayatPasiens)
    public peminjamanRekamMedis : peminjamanRekamMedis








    
    

 
}