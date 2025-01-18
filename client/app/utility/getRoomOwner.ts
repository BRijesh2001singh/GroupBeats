import axios from "axios"

export const getRoomOwner=async(roomid:string)=>{
        const apiurl = process.env.NEXT_PUBLIC_API_URL;
   try {
     const res=await axios.get(`${apiurl}/api/getowner/${roomid}`)
     if(res&&res.data){
        return res.data.owner;
     }
   } catch (error) {
    console.log(error);
    return null;
   }
  
}