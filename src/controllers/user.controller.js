import { User } from "../models/user.models.js"
import { asyncHandler } from "../utilities/asynchandler.js"
import { apiError } from "../utilities/apierror.js"
import { fileUpload } from "../utilities/cloudinary.js"
import { apiResponse } from "../utilities/apiresponse.js"
import  jwt  from "jsonwebtoken"
// import { deleteOldImageFromCloudinary } from "../utilities/oldImagesToBeDeleted.js"
import mongoose from "mongoose"
// import { v2 as cloudinary } from "cloudinary"

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const refreshToken = user.generateRefreshToken()
    const accessToken = user.generateAccessToken()
    //we generated tokens but refreshtoken should be saved in database
    // capital U user has access to the user model but now we gave to id of capital u to small u user so the small u user ke paas _id ka access he

    user.refreshToken = refreshToken //_id ka access milne k baadh us id me ham refresh token save kr rhe h..

    //save user in db while doing this mongodb default process gets in ie whenever saving something password is required to avoid this a parameter is passesd
    await user.save({ validateBeforeSave: false })

    //return the tokens to users after successfully saved
    
    return { accessToken, refreshToken }

  } catch (error) {
    throw new apiError(500, 'something went wrong while generating accesstoken and refreshtoken')
  }

}

const registerUser = asyncHandler(async (req, res) => {

  const { fullName, email, userName, password } = req.body

  if (
    [email, userName, fullName, password].some((fields) => fields?.trim() === "") //checking if all  fields are filled or not here some()method is used its a callback fn we giving fields as param if fields are empty('') after trimming we are throwing error by calling api error
  ) {
    throw new apiError(400, "All fields are required")
  }
  if (!email.includes("@")) {
    throw new apiError(400, "email is invalid")  //same we are checking if email cntains "@" symbol or not 
  }

  //checking for existed user we importing user.model.js bcoz it contains user deetails and user.model is directly connected with mongoose it can directly access to mongodb

  const existedUser = await User.findOne // findone is an inbuilt method
    ({
      $or: [{ userName }, { email }]  // $or inbuilt method
    })
  if (existedUser) {

    throw new apiError(409, "User already exists")
  }

  //files handling
  //req.body is a default provided by express but it doesnt provide file handling to handle file we have multer which helps us to handle file 
  //req.files and (?) used for checking optional 

  // this brings the path of file which multer saved in our server bcox we sai dto multer to temproarily save the files in our server
  // in this avatar is must for us   ? refers ''here mile ya na mile''
  const avatarLocalPath = req.files?.avatar[0]?.path
 


  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required") // we checking in local path 
  }

  const coverImageLocalPath = req.files?.coverImage[0]?.path


  const avatar = await fileUpload(avatarLocalPath)         //it takes time to upload files so await is used
  const coverImage = await fileUpload(coverImageLocalPath)

  if (!avatar) {
    throw new apiError(400, "Avatar file is required") //here we checking in cloudinary uploaded successfully or not
  }
  //now were creating user object in databse mongodb is an nosql database it creates object so we got an inbuilt an create()
  const user = await User.create
    ({
      fullName,
      userName: userName.toLowerCase(),
      email,
      avatar: avatar.url, //we are storing avatr url 
      coverImage: coverImage?.url || "", //if cover image url is present upload it into database or else leave it empty why we using conditonal statement bcoz above for avatar we already checked but in case of cover image we dint check bczo cover image is optional 
      password,
    })


  //next step is to check wheather the user i screated or not to check that mongodb creates a id everytime a user is created and few methods to find 
  const createdUser = await User.findById(user._id).select(  //select methods used to select a particular things which is not required with (-)
    "-password -refreshToken"
  )
  if (!createdUser) {
    throw new apiError(500, 'something went wrong while  registering a user')  //if usercreated failed sending message
  }

  return res.status(201).json(
    new apiResponse(200, createdUser, "user registered successfully")

    //sending suucess response to the user with code 200
  )

})

