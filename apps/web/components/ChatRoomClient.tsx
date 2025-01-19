"use client"

import { useEffect, useState } from "react"
import { useSocket } from "../hooks/useSocket"

interface IChatRoomClientProps{
    messages: {message: string}[],
    roomId: string
}

export default function ChatRoomClient(props: IChatRoomClientProps){
    const { messages, roomId } = props
    const [chats, setChats] = useState(messages)
    const [currentMessage, setCurrentMessage] = useState('');
    const {socket,loading} = useSocket()
    console.log(messages,'-------------------------messges in chat room client')
    useEffect(() => {
        if(socket && !loading){

            socket.send(JSON.stringify({
                type: "join_room",
                roomId
            }))

            socket.onmessage = (event) => {
                console.log(event.data,' -----------event.data')
                const parsedData = JSON.parse(event.data)
                console.log(parsedData,' ------------------parsedData')
                console.log('check 1')
                if(parsedData.type === 'chat'){
                    console.log('check 2')
                    const newChats = [...chats,{message: parsedData.message}]
                    console.log(newChats,' -----------new chats')
                    setChats(newChats)
                }else{
                    console.log('else block')
                }
                console.log('check 3')
            }
        }
        return () =>{
            socket?.close()
        }
    },[socket,loading,roomId])
    
    return <div>
        {chats.map((m,id) => <div key={id}>{m.message}</div>)}
        <input placeholder="Enter messgae" value={currentMessage} onChange={e => setCurrentMessage(e.target.value)}  />
        <button onClick={() => {
            socket?.send(JSON.stringify({
                type: "chat",
                message: currentMessage,
                roomId: parseInt(roomId)
            }))
            setCurrentMessage('')
        }}>Send message</button>
    </div>
}