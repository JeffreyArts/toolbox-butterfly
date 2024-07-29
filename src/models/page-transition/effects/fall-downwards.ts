import { PageTransitionEffect, PageTransitionEffectOptions } from "@/models/page-transition"
import Matter from "matter-js"
import MatterService from "@/services/matter-js"
import _ from "lodash"

interface slideDownwards extends PageTransitionEffect {
    duration: number
    mWorld: Matter.World | null,
    mRunner: Matter.Runner,
    mEngine: Matter.Engine,
    image: HTMLCanvasElement
    context: CanvasRenderingContext2D
    matterElement: HTMLElement
    rectangle: Matter.Body | undefined
}

class slideDownwards  {

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
            console.time("fall-downwards")
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
        const width = this.canvas.clientWidth
        this.mEngine.gravity.y = this.mEngine.gravity.y * this.duration

        this.rectangle = Matter.Bodies.rectangle(width/2, height/2, width, height)
        // Matter.Body.setVelocity(this.rectangle, {x : 0, y: -5 * this.duration})
        // const circle = Matter.Bodies.circle(window.innerWidth/2 - width/2 - 100 * .2, window.innerHeight, 100, {isStatic: true})
        // Matter.World.add(this.mWorld, [circle] )
        Matter.World.add(this.mWorld, [this.rectangle] )
    }

    draw() {
        if (this.image && this.rectangle) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
            const image = this.rotateImageData(this.image, this.rectangle.angle)
            this.context.drawImage(image, this.rectangle.position.x - image.width / 2, this.rectangle.position.y - image.height / 2)
        }
    }

    loop() {
        if (this.devMode) {
            this.matterElement.style.opacity = "0.5" // CHANGE THIS VARIABLE TO DISPLAY MATTER JS CANVAS FOR DEVELOPMENT
            this.matterElement.style.transformOrigin = this.canvas?.style.transformOrigin
            this.matterElement.style.scale = this.canvas?.style.scale
        }
        
        if (this.rectangle) {
            const parent = this.canvas.parentElement
            if (!parent) {
                this.remove()
                return
            }
            
            if (this.rectangle.position.y > this.canvas.clientHeight * 2) {
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
            console.timeEnd("fall-downwards")
        }
    }

    constructor (canvas: HTMLCanvasElement, duration: number, options: PageTransitionEffectOptions) {
        this.canvas = canvas
        this.duration = duration || 1
        if (!canvas) {
            throw new Error("Missing canvas")
        }
        this.devMode = false

        if (options && !_.isUndefined(options.devMode)) {
            this.devMode = options.devMode
        }
        return this
    }
}

export default slideDownwards