/*
steps to login a user
get data from req.body
validation based on username or email
find user
password verification
generate refresh and access token
send response to the user in the form of cookie 
there is  a method above to genrate access token and refresh token for a id
*/

const loginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body

  if (!email) {
    throw new apiError(404, "email is required")
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }]
  })

  if (!user) {
    throw new apiError(404, "user doesnt exists")
  }

  //next step if user is avilable check for password of the user
  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    throw new apiError(401, 'password is Incorrect')
  }
  //if password is also crrect generate access and refrsh token
  const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id)
 
  

  //we are sending access and refresh token in the form of cookies 
  // we having referance of user from this fn but theres is another fn created above but we needed user from above created fn to get access to refreshtoken
  //so were calling the database onemore time

  const userLoggedIn = await User.findById(user._id).
    select("-password -refreshToken")  //using select were deselecting the fields we dont need to show to user which is password and refresh token

  const options = {
    httpOnly: true,  // the purpose of this is to protect cookies from modifying by frontend
    secure: true
  }
  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: userLoggedIn, accessToken, refreshToken
        },
        "user has been logged in successfully"
      )
    )

})
const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate
    (
      req.user._id,
      {
        $set: {
          refreshToken: undefined
        },
      },
      {
        new: true
      }
    )
  const options = {
    httpOnly: true,  // the purpose of this is to protect cookies from modifying by frontend
    secure: true
  }

  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "user logged out successfully"))

})

const refreshToken = asyncHandler(async () => {

  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new apiError(401, "unauthorized request")
  }
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN)

    if (!decodedToken) {
      throw new apiError(400, "unauthorized user")
    }
    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new apiError(402, "invalid refresh token")
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Refresh token is expired of used")
    }
    const options = {
      httpOnly: true,
      secure: true
    }
    const { accessToken, newRefreshToken } = await generateAccessandRefreshToken(user._id)

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new apiResponse(200,
        {
          accessToken, "refreshToken": newRefreshToken
        },
        "Access token refreshed"
      ))
  } catch (error) {
    throw new apiError(400, error?.message || "invalid refresh token")
  }
})

//get watchHistory..get watchhistory is in user so connect user to vide.models.js and video model has owner so basically owner
//is the user we will be using nested look ups..first use look up from user to acces  watchhistory , then to access owner ie user 
//use look up inside of lookup to access user 

const changeCurrentPassword = asyncHandler(async (req, res) => {

  /*
  to chnage password wat r required
  watever field is requird "old password new password or confirm password-addon"
  find user to verify password
  if user can able to change password that means he is logged in 
  during logged in a middleware is used auth.middleware.js
  auth middleware has access to the user req.user from there we can access the users data
  */
  const { oldPassword, newPassword } = req.body
  console.log("old password :" , oldPassword  , "newpassword :" , newPassword);
  const user = await User.findById(req.user?._id)
  const isOldPasswordCorrect = await user.comparePassword(oldPassword)

 
  if (!isOldPasswordCorrect) {
    throw new apiError(400, "invalid old password")
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false })


  return res
    .status(200)
    .json(new apiResponse(200, "new password set  successfully"))
})

const currentUser = asyncHandler(async (req, res) => {
  
  return res.status(200).json(200, new apiResponse(req.user, "current user fetched successfully "))

})

//update account details 

