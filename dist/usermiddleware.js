"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usermiddleware = usermiddleware;
// import { JWT_SECRET } from "./index";
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
function usermiddleware(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(403).json({
            message: "Please sign in",
        });
    }
    try {
        const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decode) {
            req.id = decode.id;
            next();
        }
    }
    catch (e) {
        res.status(403).json({
            message: "Please sign in"
        });
    }
}
