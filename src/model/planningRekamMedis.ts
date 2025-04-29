import { Entity,OneToMany,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { IsDate, IsNumber, IsString,IsUppercase } from "class-validator";
import { RiwayatPasien } from "./RiwayatPasien";

export enum Edukasi {
    POLAMAKAN = 'POLAMAKAN',
    POLAAKTIFITAS = 'POLAAKTIFITAS',
}

@Entity()
export class planningRekamMedis{

    @PrimaryGeneratedColumn('uuid')
    public id : string

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

        //preparing for repeater input


    // @OneToMany(() => RiwayatPasien,(rekamMedis) => rekamMedis.planning)
    // public rekamMedis : RiwayatPasien



}