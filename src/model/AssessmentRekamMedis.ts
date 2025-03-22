import { Entity,OneToMany,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { IsDate, IsNumber, IsString,IsUppercase } from "class-validator";
import { RiwayatPasien } from "./RiwayatPasien";



@Entity()
export class assessmentRekamMedis{

    @PrimaryGeneratedColumn('uuid')
    public id : string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public diagnosaPenyakit: string

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

        //preparing for repeater input


    // @OneToMany(() => RiwayatPasien,(rekamMedis) => rekamMedis.assessment)
    // public rekamMedis : RiwayatPasien



}