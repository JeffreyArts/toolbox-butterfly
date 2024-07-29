import { PageTransitionEffect, PageTransitionEffectOptions } from "@/models/page-transition"
import gsap from "gsap"
import _ from "lodash"

interface BubbleFromClick extends PageTransitionEffect {
    duration: number
    radius: number
    x: number
    y: number
    image: HTMLCanvasElement
    context: CanvasRenderingContext2D
    matterElement: HTMLElement
}

class BubbleFromClick  {

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
      
    start(domElement?: HTMLElement) {
        const ctx = this.canvas.getContext("2d")
        if (!ctx) {
            throw new Error("Can't create context")
        }
        this.context = ctx
        
        if (this.devMode) {
            console.time("bubble-from-click")
        }
        
        const original = document.createElement("canvas")
        original.width = this.canvas.width
        original.height = this.canvas.height
        const originalContext = original.getContext("2d")
        if (originalContext) {
            originalContext.drawImage(this.canvas, 0, 0)
            this.image = original
        }

        if (domElement) {
            const t = domElement.getBoundingClientRect()
            this.x = t.x +t.width/2
            this.y = t.y +t.width/2
        } else {
            this.x = this.canvas.width/2
            this.y = this.canvas.height/2
        }
        
        const max = this.canvas.width >= this.canvas.height ? this.canvas.width : this.canvas.height

        gsap.to(this, {
            radius: max,
            duration: this.duration,
            ease: "expo.in",
            onComplete: () => {
                this.finish()
            }
        })
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
        if (this.radius) {
            this.context.arc(this.x,this.y, this.radius, 0, 2 * Math.PI)
            this.context.fill()
        }
        this.context.closePath()
        this.context.globalCompositeOperation = defaultComposition
    }

    finish() {
        this.finished = true
        console.timeEnd("bubble-from-click")
        this.canvas.remove()
    }

    constructor (canvas: HTMLCanvasElement, duration: number, options: PageTransitionEffectOptions) {
        this.canvas = canvas
        this.duration = duration || 1
        if (!canvas) {
            throw new Error("Missing canvas")
        }
        
        this.devMode = false
        this.radius = 16

        if (options && !_.isUndefined(options.devMode)) {
            this.devMode = options.devMode
        }
        return this
    }
}

export default BubbleFromClick