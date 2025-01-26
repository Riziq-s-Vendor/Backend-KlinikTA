import { Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import Joi, { required } from "joi";
import { User } from "../../../model/User";
import { encrypt,decrypt } from "../../../utils/CryptoData";
import multer from 'multer';  
import path from 'path';  
  


const { joiPasswordExtendCore } = require('joi-password')
const joiPassword = Joi.extend(joiPasswordExtendCore)
const { successResponse, errorResponse, validationResponse } = require('../../../utils/response')
const userRepository = AppDataSource.getRepository(User)

const storage = multer.diskStorage({    
    destination: (req, file, cb) => {    
        cb(null, 'public/image/eTTDDokter'); // Pastikan folder ini ada    
    },    
    filename: (req, file, cb) => {    
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);    
        cb(null, uniqueSuffix + path.extname(file.originalname));   
    }    
});    
  
export const upload = multer({ storage: storage });   


export const createUser = async (req : Request, res: Response) =>{
    const createUserSchema = (input) => Joi.object({
        namaLengkap : Joi.string().required(),
        userName : Joi.string().required(),
        password : joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .noWhiteSpaces()
        .required(),
        role : Joi.string().required(),
        noTelp : Joi.string().required(),

    }).validate(input);

    try {
        const body = req.body
        const schema = createUserSchema(req.body)
        
        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema))
        }

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id })

       // Validasi role pengguna yang sedang login  
       if (!user || user.role !== 'ADMIN') {  
        return res.status(403).send(errorResponse('Access Denied: Only ADMIN can create users', 403));  
    }  

        const NewUser = new User()
        NewUser.namaLengkap = body.namaLengkap
        NewUser.userName = body.userName
        NewUser.password = encrypt(body.password); // Menggunakan fungsi encrypt  
        NewUser.role = body.role
        NewUser.noTelp = body.noTelp

        if (req.file) {  
            NewUser.eTTD = req.file.path; // Menyimpan path file  
        }  
        
        await userRepository.save(NewUser)

        console.log(NewUser)
        return res.status(200).send(successResponse("Create User Success", { data: NewUser }, 200))

    }catch(error){
        res.status(500).json({ msg: error.message })
    }
}

export const updateUser = async (req : Request, res: Response) =>{
    const updateUserSchema = (input) => Joi.object({
        namaLengkap: Joi.string().optional(),  
        userName : Joi.string().optional(),
        password : joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .noWhiteSpaces()
        .optional(),
        role : Joi.string().optional(),
        noTelp: Joi.string().optional(),  

    }).validate(input);

    try {
        const body = req.body
        const id = req.params.id;
        const schema = updateUserSchema(req.body)
        
        if ('error' in schema) {
            return res.status(422).send(validationResponse(schema))
        }

        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces || userAcces.role !== 'ADMIN') {  
            return res.status(403).send(errorResponse('Access Denied: Only ADMIN can update users', 403));  
        }  

        const updateUser = await userRepository.findOneBy({ id });
        updateUser.namaLengkap  = body.namaLengkap
        updateUser.userName = body.userName
        updateUser.password = encrypt(body.password);
        updateUser.role = body.role
        updateUser.noTelp = body.noTelp

        if (req.file) {  
            updateUser.eTTD = req.file.path; // Update eTTD if a new file is uploaded  
        }  
  
        await userRepository.save(updateUser)

        console.log(updateUser)
        return res.status(200).send(successResponse("Update User Success", { data: updateUser }, 200))

    }catch(error){
        res.status(500).json({ msg: error.message })
    }



}


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

        if (userAcces.role === 'ADMIN') {  
            const decryptedPassword = decrypt(userAcces.password);  
            userAcces.password = decryptedPassword; // Ganti password dengan yang terdekripsi  
        } 

    
    const dynamicLimit = queryLimit ? parseInt(queryLimit as string) : null;
    const currentPage = page ? parseInt(page as string) : 1; // Convert page to number, default to 1
    const skip = (currentPage - 1) * (dynamicLimit || 0);

    const [data, totalCount] = await queryBuilder
    .skip(skip)
    .take(dynamicLimit || undefined)
    .getManyAndCount();

    if (userAcces.role === 'ADMIN') {  
        data.forEach(user => {  
            user.password = decrypt(user.password); // Dekripsi password untuk setiap user  
        });  
    }  


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
        const id = req.params.id;

        
        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces || userAcces.role !== 'ADMIN') {  
            return res.status(403).send(errorResponse('Access Denied: Only ADMIN can deleted users', 403));  
        }  
        const user = await userRepository.findOne({
            where: { id : id },
        });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (userAcces.role === 'ADMIN') {  
            user.password = decrypt(user.password); // Dekripsi password  
        } 


        

        return res.status(200).send(successResponse("Get User by ID Success", { data: user }, 200));

    }catch(error){
        res.status(500).json({ msg: error.message })
    }
}





export const deleteUser = async (req: Request, res: Response) => {
    try {

        
        const userAcces = await userRepository.findOneBy({ id: req.jwtPayload.id })

        if (!userAcces) {
            return res.status(200).send(successResponse('User is Not Authorized', { data: userAcces }))
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



