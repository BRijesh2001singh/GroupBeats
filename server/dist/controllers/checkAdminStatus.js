"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdminStatus = void 0;
const config_1 = __importDefault(require("../DB/config"));
const checkAdminStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, roomId } = req.body;
    try {
        const findUser = yield config_1.default.user.findUnique({
            where: {
                id: id,
                roomId: roomId
            }
        });
        if (!findUser) {
            return res.status(404).json({ message: "user dont exists" });
        }
        return res.status(200).json({ message: "User is Admin of this room   .", adminStatus: true });
    }
    catch (error) {
        console.log("Server error", error);
        return res.status(500).json({ messsage: "Server error" });
    }
});
exports.checkAdminStatus = checkAdminStatus;
