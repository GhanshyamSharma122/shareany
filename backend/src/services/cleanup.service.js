import { Storage } from "../model.js";
import { deleteFilesFromCloudinary } from "../cloudinary.js";
export async function cleanUP() {
    try {
        const time = new Date(Date.now() - 24 * 60 * 60 * 1000);
        // const time=new Date(Date.now()-1000);
        const idsToDelete = await Storage.find({
            createdAt: { $lte: time }
        })
        console.log(idsToDelete)
        if (!idsToDelete) {
            return;
        }
        for (let doc of idsToDelete) {
            await Storage.findByIdAndDelete(doc._id)
            console.log("i reached here", doc.files)
            for (let file of doc.files) {
                let publicId
                console.log("i reached here")
                if (["jpg", "pdf", "jpeg", "mp4", "png", "gif"].includes(file.substring(file.lastIndexOf('.') + 1)))
                    publicId = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'))
                else
                    publicId = file.substring(file.lastIndexOf('/') + 1)
                console.log(publicId)
                await deleteFilesFromCloudinary(publicId)
            }
        }
        return;
    } catch (error) {
        console.log(`something went wrong ${error}`);
    }
}
