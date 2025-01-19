import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket(){
    const [loading, setLoading] = useState<boolean>(true)
    const [socket , setSocket] = useState<WebSocket>()

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkOTJjOGZhNi0yZmM2LTRmMjMtYWI3MS03NzNjZmY1Y2FjYmQiLCJpYXQiOjE3MzY4NzE3NTV9.IOMyIxJ40UfPjuUvET9pyfM_LxoQvggG6ec9WToKiPg`)
        ws.onopen = () => {
            setLoading(false)
            setSocket(ws)
        }
    },[])

    return {
        loading,
        socket
    }
}