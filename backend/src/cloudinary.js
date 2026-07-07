import {v2 as cloudinary} from 'cloudinary';
import dotenv from "dotenv"
dotenv.config({
    path:"./.env"
})
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadOnCloudinary=async(fileBuffer)=>{
    if(!fileBuffer) return null
    try {
        const response=await new Promise((resolve,reject)=>{
            const stream=cloudinary.uploader.upload_stream(
                {resource_type:"auto"},
                (error,result)=>{
                    if(error) reject(error)
                    else resolve(result)
                }
            )
            stream.end(fileBuffer)
        })
        return response
    } catch (error) {
        console.log(error)
        return null
    }
}
// signs upload params for direct browser -> Cloudinary uploads;
// the API secret never leaves the server and the signature expires after 1 hour
const generateUploadSignature=()=>{
    const timestamp=Math.round(Date.now()/1000);
    const signature=cloudinary.utils.api_sign_request(
        {timestamp},
        process.env.CLOUDINARY_API_SECRET
    );
    return {
        timestamp,
        signature,
        apiKey:process.env.CLOUDINARY_API_KEY,
        cloudName:process.env.CLOUDINARY_CLOUD_NAME,
    };
}
const deleteFilesFromCloudinary=async (publicId) => {
    try {
        if(publicId){
           await cloudinary.uploader.destroy(publicId)
        }

    } catch (error) {
        console.log(error)
    }
}
export {uploadOnCloudinary
    ,deleteFilesFromCloudinary
    ,generateUploadSignature
}
