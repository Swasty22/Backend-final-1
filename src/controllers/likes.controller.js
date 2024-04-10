import { Like } from "../models/like.models.js"
import { asyncHandler } from "../utilities/asynchandler.js"
import { apiError} from "../utilities/apierror.js"
import { apiResponse } from "../utilities/apiresponse.js"
import { isValidObjectId } from "mongoose"
import mongoose from "mongoose"

/* 
how to write a like controller?
bascially like means either liked or not or true or false
we liie videos , comment , tweet , and thr user who likes all

we need to write fn for if videos comment tweet has been liked by user or not
so that we need users reference


//togglevideolike
togglecomment like
toggle tweet like
get liked videos
*/

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "invalid video Id")
    }
    //we got the video id not we need to check wheather the video is already likedby the user  or not , send res if liked and vice versa
    //

    //after finding video we need to finf wheather the video is liked buy the user or not
    //we have to get liked by to find wheather liked by user or not 

    const alreadyLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })
    
    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)
        return res.status(200).json(new apiResponse({ likedBy: false }))
    }
    await Like.create({
        video:videoId,
        likedBy:req.user?._id
    });
    return res.status(200)
    .json(200 ,  new apiResponse(200 , {likedBy:true} , "liked added successfully"))
    


     // and making the liked by false in db...(Like) can directly speak to database

    //the logic goes like this we already liked 
    return res.status(200,)
    //video has been liked

})
//toggle comment like

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new apiError(400, "invalid comment id")
    }

    const alreadyLiked = await Like.findOne({
        likedBy: req.user?._id,
        comment: commentId
    })
    

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)
        return res.status(200).
            json( new apiResponse (200, { likedBy: false }) )

    }
    await Like.create({
        likedBy:req.user?._id,
        comment:commentId
    })

    return res.status(200)
    .json(new apiResponse(200 , {likedBy:true} , "like added to comment successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "invalid tweet id")
    }

    //after getting valid tweet id

    //if not liked we creating like if already liked we deleting the like or unliking or basically removing the data of the user from the video


    const alreadyLiked = await Like.findOne({
        likedBy: req.user?._id,
        tweet: tweetId
    })

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)

        return res.status(200).
            json(200, new apiResponse(200, { likedBy: false }))
    }

        await Like.create({
            likedBy: req.user?._id,
            tweet: tweetId
        })

        return res.status(200).
            json(new apiResponse(200, { likedBy: true }))
    
})

//getlikedvideos 
const getLikedVideos = asyncHandler(async (req, res) => {

    console.log("user id :",req.user._id)
    const likedVideosAggregate = await Like.aggregate(
        [
            {
                $match:{
                    likedBy:new mongoose.Types.ObjectId(req.user._id)
                }
            },
            {
                $lookup:{
                    from:"videos",
                    localField:"video",
                    foreignField:"_id",
                    as:"likedVideos",
                    pipeline:[
                        {
                            $lookup:{
                                from:"users",
                                localField:"owner",
                                foreignField:"_id",
                                as:"userDetails"
                            }
                        }
                    ]
                }
            },
            {
                $project:{
                    _id:0,
                    likedVideos:{
                        _id:1,
                        "videoFile.url":1,
                        "thumbNail.url":1,
                        owner:1,
                        title:1,
                        isPublished:1,
                        duration:1,
                        description:1,
                        ownerDetails:{
                            userName:1,
                            fullName:1,
                            "avatar.url":1,
                            password:1
                            
                        }
                    }
                }
            }
        ]
    )
        console.log("liked videos aggragate : " , likedVideosAggregate)
    return res.status(200)
        .json( new apiResponse( 200, likedVideosAggregate , "liked videos fetched successfully"))
})
export { toggleVideoLike, toggleCommentLike, toggleTweetLike , getLikedVideos}