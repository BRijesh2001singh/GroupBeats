import { Router } from "express";
import createUser from "../controllers/createUser";
import updateRoomData from "../controllers/updateRoomData";
import { checkAdminStatus } from "../controllers/checkAdminStatus";
const router=Router();
router.post("/api/signup",createUser);
router.post("/api/updateroom",updateRoomData);
router.post("/api/checkadminstatus",checkAdminStatus);
router.get("/api/health",async(req,res)=>{
    res.send("HEALTH STATUS:OK")
})
export default router;