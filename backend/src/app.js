import express from "express"
import cors from "cors"
import {upload} from "./multer.middleware.js";
import dotenv from "dotenv"
import connectDB from "./db.js";
dotenv.config()
const app =express();
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
// On Vercel there is no startup phase, so the DB connection is ensured
// (and cached across warm invocations) before every request.
app.use(async (req,res,next)=>{
    try {
        await connectDB()
        next()
    } catch (error) {
        return res.status(500).json({
            status:500,
            message:"database connection failed"
        })
    }
})
import { getData } from "./controller.js";
import { sendData } from "./controller.js";
import { getSignature } from "./controller.js";
import { cleanUP } from "./services/cleanup.service.js";

// hit daily by the Vercel cron job configured in vercel.json;
// must be registered before the catch-all /:key route
app.get("/__cleanup",async (req,res) => {
    await cleanUP();
    return res.status(200).json({status:200,message:"cleanup done"})
});
// signs direct browser -> Cloudinary uploads; must also come before /:key
app.get("/__signature",getSignature);
app.get("/:key",getData);
app.post("/",upload.fields([
    {
        name:"files",
        maxCount:3
    }
]),sendData);
// return JSON instead of Express's HTML error page (multer size/count
// violations land here; unhandled errors would break the serverless function)
app.use((err,req,res,next)=>{
    console.error(err);
    if(err?.name==="MulterError"){
        return res.status(413).json({
            status:413,
            message:err.code==="LIMIT_FILE_SIZE"
                ?"File too large. Max size: 10MB per file"
                :`Upload error: ${err.code}`
        })
    }
    return res.status(500).json({
        status:500,
        message:"internal server error"
    })
})
export {app}
