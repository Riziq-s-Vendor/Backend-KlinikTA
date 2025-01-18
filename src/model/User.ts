import { IsString,IsUppercase } from "class-validator";
import { Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn } from "typeorm";
import bcrypt from 'bcryptjs';

export enum UserRole {
    ADMIN = 'ADMIN',
    PETUGAS = 'PETUGAS',
    DOKTER = 'DOKTER',

}

@Entity()
export class User{

    @PrimaryGeneratedColumn('uuid')
    public id : string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public namaLengkap: string


    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public userName: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public password: string


    @Column({
        type: 'enum',
        enum: UserRole,
    })
    @IsString()
    @IsUppercase()
    public role: UserRole

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public eTTD: string

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public noTelp: string
    

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

    public hashPassword() {
        this.password = bcrypt.hashSync(this.password, 8)
    }

    public checkIfPasswordMatch(unencryptedPassword: string): boolean {
        return bcrypt.compareSync(unencryptedPassword, this.password)
    }
}