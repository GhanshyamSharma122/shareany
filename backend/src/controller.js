import { Storage ,timeStore} from "./model.js"
import { uploadOnCloudinary, generateUploadSignature } from "./cloudinary.js"
import { cleanUP } from "./services/cleanup.service.js"
const getSignature=async (req,res) => {
    return res.status(200).json({
        status:200,
        ...generateUploadSignature(),
    })
}
const getData=async (req,res) => {
    const getCurrentDate=Date.now()
    const prevCleanDate=await timeStore.find({})
    if(prevCleanDate[0]){
        const diff=getCurrentDate-prevCleanDate[0].createdAt;
        if(diff>=24*60*60*1000){
            cleanUP().catch(console.error);
            await timeStore.findByIdAndDelete(prevCleanDate[0]._id)
            await timeStore.create({});        }
    }else{
        await timeStore.create({})
    }
    const keyword = req.params.key.toLowerCase();
    const data=await Storage.findOne({
        keyword,
    })
    // console.log('Looking for keyword:', keyword)
    // console.log('Found data:', data)
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
const sendData = async (req, res) => {
    const getCurrentDate=Date.now()
    const prevCleanDate=await timeStore.find({})
    if(prevCleanDate[0]){
        const diff=getCurrentDate-prevCleanDate[0].createdAt;
        if(diff>=24*60*60*1000){
            cleanUP().catch(console.error);
            await timeStore.findByIdAndDelete(prevCleanDate[0]._id)
            await timeStore.create({});
        }
    }else{
        await timeStore.create({})
    }
    const { text } = req.body;
    const files = [];
    // handling the files
    if (req.files && Array.isArray(req.files.files)) {
        for (let i of req.files.files) {
            console.log('Uploading file:', i?.originalname);
            const tempupload = await uploadOnCloudinary(i?.buffer);
            if (tempupload && tempupload.url) {
                files.push(tempupload.url);
            } else {
                console.error('Cloudinary upload failed for', i?.originalname);
            }
        }
    } else if (req.files && req.files.files) {
        const i = req.files.files;
        console.log('Uploading file:', i?.originalname);
        const tempupload = await uploadOnCloudinary(i?.buffer);
        if (tempupload && tempupload.url) {
            files.push(tempupload.url);
        } else {
            console.error('Cloudinary upload failed for', i?.originalname);
        }
    }
    // URLs from direct browser -> Cloudinary uploads (JSON body);
    // only accept files that live in our own Cloudinary account
    if (Array.isArray(req.body?.files)) {
        const ownCloudPrefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;
        for (const url of req.body.files) {
            if (typeof url === "string" && url.startsWith(ownCloudPrefix)) {
                files.push(url);
            } else {
                console.error('Rejected non-owned file url:', url);
            }
        }
    }

    try {
        const createdStore = await Storage.create({
            text,
            files,
        });
        
        if (!createdStore) {
            return res.status(400).json({
                status: 400,
                message: "Error creating the store",
            });
        }
        const keyword=(await createdStore.getKeyword()).toLowerCase();
        createdStore.keyword=keyword;
        await createdStore.save();
        
        return res.status(200).json({
            status: 200,
            message: "Created successfully",
            createdStore
        });
    } catch (err) {
        console.error('Error in sendData:', err);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: err.message || err
        });
    }
}
export {
    getData,
    sendData,
    getSignature
}
