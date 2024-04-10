/* 
how to write video controller 
importing

 get all video 
 ..get all videos based on querry , sort ,pagination

 

 publish video

 get video => upload to cloudinary => create video

 get video by id

 update video and video details like title thumbnail description

*/

import { asyncHandler } from "../utilities/asynchandler.js";
import { Video } from '../models/video.models.js'
import { apiResponse } from "../utilities/apiresponse.js";
import { apiError } from "../utilities/apierror.js";
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";
import { deleteOncloudinary, fileUpload } from "../utilities/cloudinary.js";
import { User } from "../models/user.models.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType} = req.query
    
    //get all videos based onquery , sort , pagination
    // const userId = req.user
    // console.log("user id : ",userId);
    const user = await User.find({
        refreshToken: req.cookies.refreshToken,
      });

    //   console.log("user id : " , user);
    
    // if (!userId) {
    //     throw new apiError(400, "invalid user id")
    // }

    if (user) {
        const video = await Video.aggregate
        (
            [
                {
                    $match:{
                        $or:[
                            {title : {$regex : 'query' , $options : 'i'}},
                            {description : {$regex : 'query' , $options : 'i'}}
                        ],
                        isPublished:true,
                        owner:user._id
                    }
                },
                {
                    $lookup:{
                        from:"likes",
                        localField:"_id",
                        foreignField:"video",
                        as:"likes"
                    }
                },
                {
                    $addFields:{
                        likes:{$size : "$likes"}
                    }
                },
                {
                    $project:{
                        _id:1,
                        videoFile:1,
                        thumbNail:1,
                        title:1,
                        description:1,
                        views:1,
                        isPublished:1,
                        likes:1,
                        createdAt:1,
                        updatedAt:1,
                        owner:1
                    }
                },
                {$sort : {[sortBy] : sortType === 'asc' ? 1 : -1}}
            ]
        )

        if (video.length === 0) {
            return res.status(200).json(new apiResponse(400, "No videos available."))
        }

        console.log("video: " , video);
        res.status(200).json( new apiResponse(200 , video , "videos fetched successfully "))

    }
    
        

});

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if ([title, description].some((field) => field?.trim() === '')) {
        throw new apiError(400, "all fields are required")
    }
    // if (!duration) {
    //     throw new apiError(400 , "duration is required")
    // }
    //get video , upload to cloudinary , create video
    //to get video first get video id and find video

    const videoLocalPath = req.files?.videoFile[0].path
    const thumbNailLocalPath = req.files?.thumbNail[0].path
    // const videoFile = req.files && req.files.videoFile && req.files.videoFile[0];
    // const thumbNail = req.files && req.files.thumbNail && req.files.thumbNail[0];
    console.log(req.files)
    // console.log("videofile :" , videoFile , "thumbNail :" , thumbNail )
    // const videoLocalPath = videoFile ? videoFile.path : null;
    // const thumbNailLocalPath = thumbNail ? thumbNail.path : null;


    ///Users/swastikc/Desktop/vid tube/public/temp/pexels-ruvim-miksanskiy-5896379 (2160p).mp4

    if (!videoLocalPath) {
        throw new apiError(400, "video file is required")
    }

    if (!thumbNailLocalPath) {
        throw new apiError(400, "thumbnail is required")
    }

    const videoFile = await fileUpload(videoLocalPath)
    const thumbNail = await fileUpload(thumbNailLocalPath)
    console.log("duration :", videoFile.duration / 3600)
    if (!videoFile) {
        throw new apiError(500, "something went wrong while uploading video")
    }
    if (!thumbNail) {
        throw new apiError(400, "something went wrong while uploading thumbnail")
    }
    //video uploaded on cloudinary

    const video = await Video.create
        (
            {
                title,
                description,
                thumbNail: {
                    url: thumbNail.url
                },
                videoFile: {
                    url: videoFile.url
                },
                duration: videoFile.duration,
                owner: req.user._id,
                isPublished: false


            }
        )

    const uploadedVideo = await Video.findById(video._id)
    if (!uploadedVideo) {
        throw new apiError(500, "failed to upload video")
    }


    console.log("video deleted from cloudinary")

    return res.status(200).
        json(new apiResponse("video uploaded successfully", video._id, thumbNail._id,))



})

