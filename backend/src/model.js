import mongoose from "mongoose";
import { generate } from "random-words";
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
    let randomString = generate({ minLength: 5, maxLength: 5 });
    let check=await Storage.findOne({keyword:randomString});
    while(check){
        randomString = generate({ minLength: 5, maxLength: 5 });
        check=await this.findOne({keyword:randomString});
    }
    return randomString
}
export const Storage=mongoose.model("Storage",storageSchema);
const timeStoreSchema=new mongoose.Schema({
},{timestamps:true})
export const timeStore=mongoose.model("TimeStore",timeStoreSchema);