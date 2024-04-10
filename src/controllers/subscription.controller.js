import mongoose, { isValidObjectId, mongo } from "mongoose"
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import { asyncHandler } from '../utilities/asynchandler.js'
import { apiError } from "../utilities/apierror.js"
import { apiResponse } from "../utilities/apiresponse.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) {
        throw new apiError(400, "invalid channel id")
    }

    const alreadySubscribed = await Subscription.findOne({
        channel:channelId,
        subscriber: req.user?._id
    })
    if (alreadySubscribed) {
        await Subscription.findByIdAndDelete(alreadySubscribed?._id)
        return res.status(200).json(new apiResponse(200, {subscribed:false},  "unsubscribed successfully" ))
    }
    await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    })
    return res.status(200).json(new apiResponse(200, {subscribed:true},"subscribed successfully"))


    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    let { channelId } = req.params
    console.log("channel  id :" , channelId)
    if (!isValidObjectId(channelId)) {
        throw new apiError(400, "invalid channel id ")
    }

   channelId = new mongoose.Types.ObjectId(channelId)
    const subscribers = await Subscription.aggregate
        (
            [
                {
                    $match: {
                        channel: channelId
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "subscribers",
                        foreignField: "_id",
                        as: "subscribers",
                    }
                },
                {
                    $addFields: {
                        totalSubscribers: {
                            $sum: "$subscribers"
                        }
                    }
                },
                {
                    $project: {
                        subscriber: {
                            _id: 1,
                            fullName: 1,
                            userName: 1,
                            "avatar.url": 1,
                            
                            
                        }
                    }
                }
            ]
        )

    if (!subscribers) {
        throw new apiError(500, "failed to fetch subscribers")
    }

    return res.status(200)
        .json(200, new apiResponse(200, subscribers, "subscribers fetched successfully"))

    //a channel is a user 

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {_id} = req.user
    console.log(_id);
    
    if (!isValidObjectId(_id)) {
        throw new apiError(400, "invalid user id")
    }

    const channels = await Subscription.aggregate
        (
            [
                {
                    $match: {
                        subscriber:new mongoose.Types.ObjectId(_id)
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "channel",
                        foreignField: "_id",
                        as: "subscribedChannel",
                    }
                },
                {
                    $addFields:{
                        subscribedChannel:{$arrayElemAt:["$subscribedChannel" , 0]}
                    }
                },
                
                {
                    $project: {

                       subscribedChannel:{
                        _id:1,
                        userName:1,
                        email:1,
                        avatar:1
                       }


                    }
                }
            ]

        )

            if (!channels) {
                throw new apiError(500 ,  "channel not found")
            }
    return res.status(200).
        json(200, new apiResponse(200, channels, "subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}