const updateAccount = asyncHandler(async (req ,res) => {
  const{email} = req.body

  if (!email) {
    throw new apiError(400, "all fields are required only email can b updated now")
  }
  await User.findByIdAndUpdate(req.user._id,
    {
      $set: {
        email
      },
    },
    {
      new: true
    }
  ).select("-password")

  return res
    .status(200)
    .json(200, new apiResponse(200, "account details updated successfully"))

})
//update avatar
const updateAvatar = asyncHandler(async () => {
  const avatarLocalPath = req.file?.path   //we can acces file from req.files 
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is missing")
  }
  const newAvatar = await fileUpload(avatarLocalPath)

  if (!newAvatar.url) {
    throw new apiError(400, 'something went wrong while uploading the avatar on cloudinary ')
  }

  const user = await User.findByIdAndUpdate(req.user?._id,
    { $set: { avatar: newAvatar.url } },
    { new: true })
    .select("-password")

  


  return res.
    status(200).
    json(200, new apiResponse(200, user, "avatar updated succesfully"))
})

//update cover image 
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
    throw new apiError(400, "coverImage file is missing")  //getting the file on local server using multer 
  }

  const newCoverImage = await fileUpload(coverImageLocalPath)  //uploading the file on cloudinary we can skip this step if needed
  if (!newCoverImage) {
    throw new apiError(400, "something went wrong while uploading on cover image on cloudinary")
  }

  const user = await User.findByIdAndUpdate(req.user?._id,  //updating cover image in database
    {
      $set:
      {
        coverImage: newCoverImage.url
      }
    }
    , { new: true })
    .select("-password")
      
  return res.
    status(200).
    json(new apiResponse(200, user, "cover image updated sucessfully"))

    
})

//a bit of advanced 
//connecting user to subscription
// calculate the no subscribers and subrscribed by me and subscribed or not button

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params //basically when we want to access user from url we type /youtube/username

  if (!userName?.trim()) {
    throw new apiError(400, "username is missing")
  }

  const channel = await User.aggregate(
    [
      {
        $match: {
          userName: userName?.toLowerCase()  //match bases upon our data user name will be unique so matching up usr name to access to the user
        }
      }, {
        $lookup: {  //lookup used to look for data in other fields we are looking for subscription to get subecribe and channel from user
          from: "subscriptions",
          localField: "_id",
          foreignField:"channel",
          as: "subscribers"
        }
      },
      {
        $lookup: {  //calculate the subscribed channel by us
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo"
        }
      },
      {
        $addFields: {
          subscribersCount: {        //count total no of subs and we subs to channel
            $size: '$subscribers'
          },
          channelSubscribedTo: {
            $size: '$subscribedTo'
          },
          isSubscriber: {
            $cond: {
              if: { $in: [req.user?._id, "$subscribers.subscribe"] },  //meaning of this is 
              // in subscribers . subscribe if the user is present return true else false
              then: true,
              else: false
            }
          }
        }
      },
      {
        $project: { // provide needed only..in channel user profile username fullname email subscriber sbscriber to these fields r shown
          fullName: 1,
          userName: 1,
          subscribersCount: 1,
          channelSubscribedTo: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
          password:1

        }
      }
    ]

    
  )
  
  
  if (!channel) {
    throw new apiError(400, "channel doesnt exists")
  }

  return res.
    status(200).
    json(200, new apiResponse(200, channel[0], "user channel fetched successfully ", console.log("channel : ",channel[0])))
})

const getUserWatchHistory = asyncHandler(async (req , res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchHistory',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {     //inside owner we using another pipeline to send the required data 
                    fullName:1,
                    userName:1,
                    avatar:1
                  }
                }
              ]
            }

          },
        ]
      }// to access owner of the video subpipeline ie nested lookup sare created 
    }
  ])
  return res.
  status(200).
  json(200 , new apiResponse(200 , user[0].watchHistory, " watch history fetched successfully "))

})

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshToken,
  changeCurrentPassword,
  currentUser,
  updateAccount,
  updateCoverImage,
  updateAvatar,
  getUserChannelProfile,
  getUserWatchHistory,
  

}

/*
get the user details from front end 
check the user provided full details
verify user doesnt exist already 
chec for images and check for avatar......avatar is must cover image is optional
upload them to the cloudinary
create user object - create entry in db
remove password and refresh token
check for user creation 


*/ 