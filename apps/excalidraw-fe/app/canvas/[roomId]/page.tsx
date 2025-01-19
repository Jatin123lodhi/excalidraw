"use client"
import { initDraw } from "@/app/draw"
import { useEffect, useRef } from "react"

export default function CanvasRoom(){
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if(canvasRef.current){
            initDraw(canvasRef.current)
        }
    },[canvasRef])

    return <div>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} style={{backgroundColor:'black'}}>
        </canvas>
    </div>
}