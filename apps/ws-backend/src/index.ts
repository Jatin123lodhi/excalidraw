import { WebSocketServer, WebSocket } from "ws"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { prismaClient } from "@repo/db/client"
const wss = new WebSocketServer({ port: 8080 }) 

interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
    try{
        const decoded = jwt.verify(token, JWT_SECRET)
        if(typeof decoded === 'string'){
            return null;
        }

        if(!decoded || !decoded.userId){
            return null
        }

        return decoded.userId

    }catch(e){
        console.log(e,' --------------------error')
        return null;
    }

}

wss.on('connection',function connection(ws,request){
    const url = request.url;
    if(!url){
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || '';
    const userId = checkUser(token)

    if(userId === null){
        ws.close()
        return
    }

    users.push({
        userId,
        rooms: [],
        ws
    })

    ws.on('message', async function message(data){
        const parsedData = JSON.parse(data as unknown as string);
        console.log(parsedData,' ---------------- parseddata')
        if(parsedData.type === 'join_room'){
            const user = users.find( user => user.ws === ws)
            user?.rooms.push(parsedData.roomId);
        }

        if(parsedData.type === 'leave_room'){
            const user = users.find(x => x.ws === ws);
            if(!user){
                return;
            }

            user.rooms = user?.rooms.filter(x => x === parsedData.room)
        }
  
        if(parsedData.type === "chat"){
            
            const roomId = parsedData.roomId;
            const message = parsedData.message;
            console.log(roomId, ' ---- roomId ', typeof roomId)
            // here we should do check the message is not too long or there is not written any abnoxious thing

            // we can use queue for making it advance
            try{
                await prismaClient.chat.create({
                    data:{
                        roomId,
                        message,
                        userId
                    }
                })
    
                users.forEach(user => {
                    console.log(user.rooms,' -----------user.rooms')
                    if(user.rooms.includes(roomId)){
                        user.ws.send(JSON.stringify({
                            type: "chat",
                            message: message,
                            roomId
                        }))
                    }
                })
                // console.log(users,' ----------- users in chat ')
            }catch(e){
                console.log(e,'------------- error in chat block')
            }
        }

    })
})