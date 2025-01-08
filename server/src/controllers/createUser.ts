import prisma from "../DB/config";
import { Request,Response } from "express";
 const createUser=async(req:Request,res:Response):Promise<any>=>{
try {
        const {name,email}=req.body;
        const findUser=await prisma.user.findUnique({
            where:{
                email:email
            }
        })
        if(findUser){
              return res.status(200).json({message:"USER ALREADY EXIST!",id:findUser.id})
        }
        const newUser=await prisma.user.create({
            data:{
                name:name,
                email:email
            }
        })
        return res.status(201).json({message:"User created.",id:newUser.id})
} catch (error) {
    return res.status(500).json({mesage:"Server Error!"})
}
}
export default createUser;