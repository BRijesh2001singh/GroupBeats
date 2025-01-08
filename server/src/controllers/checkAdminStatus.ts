import prisma from "../DB/config";
import { Request,Response } from "express";
export const checkAdminStatus=async(req:Request,res:Response):Promise<any>=>{
   const {id,roomId}=req.body;
try {
     const findUser=await prisma.user.findUnique({
         where:{
             id:id,
             roomId:roomId
         }
     })
     if(!findUser){
           return res.status(404).json({message:"user dont exists"})
     }
     return res.status(200).json({message:"User is Admin of this room   .",adminStatus:true});
} catch (error) {
    console.log("Server error",error);   
    return res.status(500).json({messsage:"Server error"});
}

}