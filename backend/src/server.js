import { app } from "./app.js";
import dotenv from "dotenv"
import connectDB from "./db.js";
dotenv.config({
    path:"./.env"
})
connectDB().then(()=>{
    app.on("error",error=>{
        console.log("error starting the server ",error)
        throw error;
    })
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running at port ${process.env.PORT}`)
    })
})
.catch(err=>{
    console.log("mongo db connection failed ",err)
})