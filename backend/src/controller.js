import { Storage } from "./model.js"
import { uploadOnCloudinary } from "./cloudinary.js"
const getData=async (req,res) => {
    const keyword=req?.key 
    const data=await Storage.findOne({
        keyword,
    })
    console.log(data)
    if(data){
        return res
        .status(200)
        .json({
            message:"found",
            status:200,
            data,
        })
    }else{
        return res
        .status(400)
        .json({
            message:'not found',
            status:400,
            data
        })
    }
}
const sendData=async (req,res ) => {
    const {text}=req.body;
    const files=[];
    //handling the files
    if(req.files?.files){
    for(let i of req.files?.files){
        
        const j=i?.path
        console.log(j)
        const tempupload=await uploadOnCloudinary(j)
        console.log(tempupload.url)
        if(tempupload){
            files.push(tempupload.url)
        }
    }
}   
    const createdStore=await Storage.create({
        text,
        files,
    })
    const keyword=await createdStore.getKeyword();
    createdStore.keyword=keyword
    if(!createdStore){
        throw new Error(JSON.stringify({
            status:400,
            message:"error creating the store"
        }))
    }
    return res
    .status(200)
    .json({
        status:200,
        message:"created sucessfully",
        createdStore
    })
}
export {
    getData,
    sendData
}