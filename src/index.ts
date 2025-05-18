import express , {Request , Response} from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { usermiddleware } from "./usermiddleware";
import { linkmodel, usermodel } from "./db";
import bcrypt, { hash } from "bcryptjs";
import { contentmodel } from "./db";
import { hashlink } from "./utils";
import  cors from "cors";
import dotenv from 'dotenv';


dotenv.config()


const app = express();
app.use(express.json());
app.use(cors());

const validateinput = z.object({
    email : z.string().min(5).max(50).email(),
    username : z.string().min(5).max(50),
    password : z.string().min(8).max(20).regex(/[A-z]/ , "Must contain atleast one upper case letter").regex(/[a-z]/ , "Must contain Atleast one lowercase").regex(/[0-9]/, "Must contain atleast one number")
})
type finalval = z.infer<typeof validateinput>

app.post("/api/v1/signup" ,  async function(req : Request , res : Response){
    const parsed = validateinput.safeParse(req.body);
    if(!parsed.success){
        return  res.status(411).json({
            message : "Please Enter the correct Credentials",
            errors: parsed.error.errors,
       })
    }
    const {email ,username , password} : finalval = parsed.data;

try{
    const hashedpassword = await bcrypt.hash(password , 10)
    const user = await usermodel.create({
        email : email,
        username : username,
        password : hashedpassword
    })
    res.status(200).json({
        message : "You are Signed up"
    })
}catch(e){
    res.status(500).json({
        message : "Server error"
    })
}
})

app.post("/api/v1/signin" , async function(req : Request , res : Response){
    const {email , password} : finalval = req.body;
    try{
        const user = await usermodel.findOne({
            email : email
        })
        if (!user) {
            return res.status(403).json({
                message: "The credentials are wrong"
            });
        }
        const passwordmatch = await bcrypt.compare(password , user.password)
    if(user && passwordmatch){
        const token = jwt.sign({
            id : user._id,
            email : email
        },process.env.JWT_SECRET!)
         return res.status(200).json({
            message : "you are signed in",
            token
        })
    }
    }catch(e){
        return res.status(500).json({
            message : "Server error"
        })

    }
})

app.post("/api/v1/content" ,usermiddleware ,  async function(req : Request ,res : Response){
    const {link , type , title , tags , userId } = req.body;
    const userid = req.id;
    try{
        await contentmodel.create({
            link : link,
            type : type,
            title : title,
            tags : [],
            userId : userid
        })
        res.status(200).json({
            message : "The content added Sucessfully"
        })
    }catch(e){
        res.status(500).json({
            message : "Server Error"
        })
    }
})

app.get("/api/v1/content" , usermiddleware ,  async function(req : Request ,res : Response){
    const userid = req.id;
    try{
        const content = await contentmodel.find({
            userId : userid
        }).populate("userId","username")
        res.status(200).json({
            content
        })
    }catch(e){
        res.status(500).json({
            message :"Server Error"
        })
    }
})

app.delete("/api/v1/content/:id" , usermiddleware ,  async function(req : Request ,res : Response){
    const userid = req.id;
    const contentid = req.params.id
    try{
        const content = await contentmodel.findOneAndDelete({
            _id : contentid,
            userId : userid,
        })
        if(content){
            res.status(200).json({
                message : "Content Delted Sucessfully"
            })
        }else{
            res.json({
                message:"content not found"
            })
        }
    }catch(e){
        res.status(500).json({
            message : "Server Error"
        })
    }

})

app.post("/api/v1/share" , usermiddleware , async function(req : Request ,res : Response){
    const { share } = req.body;
    if(share){
        const existinglink = await linkmodel.findOne({
            userId : req.id
        })
        if(existinglink){
            res.json({
            hash : existinglink.hash 
        })
            return
        }
        await linkmodel.create({
            hash : hashlink(10),
            userId : req.id,
        })
        res.json({
            hash 
        })     
    }else{
        await linkmodel.deleteOne({
            userId : req.id,
        })
        res.json({
            message : "link delted"
        })
    }
})



app.get("/api/v1/share/:sharelink" , async function(req : Request , res : Response){
    const hash = req.params.sharelink;
    const link = await linkmodel.findOne({
        hash : hash
    })
    if(!link){
        res.status(411).json({
            message : "link does not exist"
        })
        return
    }
    const content = await contentmodel.find({
        userId : link.userId
    })

    const user = await usermodel.findOne({
        _id : link.userId
    })

    if(!user){
        res.status(411).json({
            message : "user does not exist"
        })
        return
    }
    res.json({
        username : user.username,
        content : content
    })


})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

