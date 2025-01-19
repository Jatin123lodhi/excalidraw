"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home (){
  const [roomId, setRoomId] = useState<string>('')
  const router = useRouter()

  return <div>
    <input value={roomId} onChange={(e) => setRoomId(e.target.value) } placeholder="room id"/>
    <button onClick={() => {
      router.push(`/room/${roomId}`)
    }}>Join room</button>
  </div>
}