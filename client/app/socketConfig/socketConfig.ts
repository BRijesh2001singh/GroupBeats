import { io } from "socket.io-client"
const apiurl=process.env.NEXT_PUBLIC_API_URL;
export const socket=io(apiurl);