/* const getVideoById = asyncHandler(async (req, res) => {
    let { videoId } = req.params
    console.log(videoId);
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "invalid video id")
    }
    videoId = new mongoose.Types.ObjectId(videoId)
    const video = await Video.aggregate
        (
            [
                {
                    $match: {
                        _id: videoId
                    }
                },
                {
                    $lookup: {
                        from: "likes",
                        foreignField: "video",
                        localField: "_id",
                        as: "like"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: '_id',
                        as: "ownerDetails",
                        pipeline: [
                            {
                                $lookup: {
                                    from: "subscriptions",
                                    localField: "_id",
                                    foreignField: "channel",
                                    as: "subscribers"
                                },
                                $addFields: {
                                    subscribersCount: {
                                        $size: "$subscribers"
                                    }
                                },
                                isSubscriber: {
                                    $cond: {
                                        $if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                                        then: true,
                                        else: false
                                    }
                                }
                            }, {
                                $project: {
                                    userName: 1,
                                    "avatar.url": 1,
                                    subscribersCount: 1,
                                    isSubscriber: 1
                                }
                            },

                        ]
                    }
                },
                {
                    $addFields: {
                        totalLikes: {
                            $size: "$like"
                        },

                    },
                    isLikedBy: {
                        $cond: {
                            $if: { $in: [req.user?._id, "$like,likedBy"] },
                            then: true,
                            else: false
                        }
                    }
                },
                {
                    $project: {
                        "videoFile.url": 1,
                        totalLikes: 1,
                        isLikedBy: 1,
                        videoFile: 1,
                        title: 1,
                        description: 1,
                        thumbNail: 1,
                        duration: 1,
                        createdAt: 1,
                        owner: 1

                    }
                }

            ]
        )
    if (!video) {
        throw new apiError(500, "something went wrong while fetching video")
    }

    await Video.findByIdAndUpdate(videoId, {
        $inc: {
            views: 1
        }
    })

    await Video.findByIdAndUpdate(req.user._id, {
        $addToSet: {
            watchHistory: videoId
        }
    })

    return res.status(200)
        .json(new apiResponse(200, video, "video details fetched successfully"))

    //get video by id
 })
 */

 const getVideoById = asyncHandler(async (req,res)=> {
    const {videoId} = req.params

    console.log("video id: " , videoId);

    if (!videoId) {
        throw new apiError(400 , "invalid video id")
    }
    
    const video = await Video.findById(videoId)

    console.log("video in db : " , video);
    if (!video) {
        throw new apiError(400 , "video not found")
    }

    return res.status(200)
    .json(200 , new apiResponse(200 , video , "videos fetched successfully"))
 })
 
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    if (!(title && description)) {
        throw new apiError(400, "title and description are required")
    }
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "videoid not found")
    }
    //am assuming that with videoid we can only update video but to update dwscription , and thumbnail we need whole video 
    const video = await Video.findById(videoId)
    console.log("video :" , video);
    console.log("user id from db :" , req.user._id);
    console.log("owner of video" , video.owner);
    if (!video.owner.equals(req.user._id)) {
        throw new apiError(400, "only owner can access the video")
    }
    //after getting and verifying video
    //delete the old thumbnail from cloudinary
    const deleteThumbnail = video.thumbNail.public_id
    const thumbNailLocalPath = req.file?.path

    if (!thumbNailLocalPath) {
        throw new apiError(400, "thumbnail localpath required")
    }

    //update new thumbnail
    const newThumbNail = await fileUpload(thumbNailLocalPath)

    if (!newThumbNail) {
        throw new apiError(400, "thumbnail bot found")
    }
    const updateVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                title,
                description,
                newThumbNail: {
                    public_id: newThumbNail.public_id,
                    url: newThumbNail.url
                }
            },

        },
        {
            new: true
        }
    )

    if (!updateVideo) {
        throw new apiError(500, "something went wrong while updating video")
    }
    if (updateVideo) {
        await deleteOncloudinary(deleteThumbnail)
    }

    return res.status(200)
        .json(new apiResponse(200,updateVideo, "video has been updated successfully"))

    //update ideo detals like title , description and thumbnail
})
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "invalid video id")
    }

    const video = await Video.findById(videoId)
    console.log("video id :", videoId)
    if (!video) {
        throw new apiError(400, "video not found")
    }


    if (video.owner.toString() === req.user._id.toString()) {
        await Video.findByIdAndDelete(videoId)
    }


    // await deleteOncloudinary(video.thumbNail.public_id)
    // await deleteOncloudinary(video.videoFile.public_id, "video")

    await Like.deleteMany({
        video: videoId
    })

    await Comment.deleteMany({
        video: videoId
    })

    return res.status(200)
        .json(new apiResponse(200, "video deleted successfully"))

})
const togglePublishStatus = asyncHandler(async (req, res) => {
    //default the publish toggle will be false
    //we need video to toggle
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "invalid video id")
    }

    const video = await Video.findById(videoId)
    console.log("video :", video);
    if (!video) {
        throw new apiError(400, "video not found")
    }

    const setToggleStatus = await Video.findByIdAndUpdate(videoId, {
        $set: {
            isPublished: !video.isPublished
        },
    },
        {
            new: true
        }
    )

    if (!setToggleStatus) {
        throw new apiError(500, "failed to set toggle status")
    }

    return res.status(200)
        .json(new apiResponse(setToggleStatus, "set toggle status success"))
})
export { getAllVideos, publishVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus }
