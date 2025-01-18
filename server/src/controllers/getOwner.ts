import { Request, Response } from "express";
import prisma from "../DB/config";
export const getOwner=async(req:Request,res:Response):Promise<any>=>{
const {id}=req.params;
try {
    const findUser=await prisma.user.findFirst({
        where:{
            roomId:id
        }
    })
    if (!findUser) {
        return res.status(404).json({ message: "No users found for this roomId" });
    }
    res.status(200).json({owner:findUser.name})
} catch (error) {
    console.error(error);
    res.status(500).json({message:"Server Error"});
}
}