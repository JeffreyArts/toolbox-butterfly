import { PageTransitionEffect, PageTransitionEffectOptions } from "@/models/page-transition"
import Matter from "matter-js"
import MatterService from "@/services/matter-js"
import _ from "lodash"

interface splitInHalf extends PageTransitionEffect {
    duration: number
    mWorld: Matter.World | null
    mRunner: Matter.Runner
    mEngine: Matter.Engine
    imageLeft: HTMLCanvasElement
    imageRight: HTMLCanvasElement
    rectangleLeft?: Matter.Body
    rectangleRight?: Matter.Body
    circle?: Matter.Body
    opacity: number
    context: CanvasRenderingContext2D
    matterElement: HTMLElement
}

class splitInHalf  {

    _DEV_addCanvasToBody(canvas: HTMLCanvasElement, name="test") {
        if (!this.devMode) {
            return
        }
        canvas.className = name
        const oldcanvas = document.querySelector("." + name) 
        if (oldcanvas) {
            oldcanvas.remove()
        }
        document.body.append(canvas)
    }

    rotateImageData(canvas: HTMLCanvasElement, angle: number) {
        const offscreenCanvas = document.createElement("canvas")
        offscreenCanvas.width = canvas.width*2    
        offscreenCanvas.height = canvas.height*2
        const offscreenCtx = offscreenCanvas.getContext("2d")
        if (!offscreenCtx) {
            throw new Error("Can't create context of canvas")
        }

        offscreenCtx.translate(offscreenCanvas.width / 2, offscreenCanvas.height / 2)
        // Rotate the canvas
        offscreenCtx.rotate(angle)
        // Draw the image, offsetting by half the width and height to center it
        offscreenCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2)
        return offscreenCanvas
    }

    createSubImage(x:number,y:number,w:number,h:number) {

        const image = document.createElement("canvas")
        image.width = w
        image.height = h
        const imageContext = image.getContext("2d")
        if (!imageContext) {
            throw new Error("can't make context out of canvas")
        }
        imageContext.drawImage(this.canvas, -x, -y)
        
        return image
    }
      
    start() {
        const ctx = this.canvas.getContext("2d")
        if (!ctx) {
            throw new Error("Can't create context")
        }
        this.imageLeft = this.createSubImage(0,0,this.canvas.width/2, this.canvas.height)
        this.imageRight = this.createSubImage(this.canvas.width/2,0,this.canvas.width/2, this.canvas.height)

        let position = "absolute"
        if (this.canvas.parentElement) {
            if (
                this.canvas.parentElement.nodeName.toLowerCase() === "body" ||
                this.canvas.parentElement.nodeName.toLowerCase() === "html"
            ) {
                position = "fixed"
            }
        }
        
        this.context = ctx
        this.matterElement = document.createElement("div")
        this.matterElement.id = "ME-" + Math.floor(Math.random()*10000)
        this.matterElement.style.width = window.innerWidth + "px"
        this.matterElement.style.height = window.innerHeight + "px"
        this.matterElement.classList.add("page-transition-domElement-matter-js")
        this.matterElement.style.position = position
        this.matterElement.style.top = "0"
        this.matterElement.style.left = "0"
        this.matterElement.style.bottom = "0"
        this.matterElement.style.right = "0"
        this.matterElement.style.zIndex = "3141592654"
        this.matterElement.style.pointerEvents = "none"
        
        if (this.devMode) {
            console.time("split-in-half")
            this.canvas.parentNode?.append(this.matterElement)
        }


        const mjs = MatterService.init(this.matterElement)
        this.mWorld = mjs.world
        this.mEngine = mjs.engine
        this.mRunner = mjs.runner

        // This variable is used as the "basis", this value will make the animation take 1 second, when duration = 1
        const timeScaleOffset = 1.44
        if (this.duration >= 1) {
            this.mEngine.timing.timeScale = timeScaleOffset / this.duration
        } else {
            this.mEngine.timing.timeScale = timeScaleOffset / this.duration
        }

        if (this.mEngine.timing.timeScale >= 29) {
            this.mEngine.timing.timeScale = 28.999
        }

        const height = this.canvas.clientHeight
        const width = this.canvas.clientWidth / 2
        this.mEngine.gravity.y = this.mEngine.gravity.y * this.duration

        this.rectangleLeft = Matter.Bodies.rectangle(width/2, height/2, width, height)
        this.rectangleRight = Matter.Bodies.rectangle(width + width/2, height/2, width, height)
        // Matter.Body.setVelocity(this.rectangle, {x : 0, y: -5 * this.duration})
        const circleSize = 128
        this.circle = Matter.Bodies.circle(this.canvas.width/2, this.canvas.height + circleSize, circleSize, {isStatic: true})
        Matter.World.add(this.mWorld, this.circle )
        Matter.World.add(this.mWorld, this.rectangleLeft )
        Matter.World.add(this.mWorld, this.rectangleRight )
    }

    draw() {
        if (this.imageLeft && this.imageRight && this.rectangleLeft && this.rectangleRight) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.context.fillStyle = `rgba(0,0,0,${this.opacity})`
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
            const imageLeft = this.rotateImageData(this.imageLeft, this.rectangleLeft.angle)
            const imageRight = this.rotateImageData(this.imageRight, this.rectangleRight.angle)
            this.context.drawImage(imageLeft, this.rectangleLeft.position.x - imageLeft.width / 2, this.rectangleLeft.position.y - imageLeft.height / 2)
            this.context.drawImage(imageRight, this.rectangleRight.position.x - imageRight.width / 2, this.rectangleRight.position.y - imageRight.height / 2)
        }
    }

    loop() {
        if (this.devMode) {
            this.matterElement.style.opacity = "0.5" // CHANGE THIS VARIABLE TO DISPLAY MATTER JS CANVAS FOR DEVELOPMENT
            this.matterElement.style.transformOrigin = this.canvas?.style.transformOrigin
            this.matterElement.style.scale = this.canvas?.style.scale
        }
        
        if (this.circle) {
            // this.circle.position.y += .01
        }

        if (this.rectangleLeft && this.rectangleRight) {
            const parent = this.canvas.parentElement
            if (!parent) {
                this.remove()
                return
            }

            this.opacity = 1-(.8 * this.rectangleLeft.position.y / this.canvas.clientHeight)
            
            if (this.rectangleLeft.position.y > this.canvas.clientHeight * 2 &&
                this.rectangleRight.position.y > this.canvas.clientHeight * 2) {
                this.finish()
            }
        } else {
            this.remove()
        }
    }

    finish() {
        this.finished = true
        this.remove()
    }

    remove() {
        this.mWorld = null
        if (this.mRunner && this.mEngine) {
            MatterService.destroy(this.mRunner, this.mEngine)
        }
        
        const el = document.querySelector(".page-transition-domElement-matter-js")
        if (el) {
            el.remove()
        }
        this.matterElement.remove()
        this.canvas.remove()

        if (this.devMode) {
            console.timeEnd("split-in-half")
        }
    }

    constructor (canvas: HTMLCanvasElement, duration: number, options: PageTransitionEffectOptions) {
        this.canvas = canvas
        this.duration = duration || 1
        if (!canvas) {
            throw new Error("Missing canvas")
        }
        this.devMode = false
        
        this.opacity = .8

        if (options && !_.isUndefined(options.devMode)) {
            this.devMode = options.devMode
        }
        return this
    }
}

export default splitInHalf