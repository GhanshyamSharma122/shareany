import mongoose from "mongoose";
const storageSchema=new mongoose.Schema({
    text:{
        type:String,
        required:false
    },
    files:{
        type:[String]
    },
    keyword:{
        type:String,
        index:true
    },
},{
    timestamps:true
})

storageSchema.methods.getKeyword=async function () {
    let randomString = Math.random().toString(36).substring(2, 15);
    let check=await Storage.findOne({keyword:randomString});
    while(check){
        randomString = Math.random().toString(36).substring(2, 15);
        check=await this.findOne({keyword:randomString});
    }
    return randomString
}
export const Storage=mongoose.model("Storage",storageSchema);
const timeStoreSchema=new mongoose.Schema({
},{timestamps:true})
export const timeStore=mongoose.model("TimeStore",timeStoreSchema);