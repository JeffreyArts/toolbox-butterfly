import { PageTransitionEffect } from "@/models/page-transition"
import gsap from "gsap"

interface slideDownwards extends PageTransitionEffect {
    duration: number
    x: number
    y: number
    image: ImageData
    context: CanvasRenderingContext2D
}

class slideDownwards  {
    start() {
        const ctx = this.canvas.getContext("2d")
        if (!ctx) {
            throw new Error("Can't create context")
        }
        this.context = ctx

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
        this.canvas.style.marginTop = `${this.y}px`
    }

    finish() {
        this.finished = true
        this.canvas.remove()
    }

    constructor (canvas: HTMLCanvasElement, duration: number) {
        
        this.canvas = canvas
        this.duration = duration || .8
        if (!canvas) {
            throw new Error("Missing canvas")
        }

        this.x = 0
        this.y = 0
        return this
    }
}
export default slideDownwards