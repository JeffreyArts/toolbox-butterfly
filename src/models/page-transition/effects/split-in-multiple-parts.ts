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
    parts: Array<{
        canvas: HTMLCanvasElement,
        body?: Matter.Body
    }>
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

        for (let index = 0; index < this.amountOfParts; index++) {
            this.parts.push({
                canvas: this.createSubImage(index * this.canvas.width/this.amountOfParts,0,this.canvas.width/this.amountOfParts, this.canvas.height)
            })
        }
            
        let position = "absolute"
        if (this.canvas.parentElement) {
            position = this.canvas.parentElement.nodeName === "body" ? "fixed" : "absolute"
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

        _.each(this.parts, (part, index) => {
            const height = this.canvas.height
            const width = this.canvas.width/this.amountOfParts
            const x = this.canvas.width/this.amountOfParts * index + width/2
            const y = height/2
            part.body = Matter.Bodies.rectangle(x,y,width,height)
            if (!this.mWorld) {
                throw new Error("Missing mWorld")
            }
            
            // Matter.Body.setAngle(part.body, 1)
            Matter.Body.setAngularVelocity(part.body, Math.random() * .001 - .0005)
            Matter.Body.setVelocity(part.body, {x : 0 + index * .1, y: Math.random() * -1})
            Matter.World.add(this.mWorld, part.body )
        })
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.fillStyle = `rgba(0,0,0,${this.opacity})`
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

        _.each(this.parts, (part, index) => {
            if (!part.body) {
                return
            }

            const rotatedCanvas = this.rotateImageData(part.canvas, part.body.angle)
            this.context.drawImage(rotatedCanvas, part.body.position.x - rotatedCanvas.width / 2, part.body.position.y - rotatedCanvas.height / 2)
        })
    }

    loop() {
        if (this.devMode) {
            this.matterElement.style.opacity = "0.5" // CHANGE THIS VARIABLE TO DISPLAY MATTER JS CANVAS FOR DEVELOPMENT
            this.matterElement.style.transformOrigin = this.canvas?.style.transformOrigin
            this.matterElement.style.scale = this.canvas?.style.scale
        }

        let sumY = 0
        
        if (this.parts.length > 0) {
            const parent = this.canvas.parentElement
            if (!parent) {
                this.remove()
                return
            }
            _.each(this.parts, p => {
                if (p.body) {
                    sumY += p.body?.position.y
                }
            })
            sumY = sumY/this.parts.length
            const lastBody = _.minBy(this.parts, part => {
                return part.body?.position.y
            })
            const middleBody = this.parts[Math.round(this.parts.length/2)].body
            if (lastBody?.body) {
                this.opacity = 1-(.8 * lastBody.body.position.y / this.canvas.clientHeight)
            }
            
            if (lastBody?.body && lastBody.body.position.y > this.canvas.clientHeight * 2) {
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