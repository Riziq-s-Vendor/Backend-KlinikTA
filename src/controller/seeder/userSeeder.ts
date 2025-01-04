import { Request, Response } from "express";
import Joi from "joi";
import { AppDataSource } from "../../data-source";
import { User } from "../../model/User";

const { successResponse, errorResponse, validationResponse } = require('../../utils/response')


const userRepository = AppDataSource.getRepository(User)


export const userSeeder = async (req: Request, res: Response) => {
    const user = [
        {userName : "Admin1",password : "Admin123!"},
    ];
    try{
        for (const data of user){
            const newUser = new User()
            newUser.userName = data.userName
            newUser.password =  data.password
            await userRepository.save(newUser)
        }
        console.log("User seeded successfully.");

    }catch(error){
        return res.status(400).send(errorResponse(error,400))
    }
}