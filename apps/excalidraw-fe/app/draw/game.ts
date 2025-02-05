import { Tool } from "../components/Canvas";
import { getExistingShapes } from "./http";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    pathCooridnates: { x: number, y: number }[]
}

export class Game {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[]
    private roomId: string;
    private isDrawing: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";
    private pencilPathCoordinates: { x: number, y: number }[] = []
    private zoom: number;
    private scaledOffsetX: number;
    private scaledOffsetY: number;
    private panOffsetX: number;
    private panOffsetY: number;
    private isSpacePressed: boolean;
    private isMouseDown: boolean;
    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.isDrawing = false;
        this.zoom = 1;
        this.scaledOffsetX = 0;
        this.scaledOffsetY = 0;
        this.panOffsetX = 0;
        this.panOffsetY = 0;
        this.isSpacePressed = false;
        this.isMouseDown = false
        this.init();
        this.initHandlers();
        this.initEventListeners();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)

        this.canvas.removeEventListener('wheel', this.mouseWheel)

        document.removeEventListener("keydown", this.keyDown.bind(this))

        document.removeEventListener("keydown", this.keyUp.bind(this))
    }

    setTool(tool: "circle" | "pencil" | "rect") {
        this.selectedTool = tool;
    }

    deleteCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.existingShapes = []
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type == "chat") {
                const parsedShape = JSON.parse(message.message)
                this.existingShapes.push(parsedShape.shape)
                this.clearCanvas();
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const scaledWidth = this.canvas.width * this.zoom;
        const scaledHeight = this.canvas.height * this.zoom;
        const scaledOffsetX = (scaledWidth - this.canvas.width) / 2;
        const scaledOffsetY = (scaledHeight - this.canvas.height) / 2;
        this.scaledOffsetX = scaledOffsetX;
        this.scaledOffsetY = scaledOffsetY;

        this.ctx.save();
        this.ctx.scale(this.zoom, this.zoom);

        this.ctx.translate(this.panOffsetX * this.zoom -scaledOffsetX/this.zoom,this.panOffsetY * this.zoom -scaledOffsetY/this.zoom);

        // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = "rgba(255, 255, 255)"
        this.existingShapes.map((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "pencil") {
                this.ctx.beginPath();
                if (shape.pathCooridnates.length === 1) {
                    this.ctx.moveTo(shape.pathCooridnates[0].x, shape.pathCooridnates[0].y);
                    this.ctx.lineTo(shape.pathCooridnates[0].x + 1, shape.pathCooridnates[0].y + 1); // tiny line
                    this.ctx.stroke();
                } else {
                    for (let i = 0; i < shape.pathCooridnates.length; i++) {
                        this.ctx.lineTo(shape.pathCooridnates[i].x, shape.pathCooridnates[i].y)
                        this.ctx.stroke()
                    }
                }
                this.ctx.closePath()
            }
        })

        this.ctx.restore();
    }

    keyDown(e: KeyboardEvent) {
        if (e.code === "Space" && !this.isMouseDown) {
            this.isSpacePressed = true;
            this.canvas.style.cursor = 'grab';
        }
    }

    keyUp(e: KeyboardEvent) {
        if (e.code === "Space") {
            this.isSpacePressed = false;
            this.canvas.style.cursor = 'default';
        }
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.isMouseDown = true;
        if(this.isSpacePressed) return;
        this.isDrawing = true
        this.startX = e.clientX
        this.startY = e.clientY
        if (this.selectedTool === 'pencil') {
            this.ctx.beginPath()
            this.ctx.moveTo(e.clientX, e.clientY)
            this.pencilPathCoordinates.push({ x: e.clientX/this.zoom - this.panOffsetX * this.zoom + this.scaledOffsetX/this.zoom, y: e.clientY/this.zoom - this.panOffsetY * this.zoom + this.scaledOffsetY/this.zoom })
        }
    }
    mouseUpHandler = (e: MouseEvent) => {
        this.isDrawing = false
        if(this.isSpacePressed) return; 
        const width = (e.clientX - this.startX)/this.zoom;
        const height = (e.clientY - this.startY)/this.zoom;
        const selectedTool = this.selectedTool;
        let shape: Shape | null = null;
        if (selectedTool === "rect") {
            shape = {
                type: "rect",
                x: this.startX/this.zoom - this.panOffsetX * this.zoom + this.scaledOffsetX/this.zoom,
                y: this.startY/this.zoom - this.panOffsetY * this.zoom + this.scaledOffsetY/this.zoom,
                height,
                width
            }
        } else if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: (this.startX)/this.zoom + radius - this.panOffsetX * this.zoom + this.scaledOffsetX/this.zoom,
                centerY: (this.startY)/this.zoom + radius - this.panOffsetY * this.zoom + this.scaledOffsetY/this.zoom,
            }
        } else if (selectedTool === 'pencil') {
            if (this.pencilPathCoordinates.length === 1) {
                this.ctx.moveTo(e.clientX, e.clientY);
                this.ctx.lineTo(e.clientX + 1, e.clientY + 1);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            else {
                this.ctx.closePath()
            }
            shape = {
                type: "pencil",
                pathCooridnates: this.pencilPathCoordinates
            }
            this.pencilPathCoordinates = []
        }

        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);
        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }))
        this.clearCanvas();
        this.isDrawing = false;
    }
    mouseMoveHandler = (e: MouseEvent) => {
        if (this.isDrawing) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            this.ctx.strokeStyle = "rgba(255, 255, 255)"
            const selectedTool = this.selectedTool;
            if (selectedTool === "rect") {
                this.clearCanvas();
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            } else if (selectedTool === "circle") {
                this.clearCanvas();
                const radius = Math.max(width, height) / 2;
                const centerX = this.startX + radius;
                const centerY = this.startY + radius;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (selectedTool === 'pencil') {
                this.ctx.lineTo(e.clientX, e.clientY)
                this.pencilPathCoordinates.push({ x: e.clientX/this.zoom - this.panOffsetX * this.zoom + this.scaledOffsetX/this.zoom, y: e.clientY/this.zoom - this.panOffsetY * this.zoom + this.scaledOffsetY/this.zoom })
                this.ctx.stroke()
            }
        }

        if(this.isSpacePressed && this.isMouseDown){
            this.panOffsetX += e.movementX 
            this.panOffsetY += e.movementY 
            this.clearCanvas();
        }
    }

    mouseWheel = (e: WheelEvent) => {
        // working on only zooming
        if(e.ctrlKey){
            e.preventDefault();
            this.zoom += e.deltaY * -0.001;
            this.zoom = Math.min(Math.max(0.1, this.zoom), 20);
            
        }else{
            if(e.shiftKey){ // horizontal panning
                this.panOffsetX -= e.deltaY * -0.1
            }else{ // vertical panning
                this.panOffsetY -= e.deltaY * -0.1
            }
        }
        this.clearCanvas();
    }

    initEventListeners() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)

        this.canvas.addEventListener("wheel", this.mouseWheel)

        document.addEventListener('keydown', this.keyDown.bind(this));

        document.addEventListener('keyup', this.keyUp.bind(this));

    }
}