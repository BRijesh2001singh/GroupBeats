import prisma from "../DB/config";
import { Request,Response } from "express";
const updateRoomData=async(req:Request,res:Response):Promise<any>=>{
  try {
      const {id,roomId}=req.body;
          const findUser=await prisma.user.findUnique({
              where:{
                  id:id
              }
          })
          if(!findUser){
                return res.status(404).json({message:"user dont exists"})
          }
          const updateUser=await prisma.user.update({
              where:{
                  id:id
              },
              data:{
                  roomId:roomId
              }
          });
          return res.status(200).json({message:"User data updated.",updateUser});
  } catch (error) {
    console.log("error",error);
    res.status(500).json({message:"Server error"});
  }

}
export default updateRoomData;