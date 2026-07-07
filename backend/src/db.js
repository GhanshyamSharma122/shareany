import mongoose from "mongoose";
import { DB_NAME } from "./constansts.js";
// Serverless functions are frozen and reused between invocations, so the
// connection is cached on globalThis to avoid reconnecting on every request.
let cached = globalThis._mongoose;
if (!cached) {
    cached = globalThis._mongoose = { conn: null, promise: null };
}
const connectDB=async () => {
    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            .then((connectioInstance) => {
                console.log(`\n mongodb connected db host ${connectioInstance.connection.host}`)
                return connectioInstance;
            })
    }
    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.log("mongodb connection failed",error)
        throw error;
    }
    return cached.conn;
}
export default connectDB;
