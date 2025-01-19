"use client"
import { useEffect, useRef } from "react"

export default function CanvasRoom(){
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if(canvasRef.current){
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d')

            if(!ctx) return
            // ctx.strokeRect(25,25,100,100)

            let startX = 0
            let startY = 0
            let isPressed = false
            canvas.addEventListener('mousedown',(e) => {
                startX = e.clientX
                startY = e.clientY
                isPressed = true
            })
            canvas.addEventListener('mouseup',(e) => {
                console.log(e.clientX, e.clientY,'------- mouse up')
                isPressed = false
            })
            canvas.addEventListener('mousemove',(e) =>{
                if(isPressed){
                    ctx.clearRect(0,0,window.innerWidth, window.innerHeight)
                    ctx.strokeRect(startX, startY, e.clientX-startX, e.clientY- startY)
                }
            })
        }
    },[canvasRef])

    return <div>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}>
        </canvas>
    </div>
}