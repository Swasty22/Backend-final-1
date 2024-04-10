import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const fileUpload = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {    //after succssfull upload remove the file and if failed to upload file also remove file or avatar from local storage 
            resource_type: 'auto'
        })
        console.log('file has been uploaded successfully', response.url)
        console.log('response of uploading file ', response)
        fs.unlinkSync(localFilePath)
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath)
    }
}


const deleteOncloudinary = async(public_id , resource_type = 'video') => {
   
    if (!public_id) return null 

    try {
        console.log("public id : " , public_id)
        await cloudinary.uploader.destroy(public_id,{
            resource_type:`${resource_type}`
        })
        
       } catch (error) {
        throw new apiError(500 , "delete from cloudinary failed")
}
}
 
export {fileUpload , deleteOncloudinary}