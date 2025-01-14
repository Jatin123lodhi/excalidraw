import express from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { middleware } from "./middleware"
import { prismaClient } from "@repo/db/client";
import { CreateRoomSchema, CreateUserSchema, SigninSchema } from "@repo/common/types";

const app = express()
const PORT = 3001


app.use(cors())
app.use(express.json())


app.post('/signup', async (req,res) => {
    const parsedData = CreateUserSchema.safeParse(req.body)
    
    if(!parsedData.success){
        res.status(400).json({message: "Invalid inputs"})
        return
    }

    try{
        
        const existingUser = await prismaClient.user.findFirst({
            where: {
                email: parsedData.data.username
            }
        })

        if(existingUser){
            res.status(400).json({message: "Username already exsits"})
            return
        }
        const newUser = await prismaClient.user.create({
            data: {
                email: parsedData.data.username,
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        })
        
        const token = jwt.sign({ userId: newUser.id},JWT_SECRET)
        res.status(200).json({message: "Signup successfull",token})
    }catch(error){
        console.log(error)
        res.status(500).json({message: "Something went wrong"})
    }

})


app.post('/signin',async (req,res) => {
    const { success, data } = SigninSchema.safeParse(req.body)
    if(!success){
        res.status(400).json({message: "Username and Password are required"})
        return
    }

    try{
        const user = await prismaClient.user.findFirst({
            where: {
                email: data.username,
                password: data.password
            }
        })
        if(!user){
            res.status(404).json({message: "Invalid creadentials"})
            return
        }

        const token = jwt.sign({userId: user.id},JWT_SECRET)
        res.status(200).json({message:"User signup successfull",token})
    }catch(error){
        console.log(error)
        res.status(500).json({messgae: "Something went wrong"})
    }

})

// create room
app.post('/room',middleware, async (req,res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body)
    if(!parsedData.success){
        res.status(400).json({message: "Invalid inputs"})
        return
    }
    // db call
    try{
        const userId = req.userId
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId,
            }
        })
    
        res.json({
            roomId: room.id
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            message: "Room already exists"
        })
    }
})



app.listen(PORT, () => {
    console.log('http backend server started at '+PORT)
})

