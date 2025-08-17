import mongoose from "mongoose";
import { DB_NAME } from "./constansts.js";
const connectDB=async () => {
    try {
        const connectioInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n mongodb connected db host ${connectioInstance.connection.host}`)

    } catch (error) {
        console.log("mongodb connection failed",error)
        process.exit(1);
    }
}
export default connectDB;