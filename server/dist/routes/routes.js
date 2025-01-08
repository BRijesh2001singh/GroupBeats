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
const express_1 = require("express");
const createUser_1 = __importDefault(require("../controllers/createUser"));
const updateRoomData_1 = __importDefault(require("../controllers/updateRoomData"));
const checkAdminStatus_1 = require("../controllers/checkAdminStatus");
const router = (0, express_1.Router)();
router.post("/api/signup", createUser_1.default);
router.post("/api/updateroom", updateRoomData_1.default);
router.post("/api/checkadminstatus", checkAdminStatus_1.checkAdminStatus);
router.get("api/health", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("HEALTH STATUS:OK");
}));
exports.default = router;
