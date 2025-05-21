import mongoose from "mongoose";
import dotenv from 'dotenv'
const Schema = mongoose.Schema
const ObjectID = mongoose.Types.ObjectId
dotenv.config();

mongoose.connect(process.env.MONGO_URL!)
.then(()=>{
    console.log("connected")
});

 const user = new Schema({
    email : {type : String , unique : true , required : true},
    username : {type : String , required : true},
    password : {type : String , required : true}
})

// const  contenttype = ['image', 'video', 'article', 'audio'];

 const content = new Schema({
    link : {type : String , required : true},
    type : String,
    title : {type : String , required : true},
    tags : [{type : ObjectID , ref : 'Tags' }],
    userId : {type : ObjectID , ref : 'Users' , required : true}
})

 const tags = new Schema({
    title : {type : String , required : true , unique : true}
})


 const links = new Schema({
    hash: { type: String, required: true },
    userId: { type: ObjectID, ref: 'User', required: true },
})

export const usermodel = mongoose.model("Users" , user);
export const contentmodel = mongoose.model("Contents" , content)
export const tagmodel = mongoose.model("Tags" , tags);
export const linkmodel = mongoose.model("Links" , links);