import { PageTransitionEffect, PageTransitionEffectOptions } from "@/models/page-transition"
import Matter from "matter-js"
import MatterService from "@/services/matter-js"
import _ from "lodash"

interface slideDownwards extends PageTransitionEffect {
    duration: number
    mWorld: Matter.World | null,
    mRunner: Matter.Runner,
    mEngine: Matter.Engine,
    image: ImageData
    context: CanvasRenderingContext2D
    matterElement: HTMLElement
    rectangle: Matter.Body | undefined
}

class slideDownwards  {
    start() {
        const ctx = this.canvas.getContext("2d")
        if (!ctx) {
            throw new Error("Can't create context")
        }
        
        this.context = ctx
        this.matterElement = document.createElement("div")
        this.matterElement.style.width = window.innerWidth + "px"
        this.matterElement.style.height = window.innerHeight + "px"
        this.matterElement.classList.add("page-transition-domElement-matter-js")
        this.matterElement.style.position = "absolute"
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
        // const circle = Matter.Bodies.circle(window.innerWidth/2 - width/2 - offset * .2, window.innerHeight, offset, {isStatic: true})
        Matter.World.add(this.mWorld, [this.rectangle] )
    }

    draw() {
        if (this.rectangle) {
            this.canvas.style.top = ` ${this.rectangle.position.y - window.innerHeight/2}px`
            this.canvas.style.rotate = `${this.rectangle.angle}rad`
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
                return
            }
            
            if (this.canvas.offsetTop + this.canvas.clientHeight/2 > this.canvas.clientHeight  * 1.5) {
                this.finish()
            }
        }
    }

    finish() {
        this.finished = true

        if (this.devMode) {
            console.timeEnd("fall-downwards")
        }

        this.mWorld = null
        if (this.mRunner && this.mEngine) {
            MatterService.destroy(this.mRunner, this.mEngine)
        }
        
        this.matterElement.remove()
        this.canvas.remove()
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