import { Entity,OneToMany,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { IsDate, IsNumber, IsString,IsUppercase } from "class-validator";
import { RiwayatPasien } from "./RiwayatPasien";



@Entity()
export class objektifRekamMedis{

    @PrimaryGeneratedColumn('uuid')
    public id : string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public vitalSignSensorium: string

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

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

    //preparing for repeater input
    // @OneToMany(() => RiwayatPasien,(rekamMedis) => rekamMedis.objekRekamMedis)
    // public rekamMedis : RiwayatPasien


}

