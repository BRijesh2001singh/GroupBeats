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
const config_1 = __importDefault(require("../DB/config"));
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email } = req.body;
        const findUser = yield config_1.default.user.findUnique({
            where: {
                email: email
            }
        });
        if (findUser) {
            return res.status(200).json({ message: "USER ALREADY EXIST!", id: findUser.id });
        }
        const newUser = yield config_1.default.user.create({
            data: {
                name: name,
                email: email
            }
        });
        return res.status(201).json({ message: "User created.", id: newUser.id });
    }
    catch (error) {
        return res.status(500).json({ mesage: "Server Error!" });
    }
});
exports.default = createUser;
