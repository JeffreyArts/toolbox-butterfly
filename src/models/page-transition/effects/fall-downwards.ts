import { PageTransitionEffect } from "@/models/page-transition"
import Matter from "matter-js"
import MatterService from "@/services/matter-js"
import gsap from "gsap"

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
        this.matterElement.style.position = "fixed"
        this.matterElement.style.top = "0"
        this.matterElement.style.left = "0"
        this.matterElement.style.bottom = "0"
        this.matterElement.style.right = "0"
        this.matterElement.style.zIndex = "3141592654"
        this.matterElement.style.pointerEvents = "none"
        this.matterElement.style.opacity = "0" // CHANGE THIS VARIABLE TO DISPLAY MATTER JS CANVAS FOR DEVELOPMENT

        this.canvas.parentNode?.append(this.matterElement)

        const mjs = MatterService.init(this.matterElement)
        this.mWorld = mjs.world
        this.mEngine = mjs.engine
        this.mRunner = mjs.runner
        const ratio = window.innerWidth / window.innerHeight > 1 ? window.innerHeight / window.innerWidth : window.innerWidth / window.innerHeight
        const height = 100
        const width = height * ratio
        this.mEngine.gravity.y = this.mEngine.gravity.y * this.duration

        this.rectangle = Matter.Bodies.rectangle(window.innerWidth/2 - width/2, window.innerHeight, width, height)
        // Matter.Body.setVelocity(this.rectangle, {x : 0, y: -5 * this.duration})
        // const circle = Matter.Bodies.circle(window.innerWidth/2 - width/2 - offset * .2, window.innerHeight, offset, {isStatic: true})
        Matter.World.add(this.mWorld, [this.rectangle] )
        console.log(this.rectangle)
    }

    draw() {
        if (this.rectangle) {
            this.canvas.style.translate = `0px ${this.rectangle.position.y - window.innerHeight}px`
            this.canvas.style.rotate = `${this.rectangle.angle}rad`
        }
    }

    loop() {
        if (this.rectangle) {
            const y = parseInt(this.canvas.style.translate.split(" ")[1], 10)
            console.log(y)
            if (y > window.innerHeight) {
                this.finish()
            }
            // this.canvas.style.translate = `${this.rectangle.position.x - window.innerWidth/2}px ${this.rectangle.position.y - window.innerHeight + 100}px`
            // this.canvas.style.rotate = `${this.rectangle.angle}rad`
        }
    }

    finish() {
        this.finished = true
        
        this.mWorld = null
        if (this.mRunner && this.mEngine) {
            MatterService.destroy(this.mRunner, this.mEngine)
        }
        
        this.matterElement.remove()
        this.canvas.remove()
    }

    constructor (canvas: HTMLCanvasElement, duration: number) {
        
        this.canvas = canvas
        this.duration = duration || .8
        if (!canvas) {
            throw new Error("Missing canvas")
        }

        return this
    }
}
export default slideDownwards