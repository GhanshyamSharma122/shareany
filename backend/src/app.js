import express from "express"
import cors from "cors"
import {upload} from "./multer.middleware.js";
import dotenv from "dotenv"
dotenv.config()
const app =express(); 
app.use(cors({
    origin: [
        process.env.CORS_ORIGIN
    ],
    credentials: true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
import { getData } from "./controller.js";
import { sendData } from "./controller.js";

app.get("/:key",getData);
app.post("/",upload.fields([
    {
        name:"files",
        maxCount:3
    }
]),sendData);
export {app}
