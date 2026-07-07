import multer from "multer"
// Vercel's filesystem is read-only, so files are kept in memory
// and streamed to Cloudinary from the buffer.
export const upload=multer({
    storage:multer.memoryStorage(),
    limits:{fileSize:10*1024*1024}
})
