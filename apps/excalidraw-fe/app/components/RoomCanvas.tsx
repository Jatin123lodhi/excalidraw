"use client"
import { useEffect, useState } from "react"
import { WS_URL } from "../config"
import Canvas from "./Canvas"

export default function RoomCanvas({ roomId }: { roomId: string }) {

    const [socket, setSocket] = useState<WebSocket | null>(null)

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxOTExMWMwZC04NGFmLTQ4MGItYjBlYy1hODY3YmEzNDM2NWQiLCJpYXQiOjE3MzczOTk5NzZ9.9f3pFMe-Id6tQlGbPctb0BJgxSNHJ3012pW6lcMg79s`)
        ws.onopen = () => {
            setSocket(ws)
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }))
        }
    }, [])


    if (!socket) {
        return <div>Connection to server...</div>
    }

    return <Canvas roomId={roomId} socket={socket} />

}
