 import dotenv from 'dotenv'
//  require('dotenv').config({path:'./backend/env'})
import connectdb from "./database/database.js";
import app from './app.js';

dotenv.config({
    path:'./env'
})

connectdb()
.then(()=>{

    app.on('error',error =>{
        console.log(error)
        throw error
    })
    
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running in port ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.error('MONGODB connection failed',error)
})