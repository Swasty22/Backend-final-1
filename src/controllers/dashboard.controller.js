// get channel stats like total videos ,  total video views , total likes ,total subs ,

import { asyncHandler } from "../utilities/asynchandler.js";
import { apiResponse } from "../utilities/apiresponse.js";
import { Video } from "../models/video.models.js"
import mongoose from "mongoose";
import { Subscription } from "../models/subscription.models.js"



const getChannelVideos = asyncHandler(async (req, res) => {

    //get all the videos uploaded by the channel
    //how to get the total videos
    //bascially a channel is a user

    const userId = req.user._id

    //after getting user id get the videos from the channel

    const video = await Video.aggregate
        (
            [
                {
                    $match: {
                        owner: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $lookup: {
                        from: "likes",
                        localField: "_id",
                        foreignField: "video",
                        as: "likes"
                    }
                },
                {
                    $addFields: {
                        totalLikes: {
                            $size: "$likes"
                        }
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $project: {
                        _id: 1,
                        "videoFile.url": 1,
                        "thumbNail.url": 1,
                        title: 1,
                        description: 1,
                        totalLikes: 1,
                        isPublished: 1,
                        createdAt: {
                            year: 1,
                            month: 1,
                            day: 1
                        }
                    }
                }
            ]
        )

    return res.status(200)
        .json(new apiResponse(200, video, "video fetched successfully"))

})

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    //after getting user id 
    //retreive the total no subs

    const totalSubscribers = await Subscription.aggregate
        (
            [
                {
                    $match: {
                        channel: new mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $group: {
                        _id: null,
                        subscribersCount: {
                            $sum: 1
                        }
                    }

                }
            ]
        )

    const video = await Video.aggregate
    //get videos owned by the channel including total likes , total views and total no of videos
        (
            [
                {
                    $match:{
                        channel:new mongoose.Types.ObjectId(userId)
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
                    $project:{
                        totalLikes:{
                            $sum:"$likes"
                        },
                        totalViews:{
                            $sum:"$views"
                        }
                    }
                },
                {
                    $group:{
                        _id:null,
                        totalLikes:{
                            $sum:"totalLikes"
                        },
                        totalViews:{
                            $sum:"$totalViews"
                        },
                        totalVideos:{
                            $sum:1
                        }
                    }
                }
            ]
        )

        const channelStats = {
            totalSubscribers:totalSubscribers[0]?.subscribersCount || 0,
            totalLikes:video[0]?.totalLikes || 0,
            totalViews:video[0]?.totalViews || 0
        }

        return res.status(200)
            .json( new apiResponse(200 , channelStats , "channel stats fetched sucessfully"))
})

export { getChannelVideos , getChannelStats}