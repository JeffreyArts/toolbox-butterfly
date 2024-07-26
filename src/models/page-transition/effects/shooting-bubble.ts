import { PageTransitionEffect, PageTransitionEffectOptions } from "@/models/page-transition"
import Matter from "matter-js"
import MatterService from "@/services/matter-js"
import _ from "lodash"

interface splitInMultipleParts extends PageTransitionEffect {
    duration: number
    mWorld: Matter.World | null,
    mRunner: Matter.Runner,
    mEngine: Matter.Engine,
    amountOfParts: number
    bubble?: Matter.Body
    image: HTMLCanvasElement
    opacity: number
    context: CanvasRenderingContext2D
    matterElement: HTMLElement
}

class splitInMultipleParts  {

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
        offscreenCanvas.width = this.canvas.width    
        offscreenCanvas.height = this.canvas.height
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
            
        const original = document.createElement("canvas")
        original.width = this.canvas.width
        original.height = this.canvas.height
        const originalContext = original.getContext("2d")
        if (originalContext) {
            originalContext.drawImage(this.canvas, 0, 0)
            this.image = original
        }

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
            console.time("split-in-multiple-parts")
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

        this.mEngine.gravity.y = this.mEngine.gravity.y * this.duration
        
        const startingSize = 100
        this.bubble = Matter.Bodies.circle(- startingSize, this.canvas.height + startingSize, startingSize, {
            frictionAir: .08
            // frictionAir: startingSize
        })
        Matter.Body.setVelocity(this.bubble, {x : (this.canvas.width - startingSize) * .1, y: -this.canvas.height * .1})
        Matter.World.add(this.mWorld, this.bubble  )
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.drawImage(this.image, 0, 0)
        
        // Prepare masking
        this.context.beginPath()
        this.context.fillStyle = "#f09"
        const defaultComposition = this.context.globalCompositeOperation 
        this.context.globalCompositeOperation = "destination-out"        
        
        // Mask
        if (this.bubble && this.bubble.circleRadius) {
            this.context.arc(this.bubble.position.x,this.bubble.position.y, this.bubble.circleRadius, 0, 2 * Math.PI)
            this.context.fill()
        }
        this.context.closePath()
        this.context.globalCompositeOperation = defaultComposition


    }

    loop() {
        if (this.devMode) {
            this.matterElement.style.opacity = "0.5" // CHANGE THIS VARIABLE TO DISPLAY MATTER JS CANVAS FOR DEVELOPMENT
            this.matterElement.style.transformOrigin = this.canvas?.style.transformOrigin
            this.matterElement.style.scale = this.canvas?.style.scale
        }

        if (this.bubble && this.bubble.circleRadius) {
            this.bubble.circleRadius = this.bubble.circleRadius * 1.05
            
            if (this.bubble.position.x > this.canvas.clientWidth || 
                (this.bubble.position.y > this.canvas.clientHeight && this.bubble.position.x > 100) || 
                (this.bubble.circleRadius > this.canvas.clientHeight && this.bubble.circleRadius > this.canvas.clientWidth)
            ) {
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
        this.bubble = undefined
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
            console.timeEnd("split-in-multiple-parts")
        }
    }

    constructor (canvas: HTMLCanvasElement, duration: number, options: PageTransitionEffectOptions) {
        this.canvas = canvas
        this.duration = duration || 1
        if (!canvas) {
            throw new Error("Missing canvas")
        }
        this.devMode = false
        
        this.parts = []
        this.amountOfParts = 8

        if (options && !_.isUndefined(options.devMode)) {
            this.devMode = options.devMode
        }
        return this
    }
}

export default splitInMultipleParts