import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectdb = async()=>{
    try{
     const response = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
     console.log(`mongodb connected successfully !!! DB host ${response.connection.host}`)
    }
    catch(error){
        console.error('mongodb connection ERROR',error)
        process.exit(1)
    }
}

export default connectdb