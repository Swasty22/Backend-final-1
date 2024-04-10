import express  from "express";
import cookieParser from "cookie-parser"; //work of this access users cookies and modify
import cors from 'cors'

const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,     //creating app to accept datas from urls and json format cookie parser and cors is used
    Credential:true
}))
app.use(express.json({limit:'16kb'}))       //providing space limit and accepting json format datas
app.use(express.urlencoded({extended:true,limit:'16kb'}))             //accepting url datas and wwe using urlencoded inbuilt fn in express to encode the url and extended used to nesting of object and data limit is 16kb
app.use(express.static('public'))   //config to be used by public 
app.use(cookieParser())  //used cookie parser here


import commentRouter from './routes/comment.routes.js'
import userRouter from './routes/user.routes.js'
import likesRouter from './routes/likes.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import videoRouter from './routes/video.routes.js'
import healthcheckRouter from './routes/healthcheck.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'

app.use('/api/v1/user',userRouter)
app.use('/api/v1/comment',commentRouter)
app.use('/api/v1/likes',likesRouter)
app.use('/api/v1/subscription',subscriptionRouter)
app.use('/api/v1/playlist',playlistRouter)
app.use('/api/v1/tweet',tweetRouter)
app.use('/api/v1/video',videoRouter)
app.use('/api/v1/healthcheck',healthcheckRouter)
app.use('/api/v1/dashboard',dashboardRouter)



export default app