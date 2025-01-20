import { useEffect, useRef } from "react"
import { initDraw } from "../draw";

export default function Canvas({ roomId, socket }: { roomId: string, socket: WebSocket }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initDraw(canvasRef.current, roomId, socket)
        }
    }, [canvasRef])

    return <canvas ref={canvasRef} style={{ backgroundColor: 'black' }}>
    </canvas>
}