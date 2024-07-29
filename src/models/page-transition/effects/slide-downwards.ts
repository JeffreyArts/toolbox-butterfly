import { PageTransitionEffect, PageTransitionEffectOptions } from "@/models/page-transition"
import _ from "lodash"
import gsap from "gsap"

interface slideDownwards extends PageTransitionEffect {
    duration: number
    x: number
    y: number
    image: HTMLCanvasElement
    context: CanvasRenderingContext2D
}

class slideDownwards  {
    start() {
        const ctx = this.canvas.getContext("2d")
        if (!ctx) {
            throw new Error("Can't create context")
        }
        this.context = ctx
        
        if (this.devMode) {
            console.time("slide-downwards")
        }
        
        const original = document.createElement("canvas")
        original.width = this.canvas.width
        original.height = this.canvas.height
        const originalContext = original.getContext("2d")
        if (originalContext) {
            originalContext.drawImage(this.canvas, 0, 0)
            this.image = original
        }
        
        gsap.to(this, {
            y: this.canvas.clientHeight,
            duration: this.duration,
            ease: "expo.in",
            onComplete: () => {
                this.finish()
            }
        })
    }

    draw() {
        if (this.image) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.context.drawImage(this.image, 0, this.y)
        }
    }

    finish() {
        this.finished = true
        console.timeEnd("slide-downwards")
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
        
        this.x = 0
        this.y = 0
        return this
    }
}
export default slideDownwards