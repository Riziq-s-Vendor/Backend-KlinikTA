import { Request, Response } from "express";
import { User } from "../../model/User";
import { AppDataSource } from "../../data-source";
import { JwtPayload } from "../../types/JwtPayload";
import { createJwtToken } from "../../utils/createJwtToken";
import bcrypt from 'bcryptjs';

const { successResponse, errorResponse, validationResponse } = require('../../utils/response')

const userRepository = AppDataSource.getRepository(User)


export const fetch = async (req: Request, res: Response) => {
    try {
        const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

            return res.status(200).send(successResponse('User Authorized', { data: user }, 200))

    } catch (error) {
        return res.status(400).send(errorResponse(error, 400))
    }
}


export const login = async (req: Request, res: Response) => {
    try {
        const { userName,password } = req.body

        const user = await userRepository.findOne({
            where: {
                userName: userName,
            }
        })

        if (!user) {
            return res.status(409).send(errorResponse('Incorect userName or password ', 409))
        }


              // Verifikasi password
              const isPasswordValid = await bcrypt.compare(password, user.password);
              if (!isPasswordValid) {
                  return res.status(409).send(errorResponse('Incorrect userName or password', 409));
              }


        const jwtPayload: JwtPayload = {
            id: user.id,
            userName: user.userName,
            password : user.password,
            createdAt: user.createdAt,
        }
        console.log(jwtPayload)

        const token = createJwtToken(jwtPayload)
        const data = { user, token }

        return res.status(200).send(successResponse("Login Success", { data: data }, res.statusCode))
    } catch (error) {
        return res.status(400).send(errorResponse(error, 400))
    }
}