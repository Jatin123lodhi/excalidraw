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

export function initDraw(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')

    let existingShapes: Shape[] = []

    if (!ctx) return

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
        existingShapes.push({
            type: "rect",
            x: startX,
            y: startY,
            width: e.clientX - startX,
            height: e.clientY - startY
        })
        console.log(existingShapes)
    })
    canvas.addEventListener('mousemove', (e) => {
        if (isPressed) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            existingShapes.map((s: Shape) => {
                if (s.type === "rect") {
                    ctx.strokeRect(s.x, s.y, s.width, s.height)
                }
            })
            ctx.strokeRect(startX, startY, e.clientX - startX, e.clientY - startY)
            ctx.strokeStyle = '#f1f5f9'
        }
    })
}