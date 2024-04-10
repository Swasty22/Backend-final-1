import {asyncHandler} from "../utilities/asynchandler.js"
import {apiResponse} from "../utilities/apiresponse.js"

const healthChecker = asyncHandler(async (req, res) => {
    return res.status(200)
        .json(200 ,  new apiResponse(" Everthing is working good"))
})

export {healthChecker}