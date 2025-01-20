import axios from "axios"
import { HTTP_BACKEND_URL } from "../config"

type Shape = {
    type: "rect",
    x: number,
    y: number,
    height: number,
    width: number
} |
{
    type: "circle",
    centerX: number,
    centerY: number,
    radius: number
}

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    const ctx = canvas.getContext('2d')

    let existingShapes: Shape[] = await getExistingShapes(roomId)
    if (!ctx) return
    console.log(existingShapes,'---------existingShapes')


    socket.onmessage = (event) => {
        const message = JSON.parse(event.data)
        const parsedShape = JSON.parse(message.message)
        if (message.type === 'chat') {
            existingShapes.push(parsedShape)
            clearCanvas(existingShapes,canvas,ctx)
        }
    }
    clearCanvas(existingShapes,canvas,ctx)

    let startX = 0
    let startY = 0
    let isPressed = false
    canvas.addEventListener('mousedown', (e) => {
        startX = e.clientX
        startY = e.clientY
        isPressed = true
    })
    canvas.addEventListener('mouseup', (e) => {
        isPressed = false
        const shape: Shape = {
            type: "rect",
            x: startX,
            y: startY,
            width: e.clientX - startX,
            height: e.clientY - startY
        }
        existingShapes.push(shape)
        console.log(existingShapes)

        socket.send(JSON.stringify({
            type: "chat",
            roomId,
            message: JSON.stringify(shape)
        }))
    })
    canvas.addEventListener('mousemove', (e) => {
        if (isPressed) {
            clearCanvas(existingShapes,canvas,ctx)
            ctx.strokeRect(startX, startY, e.clientX - startX, e.clientY - startY)
        }
    })
}

function clearCanvas(existingShapes:Shape[],canvas:HTMLCanvasElement,ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    console.log(existingShapes,'---- exsiting shape in clear canvas')
    existingShapes.map((s: Shape) => {
        if (s.type === "rect") {
            ctx.strokeStyle = '#f1f5f9'
            ctx.strokeRect(s.x, s.y, s.width, s.height)
        }
    })
}

async function getExistingShapes(roomId: string) {
    const response = await axios.get(`${HTTP_BACKEND_URL}/chats/${roomId}`)
    return response.data.messages.map((x:{message: string}) => JSON.parse(x.message))
}