import { Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import Joi, { required } from "joi";
import { User } from "../../../model/User";
const { joiPasswordExtendCore } = require('joi-password')
const joiPassword = Joi.extend(joiPasswordExtendCore)

const { successResponse, errorResponse, validationResponse } = require('../../../utils/response')

const userRepository = AppDataSource.getRepository(User)

export const getUser = async(req : Request, res: Response) =>{
    try{
        const {limit: queryLimit, page: page,userName} = req.query
     

        const queryBuilder = userRepository.createQueryBuilder('user')
        .orderBy('user.createdAt', 'DESC')

        if (userName){
            queryBuilder.where('user.userName LIKE :userName', {
                userName: `%${userName}%`
            })
    
        }

        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces) {
            return res.status(200).send(successResponse('User is Not Authorized', { data: userAcces }))
        }

    
    const dynamicLimit = queryLimit ? parseInt(queryLimit as string) : null;
    const currentPage = page ? parseInt(page as string) : 1; // Convert page to number, default to 1
    const skip = (currentPage - 1) * (dynamicLimit || 0);

    const [data, totalCount] = await queryBuilder
    .skip(skip)
    .take(dynamicLimit || undefined)
    .getManyAndCount();


    return res.status(200).send(successResponse('Get User succes',
    { 

    data, 
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / (dynamicLimit || 1)), }, 200))
    
    }catch(error){
        res.status(500).json({ msg: error.message })    
    }
}

export const getUserById =  async (req : Request, res : Response) =>{
    try{
        
        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: userAcces }))
        }

        const id = req.params.id;
        const user = await userRepository
        .createQueryBuilder("user")
        .getOne();

        
        if (!user) {
            return res.status(404).send(errorResponse("User not found", 404));
        }

        return res.status(200).send(successResponse("Get User by ID Success", { data: user }, 200));

    }catch(error){
        res.status(500).json({ msg: error.message })
    }
}

export const createUser = async (req : Request, res: Response) =>{
    const createUserSchema = (input) => Joi.object({
        userName : Joi.string().required(),
        password : joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .noWhiteSpaces()
        .required(),
        role : Joi.string().required()
    }).validate(input);

    try {
        const body = req.body
        const schema = createUserSchema(req.body)
        
        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema))
        }

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!user) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: user }))
        }

        const NewUser = new User()
        NewUser.userName = body.userName
        NewUser.password = body.password
        NewUser.hashPassword()
        NewUser.role = body.role
        await userRepository.save(NewUser)

        console.log(NewUser)
        return res.status(200).send(successResponse("Create User Success", { data: NewUser }, 200))

    }catch(error){
        res.status(500).json({ msg: error.message })
    }
}


export const updateUser = async (req : Request, res: Response) =>{
    const updateUserSchema = (input) => Joi.object({
        userName : Joi.string().required(),
        password : joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .noWhiteSpaces()
        .required(),
        role : Joi.string().required()
    }).validate(input);

    try {
        const body = req.body
        const id = req.params.id;
        const schema = updateUserSchema(req.body)
        
        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema))
        }

        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: userAcces }))
        }

        const updateUser = await userRepository.findOneBy({ id });
        updateUser.userName = body.userName
        updateUser.password = body.password
        updateUser.role = body.role
        await userRepository.save(updateUser)

        console.log(updateUser)
        return res.status(200).send(successResponse("Update User Success", { data: updateUser }, 200))

    }catch(error){
        res.status(500).json({ msg: error.message })
    }



}

export const deleteUser = async (req: Request, res: Response) => {
    try {

        
        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces) {
            return res.status(200).send(successResponse('Add Event is Not Authorized', { data: userAcces }))
        }

        const user = await userRepository.findOneBy({ id: String(req.params.id) })
        if (!user) {
            return res.status(404).send(errorResponse('User not found', 404))
        }

        const deletedUser = await userRepository.remove(user)



        return res.status(200).send(successResponse('Success delete User', { data: user }, 200))
    } catch (error) {
        return res.status(400).send(errorResponse(error, 400))
    }
}



