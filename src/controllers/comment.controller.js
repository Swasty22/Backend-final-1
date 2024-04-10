import { Comment } from "../models/comment.models.js";
import { asyncHandler } from "../utilities/asynchandler.js";
import { apiError } from "../utilities/apierror.js";
import { apiResponse } from "../utilities/apiresponse.js";
import { Video } from "../models/video.models.js";
import mongoose from "mongoose";


/**
 how to get comments from a particular video
first we need video from database 
to get video we need url of the video

 */
// const getVideoComments = asyncHandler(async (req, res) => {
//     // we need video url to see the comments   .....we need to use lookup to get the comment
    
//     const {videoId} = req.params
//     console.log("video id : ",videoId)
//     const video = Video.findById(videoId)
//     if (!video) {
//         throw new apiError(400 , "Video not found")
//     }
//     const commentAggregate = Comment.aggregate([
//         {
//             $match:{
//                 video:new mongoose.Types.ObjectId(videoId)
//             }
//         },{
//             $lookup:{   //get users bcoz check who put comment
//                from:"users",
//                localField:"owner",
//                foreignField:"_id",
//                as:"owner"
//             }
//         },
//         {
//             $lookup:{
//                 from:"likes",
//                 localField:"_id",
//                 foreignField:"comment",
//                 as:"likes"
//             }
//         },
//         {
//             $addFields:{
//                 likesCount:{
//                     $size:"$likes"
//                 }
//             },
//             isLiked:{
//                 $cond:{
//                     if: { $in: [req.user?._id, "$likes.isLiked"] },
//                     then:true,
//                     else:false
//                 }
//             }
//         },
//         {
//             $project:{
//                 content:1,
//                 createdAt:1,
//                 isLiked:1,
//                 likes:1,
//                 owner:{
//                     userName:1,
//                     fullName:1,
//                     "avatar.url":1
//                 },
                
//             }
//         }
//     ])

//     if (!commentAggregate) {
//         throw new apiError(400 , "comment fetching failed")
//     }
//     return res.status(200).json( new apiResponse(200 ,"comments fetched successfully"))

// })


const getVideoComments = asyncHandler(async (req,res) => {
    const {videoId} = req.params
    console.log("video id :" , videoId);

    if (!videoId) {
        throw new apiError(400 , "invalid video id")
    }

    const videoComments = await Comment.find({video:videoId})
    if (!videoComments) {
        throw new apiError(500 , "failed to fetch video comment")
    }

    return res.status(200)
        .json(200 , new apiResponse(200 , videoComments , "video comment fetched successfully"))
})

const addComment = asyncHandler(async(req,res) => {
    /*
    we basicaaly comment on videos video id 
    owner or user comment so we  need users ref user id
    checks if user and viddeo id available or not 
    after
    create..content and give ref of owner
     */
    const {videoId} = req.params
    const {content} = req.body

    if (!content) {
        throw new apiError(400 , "content not found ")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new apiError(404 , "video not found ")
    }

    const comment = await Comment.create({
        content,
        owner:req.user?._id,
        video:videoId
    })

    if (!comment) {
        throw new apiError(500 , "failed to add comment ")
    }
    
    return res.status(200).json(200 , new apiResponse(comment , 200 , "comment added successfully"))

})
/*
add comment to video
create a fn to add comment 
if comment added sucessfully return res and vice versa
store the comment in database 
*/
const updateComment = asyncHandler(async (req,res) => {
    const {commentId} = req.params
    const {content} = req.body
    if (!commentId) {
        throw new apiError(400 , "comment not found")
    }
    const comment  = await Comment.findById(commentId)
    console.log("comment id in db :" , comment);
    if (!comment.owner.equals(req.user?._id)) {
        throw new apiError(400 , "only the owner can able to update their comment")  
    }
    const updatedComment = await Comment.findByIdAndUpdate(commentId , 
        {
        $set:{
            content
        },
        
    },
    {
        new:true
    }).select("-likes -likedBy")

    if (!updatedComment) {
        throw new apiError(500 , "failed to update comment ")
    }

    return res.status(200).json(200 , new apiResponse(200 , updatedComment ,"comment has been updated successfully "))
})

//delete comment

const deleteComment = asyncHandler(async(req,res) => {
    const {commentId } = req.params
    console.log("commentId : " , commentId)
    
    
    if (!commentId) {
        throw new apiError(400 , "invalid comment id")
    }

    const comment = await Comment.findById(commentId)
    console.log("comment  :" , comment);
    
    if (comment.owner.toString() === req.user._id.toString()) {
        await Comment.findByIdAndDelete(comment)
    }
   return res.status(200).json(200 , new apiResponse(200 , "comment has been deleted successfully"))
})
export {getVideoComments,addComment,updateComment,deleteComment}