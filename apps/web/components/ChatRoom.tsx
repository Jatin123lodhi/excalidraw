import axios from "axios";
import { BACKEND_URL } from "../app/config";
import ChatRoomClient from "./ChatRoomClient";

interface IChatRoomProps{
    id: string
}

async function getChats(roomId: string){
    const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`)
    console.log(response,'---------------------response getchats')
    return response.data.messages
}

export default async function ChatRoom(props: IChatRoomProps){
    const { id } = props;
    const messages = await getChats(id)
    console.log(messages,' ---------- messgaes')
    return <ChatRoomClient messages={messages} roomId={id}/>
}