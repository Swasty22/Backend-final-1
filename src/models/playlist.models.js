import mongoose , {Schema} from "mongoose";

const playlistSchema = new Schema({
    video:[
        {
            type:Schema.Types.ObjectId,
            ref : "Video"
        }
    ],
    createdBy:{
        type:Schema.Types.ObjectId,
        ref : "User"
    },
    playlistName:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }
},

{timestamps:true}
)


export const Playlist = mongoose.model("Playlist" , playlistSchema)