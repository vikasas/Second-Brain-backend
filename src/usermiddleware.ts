
import dotenv from 'dotenv'
import jwt from "jsonwebtoken";
import{ Request , Response , NextFunction } from "express";

dotenv.config()

export function usermiddleware(req : Request , res : Response, next : NextFunction){
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(403).json({
            message: "Please sign in",
        });
    }
    try{
        const decode = jwt.verify(token as string , process.env.JWT_SECRET!) as {id : string};
        if(decode){
            req.id = decode.id;
            next();
        }
    }catch(e){
        res.status(403).json({
            message : "Please sign in"
        })
    }

}