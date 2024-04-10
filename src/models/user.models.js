import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt  from "jsonwebtoken";



const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
            required: true
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video'
            }
        ],
        password: {
            type: String,
            required:true
        },
        refreshToken: {

        }

    },
    {
        timeStamps: true
    })

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next() //next is like a flag after completing task psas this flag to next 

    this.password = await bcrypt.hash(this.password, 10) //takes time to bcrypt so using await 

    next()
}) //we usein pre hook on before save


userSchema.methods.comparePassword = async function (palinTextPassword) { 
     //checks password is coorect or not 
     const hashedPassword = this.password
     console.log("hashed password : ",hashedPassword);
     console.log("plain text password :" , palinTextPassword);
    return await bcrypt.compare(palinTextPassword ,hashedPassword)
    
}

userSchema.methods.generateAccessToken = function () {
   return  jwt.sign(
        {
            _id: this._id,
           
        },
        process.env.ACCESS_TOKEN,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return  jwt.sign(
        {
            _id: this._id,
          
        },
        process.env.REFRESH_TOKEN,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema)