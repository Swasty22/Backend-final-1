import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import { asyncHandler } from "../utilities/asynchandler.js"
import { apiError } from "../utilities/apierror.js";
import { apiResponse } from "../utilities/apiresponse.js";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";



//create playlist check
//getuserplaylistbyid check
//add video to playlist check
//remove video from playlist check
//delete playlist check
//update playlist check
//get user playlist check


const createPlaylist = asyncHandler(async (req, res) => {
    //to create playlist
    /*
    basically we add url of video in an object or array in a playlist
    name and description of playlist 
    */

    const { playlistName, description } = req.body

    if (!playlistName || !description) {
        throw new apiError(400, " playlist name and description are required ")
    }
    console.log("owner id for playlist creation :", req.user.id)
    const playlist = await Playlist.create({
        playlistName,
        description,
        createdBy: req.user?._id
    })

    if (!playlist) {
        throw new apiError(500, "failed to create playlist")
    }
    return res.status(200).json(new apiResponse(200, playlist, " playlist created successfully"))
})
//get playlist by id every playlist in mongo db will have unique id 

const getUserPlaylistById = asyncHandler(async (req, res) => {

    const { userId } = req.params
    console.log("user id :", userId)

   if (!userId) {
    throw new apiError(400 , "invalid user id")
   }

   const getPlaylist = await Playlist.findById({createdBy:userId})
   console.log("playlist : " , getPlaylist);
   
    return res.status(200)
        .json(200, new apiResponse(200, getPlaylist, "playlist fetched successfully"))

})


//add video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params


    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new apiError(400, "invalid playlist id or video id")
    }
    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new apiError(400, "playlist not found")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(400, "video not found")
    }

    if (playlist.owner?.toString() && video.owner?.toString() !== req.user?._id.toString()) {
        throw new apiError(400, "playlist owner  only can upload video in their playlist")
    }

    //after fetching video and playlist we need to add the video into the playist

    //how to add video in playlist  
    //videos will be added in the arrY OR OBJ format videos url will be plCED INSIDE The playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist?._id, {
        $addToSet: {
            video: videoId
        }
    }, {
        new: true
    }
    )
    if (!updatedPlaylist) {
        throw new apiError(500, "failed to update playlist")
    }
    return res.status(200)
        .json(new apiResponse(200, updatedPlaylist, "playlist updated successfully "))
})



const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "invalid playlist id")
    }

    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "invalid video id")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new apiError(400, "playlist not found")
    }

    //if playlist found

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist._id,
        {
            $pull: {
                video: videoId
            },
        },
        {
            new: true
        }
    )

    if (!updatedPlaylist) {
        throw new apiError(500, "failed to remove video from playlist")
    }

    return res.status(200)
        .json(new apiResponse(200, updatedPlaylist, "video removed from playlist successfully "))

    //remove video from playlist 
    //to remove video from playlist we need playlist id and video id
    //verify if playlist id === to user id
    //use pull and show true value
})

//update playlist

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistName, description } = req.body
    const playlistId = req.params
    console.log("playlis id :", playlistId);
    if (!playlistId) {
        throw new apiError(400, "invalid playlist id")
    }
    const playlist = await Playlist.find(playlistId)

    console.log("playlist : ", playlist);

    if (playlist.owner === req.user?._id) {
        await Playlist.findByIdAndUpdate(playlist, {
            $set: {
                playlistName, description
            }
        },
            { new: true }
        )
    }
    return res.status(200)
        .json(200, new apiResponse(200, playlistName, description, "playlist updated successfully"))


})

//delete playlist

const deletePlaylist = asyncHandler(async (req, res) => {
    //before deleting we need playlists access , 
    const playlistId = req.params
    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "invalid playlist id")
    }
    const playlist = await Playlist.findById(playlist?._id)

    if (!playlist) {
        throw new apiError(400, "playlist not found")
    }

    if (playlistId.toString() !== req.user?._id.toString()) {
        throw new apiError(400, "only owner is allowed to delete playlist")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlist?._id)
})

//get user playlist

const getUserPlaylist = asyncHandler(async (req, res) => {
    //access user and playlist from playlist

    const {userId} = req.params
    console.log(userId);
   
    if (userId) {
       const getPlaylist = await Playlist.find({createdBy:userId})
        console.log(getPlaylist);
       return res.status(200).
        json(new apiResponse(200, getPlaylist , "playlist fetched successfully ")),console.log("get playlist : ",getPlaylist);

    }
})


export {
    createPlaylist,
    addVideoToPlaylist,
    getUserPlaylistById,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
    getUserPlaylist
}