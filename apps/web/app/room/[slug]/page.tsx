import axios from "axios"
import { BACKEND_URL } from "../../config"
import ChatRoom from "../../../components/ChatRoom"
interface IChatRoomProps{
    params: {
        slug: string
    }
}

async function getRoomId(slug:string) {
    try{
        
        const response = await axios.get(`${BACKEND_URL}/room/${slug}`)
        return response.data.roomId
    }catch(e){
        console.log(e)
        return null
    }
}

export default async function ChatRoom1(props: IChatRoomProps){
    const { params } = props

    const slug = (await params).slug
    const roomId = await getRoomId(slug)
    
    if(!roomId)return <div>Room id not found</div>
    return <div>Chat room - {roomId}
        <ChatRoom  id={roomId} />
    </div>
}