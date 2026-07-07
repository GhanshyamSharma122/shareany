// local development entry point (npm run dev / npm start);
// Vercel ignores this file and uses api/index.js instead
import { app } from "./app.js";
import dotenv from "dotenv"
import connectDB from "./db.js";
dotenv.config({
    path:"./.env"
})
connectDB().then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running at port ${process.env.PORT||8000}`)
    })
})
.catch(err=>{
    console.log("mongo db connection failed ",err)
})
