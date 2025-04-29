import { Entity,OneToMany,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { IsDate, IsNumber, IsString,IsUppercase } from "class-validator";
import { RiwayatPasien } from "./RiwayatPasien";



@Entity()
export class autonamnesisRekamMedis{

    @PrimaryGeneratedColumn('uuid')
    public id : string

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

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    // @DeleteDateColumn()
    // public deletedAt: Date

    //preparing for repeater input
    // @OneToMany(() => RiwayatPasien,(rekamMedis) => rekamMedis.autonamnesis)
    // public rekamMedis : RiwayatPasien


}

