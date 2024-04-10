import mongoose, { Schema, modelNames } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoschema=new mongoose.Schema(
    {
        videoFile:{
            type:{
               url: String,
               public_id:String
            },
            required:true
        },
        thumbNail:{

            type:{url:String,
                public_id:String
            },
            required:true
        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:'User'
        }
        
    },{
    timestamps:true
})
videoschema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model('Video',videoschema)