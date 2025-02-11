import { IsString,IsUppercase } from "class-validator";
import { Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,DeleteDateColumn, OneToMany } from "typeorm";


@Entity()
export class PushNotification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public property1: string;

  
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public property2: string;
    // Add other properties as needed
}