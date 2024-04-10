import { asyncHandler } from "../utilities/asynchandler.js"
import { apiResponse } from "../utilities/apiresponse.js"
import { apiError } from "../utilities/apierror.js"
import { Tweet } from "../models/tweet.models.js"
import mongoose, { isValidObjectId } from "mongoose"


//create tweet , get user tweet , update tweet , delete tweet


//create tweet
const createTweet = asyncHandler(async (req, res) => {
    //how to create tweet
    //basically creating tweet is same as comments
    //we will be writing contents
    const { content } = req.body
    

    if (!content) {
        throw new apiError(400, "content not found")
    }
    

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id,
    })

    if (!tweet) {
        throw new apiError(500, "something went wrong while creating tweet")
    }

    return res.status(200)
        .json(new apiResponse(200, tweet ,  "tweet created successfully"))

})

//get user tweet so that we can show them to user
// const getUserTweet = asyncHandler(async (req, res) => {
//     //how to get user tweet
//     //first get the id of the user

//     const { userId } = req.params
//     if (!isValidObjectId(userId)) {
//         throw new apiError(400, "invalid user id")
//     }
//     //after getting tweet id

//     const tweetAggregate = await Tweet.aggregate
//         (
//             [
//                 {
//                     $match: {
//                         owner: new mongoose.Types.ObjectId(userId)
//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "users",
//                         localField: "owner",
//                         foreignField: "_id",
//                         as: "ownerDetails",
//                     },
//                     $project: {
//                         userName: 1,
//                         "avatar.url": 1

//                     }
//                 },
//                 {
//                     $lookup: {
//                         from: "likes",
//                         localField: "_id",
//                         foreignField: "tweet",
//                         as: "likesDetails",
//                         pipeline: [
//                             {
//                                 $project: {
//                                     likedBy: 1
//                                 }
//                             }
//                         ]
//                     }
//                 },
//                 {
//                     $addFields: {
//                         totalLikes: {
//                             $size: "$totalLikes"
//                         }
//                     },
//                     ownerDetails: {
//                         $first: "$ownerDetails"
//                     },
//                     isLiked: {
//                         $cond: {
//                             $if: { $in: [req.user?._id, "$totalLikes.likedBy"] },
//                             then: true,
//                             else: false
//                         }
//                     }
//                 },
//                 {
//                     $sort: {
//                         createdAt: -1
//                     }
//                 },
//                 {
//                     $project: {
//                         ownerDetails: 1,
//                         totalLikes: 1,
//                         isLiked: 1,

//                     }
//                 }


//             ]
//         )


//     return res.status(200).
//         json(new apiResponse(200, tweetAggregate, "tweet fetched successfully"))
// })
const getUserTweet = asyncHandler(async (req,res) => {
    const {userId} = req.params
    console.log("user id :" , userId);


    if (!userId) {
        throw new apiError(400 , "invalid user id")
    }

    const tweet = await Tweet.find({owner:userId})
    console.log("user id on db :" , userId);

    if (!tweet) {
        throw new apiError(500 , "tweet not found")
    }

    res.status(200)
        .json(200 , new apiResponse(200 , tweet , "tweet fetched success"))
})
//updat tweet
const updateTweet = asyncHandler(async (req, res) => {
    let { tweetId } = req.params

    // tweetId = new mongoose.Types.ObjectId(tweetId)
    
    console.log("tweet id : " , tweetId);
    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "invalid tweet id")
    }

    const { content } = req.body
    console.log('content :' , content);
    if (!content) {
        throw new apiError(400, "content is required")
    }//after fetching content

    const tweet = await Tweet.findById(tweetId)
    console.log("tweet :" , tweet);
    if (!tweet) {
        throw new apiError(400, "tweet not found")
    }
    // let tweett = tweet
    // const user = await User.findById(req.user._id)  c 
    // console.log(`tweet: ${tweett} `)

    if (tweet.owner.toString() === req.user._id.toString()) {
         await Tweet.findByIdAndUpdate(tweetId , 
            {
                $set:{
                    content
                }
            },
            {new:true}
        )

        
    }
    
    return res.status(200).json( new apiResponse(200 , "tweet updated successfully"))


})
//delete tweet
const deleteTweet = asyncHandler(async(req,res) => {
    const {tweetId} = req.params

    if (!isValidObjectId(tweetId)) {
        throw new apiError(400 , "invalid tweet id")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new apiError(400 , "tweet not found")
    }
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(400 , "only owner can delete the tweet")
    }
   await Tweet.findByIdAndDelete(tweetId)

    return res.status(500)
        .json( new apiResponse(200 , "tweet deleted successfully"))
})




/**
 what am i lagging still?
 able to build logic and getting better than before ..
 thinking to much about logic before or thinking too less before code
 watever just keep going..

 still struggling in mongodb pipelines
 */





export { createTweet, getUserTweet, updateTweet , deleteTweet }