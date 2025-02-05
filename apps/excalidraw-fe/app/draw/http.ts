import { HTTP_BACKEND_URL } from "../config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${HTTP_BACKEND_URL}/chats/${roomId}`);
    const messages = res.data.messages;

    const shapes = messages.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message)
        return messageData.shape;
    })

    return shapes;
}

export async function deleteAllShapes(roomId: string){
    const res = await axios.delete(`${HTTP_BACKEND_URL}/chats/${roomId}`)
    console.log(res)
}