import _ from "lodash"
import Color from "color"
import gsap from "gsap"
import domtoimage from "dom-to-image"

export type DoorOptions = {
    x: number
    y: number
    sourceElement: HTMLElement
    targetCanvas: HTMLCanvasElement
    maxAngle?: number
    width?: number
    height?: number
    hinges?: "left" | "right"
} 

interface Door {
    isOpen: boolean
    inTransition: boolean
    x: number,
    y: number,
    width: number,
    height: number
    dev: boolean
    door: {
        points: Array<{x: number, y:number}>,
        angle: number
        maxAngle: number
    },
    frame: {
        perc: number,
        left: Array<{x: number, y:number}>
        right: Array<{x: number, y:number}>
        color: string
    },
    frameBuild: boolean // internal value to keep track the door can be opened/close
    padding: {
        top: number
        left: number
        right: number
        bottom: number
    }
    hinges: "left" | "right"
    canvasLayers: Array<{
        name: string
        canvas: HTMLCanvasElement
        context: CanvasRenderingContext2D
    }>
    removed: boolean,
    sourceElement: HTMLElement
    canvas: HTMLCanvasElement
    targetCanvas: HTMLCanvasElement
}

class Door  {
    _DEV_addCanvasToBody(canvas: HTMLCanvasElement, name="test") {
        if (!this.dev) {
            return
        }
        canvas.className = name
        const oldcanvas = document.querySelector("." + name) 
        if (oldcanvas) {
            oldcanvas.remove()
        }
        document.body.append(canvas)
    }

    #draw() {
        const targetLayer = _.find(this.canvasLayers, {name: "targetLayer"})
        if (this.removed) {
            if (targetLayer) {
                targetLayer.context.clearRect(0,0,targetLayer.canvas.width, targetLayer.canvas.height)
            }
            return
        }
        const doorLayer = _.find(this.canvasLayers, {name: "doorLayer"})
        const frameLayer = _.find(this.canvasLayers, {name: "frameLayer"})

        this.#clear()
        this.#drawFrame()
        this.#drawDoor()

        if (doorLayer && targetLayer && frameLayer) {
            // Remove old doorLayer
            targetLayer.context.clearRect(this.x - doorLayer.canvas.width/2, this.y - doorLayer.canvas.height + this.padding.bottom, doorLayer.canvas.width,doorLayer.canvas.height)
            // Add new doorLayer to targetLayer
            targetLayer.context.drawImage(frameLayer.canvas, this.x - frameLayer.canvas.width/2, this.y - frameLayer.canvas.height + this.padding.bottom)
            targetLayer.context.drawImage(doorLayer.canvas, this.x - doorLayer.canvas.width/2, this.y - doorLayer.canvas.height + this.padding.bottom)
        }
        
        requestAnimationFrame(() => {
            this.#draw()
        })
    }

    #createScreenshotLayer() {
        return new Promise<string>((resolve, reject) => {
            if (!this.sourceElement) {
                return reject("sourceElement has to be set")
            }
            this.targetCanvas.width = this.sourceElement.clientWidth
            this.targetCanvas.height = this.sourceElement.clientHeight
            if (!_.find(this.canvasLayers, {name: "screenshotLayer"})) {
                const canvas = document.createElement("canvas")
                canvas.width = this.sourceElement.clientWidth
                canvas.height = this.sourceElement.clientHeight
                const context = canvas.getContext("2d")
                if (context) {
                    this.canvasLayers.push({
                        name: "screenshotLayer",
                        canvas,
                        context
                    })
                }
            }
            
            domtoimage.toPng(this.sourceElement).then( (dataUrl) => {
                const image = new Image()
                image.onload = () => {
                    const screenshotLayer = _.find(this.canvasLayers, {name: "screenshotLayer"})
                    if (!screenshotLayer) {
                        throw new Error("screenshotLayer should be set")
                    }
                    screenshotLayer.context.drawImage(image, 0, 0)
                }
                image.src = dataUrl
                resolve(dataUrl)
            }).catch((err)=> {
                console.error(err)
                reject(err)
            })
        })
    }

    #createDoorLayer() {
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        if (context) {
            this.canvasLayers.push({
                name: "doorLayer",
                canvas,
                context
            })
        }
        return canvas
    }

    #createFrameLayer() {
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        if (context) {
            this.canvasLayers.push({
                name: "frameLayer",
                canvas,
                context
                
            })
        }
        return canvas
    }

    #clear() {
        const door = _.find(this.canvasLayers, {name: "doorLayer"})
        if (door) {
            door.context.clearRect(0,0,door.canvas.width, door.canvas.height)
        }

        const frame = _.find(this.canvasLayers, {name: "frameLayer"})
        if (frame) {
            frame.context.clearRect(0,0,frame.canvas.width, frame.canvas.height)
        }
    }

    #drawDoor() {
        if (!this.frameBuild) {
            return 
            // Don't draw the door before the frame has been build   
        }
        
        const screenshotLayer = _.find(this.canvasLayers, {name: "screenshotLayer"})
        if (!screenshotLayer) {
            return console.warn("Missing screenshot layer to create door from")
        }
        
        const doorLayer = _.find(this.canvasLayers, {name: "doorLayer"})
        if (!doorLayer) {
            console.error("Missing required doorLayer.")
            return
        }

        const frameLayer = _.find(this.canvasLayers, {name: "frameLayer"})
        if (!frameLayer) {
            console.error("Missing required frameLayer.")
            return
        }


        const offset = {
            x: doorLayer.canvas.width / 2,
            y: doorLayer.canvas.height - this.padding.bottom
        }

        const coords = _.map(this.door.points, point => {
            return {
                x: point.x + offset.x,
                y: point.y + offset.y,
            }
        })
        
        const xMax = _.maxBy(this.door.points, "x")
        const xMin =_.minBy(this.door.points, "x")
        const yMin =_.minBy(this.door.points, "y")
        const yMax =_.maxBy(this.door.points, "y")
        let doorCoords = {
            xMax: 0,
            xMin: 0,
            yMax: 0,
            yMin: 0,
        }

        if (xMax && xMin && yMin && yMax) {
            doorCoords = {
                xMax: xMax.x,
                xMin: xMin.x,
                yMax: yMax.y,
                yMin: yMin.y
            }
        }
        if (!xMax || !xMin || !yMin || !yMax) {
            console.error("Invalid door points")
        }
        doorLayer.context.clearRect(0,0,doorLayer.canvas.width, doorLayer.canvas.height)
        
        // Draw door
        const doorImageCanvas = screenshotLayer.context.getImageData(this.x - this.width/2 , this.y - this.height, this.width, this.height)
        doorLayer.context.putImageData(doorImageCanvas, this.padding.left, this.padding.top)
        
        // Draw outline door
        doorLayer.context.lineWidth = 1
        doorLayer.context.strokeStyle = new Color(this.frame.color).hex()
        this.#drawLine(doorLayer.context, coords)
        
        // Draw frame "hallway"
        frameLayer.context.beginPath()
        frameLayer.context.fillStyle = new Color("#fff").hex()
        frameLayer.context.rect(this.padding.left, this.padding.top, this.width, this.height)
        frameLayer.context.fill()

        // Draw fame glow
        frameLayer.context.fillStyle = "transparent"
        frameLayer.context.shadowColor =  new Color("#fff").fade(1 - (this.door.angle / this.door.maxAngle)).hexa()
        frameLayer.context.shadowBlur = ((this.padding.left + this.padding.right) / 4)
        frameLayer.context.rect(this.padding.left, this.padding.top, this.width, this.height)
        frameLayer.context.fill()
        frameLayer.context.closePath()
        
        // Remove glow behind door
        this.#getFrameGlowMask()
        
        // Turn door open
        const doorImage = doorLayer.context.getImageData(this.padding.left, this.padding.top, this.width, this.height)
        const temp = this.#skew3D(doorImage, this.door.angle/100, this.padding)
        const rotatedDoor = temp.getImageData(0, 0, temp.canvas.width, temp.canvas.height)
        doorLayer.context.putImageData(rotatedDoor, this.padding.left, 0)
    
        // For dev purposes, show canvas in body
        if (this.dev) {
            this._DEV_addCanvasToBody(doorLayer.canvas, "doorLayer")
        }
    }

    #drawFrame() {
        const frameLayer = _.find(this.canvasLayers, {name: "frameLayer"})
        
        if (!frameLayer) {
            console.error("Missing required frameLayer.")
            return
        }
        
        const offset = {
            x: frameLayer.canvas.width / 2,
            y: frameLayer.canvas.height - this.padding.bottom
        }
        
        const coordsLeft = _.map(this.frame.left, point => {
            return {
                x: point.x + offset.x,
                y: point.y + offset.y,
            }
        })

        const coordsRight = _.map(this.frame.right, point => {
            return {
                x: point.x + offset.x,
                y: point.y + offset.y,
            }
        })
        const strokeColor = new Color("#aaa")
        this.frame.color = strokeColor.hex()
        frameLayer.context.lineWidth = 1
        frameLayer.context.strokeStyle = this.frame.color
        frameLayer.context.save()
        
        this.#drawLine(frameLayer.context, coordsLeft, this.frame.perc/100)
        this.#drawLine(frameLayer.context, coordsRight, this.frame.perc/100)
    }

    #getFrameGlowMask(){
        const frameLayer = _.find(this.canvasLayers, {name: "frameLayer"})
        if (!frameLayer) {
            console.error("Missing required frameLayer.")
            return
        }

        const compositeOperation = frameLayer.context.globalCompositeOperation
        frameLayer.context.globalCompositeOperation = "destination-out"
        frameLayer.context.beginPath()
        frameLayer.context.fillStyle = "#fff"
        
        if (this.hinges === "left") {   
            frameLayer.context.moveTo(0,0)
            frameLayer.context.lineTo(this.padding.left * (1- this.door.angle / this.door.maxAngle),0)
            frameLayer.context.lineTo(this.padding.left,this.padding.top)
            frameLayer.context.lineTo(this.padding.left,this.padding.top + this.height)
            frameLayer.context.lineTo(this.padding.left * (1- this.door.angle / this.door.maxAngle),this.padding.top + this.height + this.padding.bottom)
            frameLayer.context.lineTo(0,this.padding.top + this.height + this.padding.bottom)
        } else {
            frameLayer.context.moveTo(this.padding.left + this.width + this.padding.right ,0)
            frameLayer.context.lineTo(this.padding.left + this.width + this.padding.right * (1- this.door.angle / this.door.maxAngle),0)
            frameLayer.context.lineTo(this.padding.left + this.width, this.padding.top)
            frameLayer.context.lineTo(this.padding.left + this.width, this.padding.top + this.height)
            frameLayer.context.lineTo(this.padding.left + this.width + this.padding.right * (1- this.door.angle / this.door.maxAngle),this.padding.top + this.height + this.padding.bottom)
            frameLayer.context.lineTo(this.padding.left + this.width + this.padding.right, this.padding.top + this.height + this.padding.bottom)
            
        }
        frameLayer.context.fill()
        frameLayer.context.closePath()
        frameLayer.context.globalCompositeOperation = compositeOperation
    }

    #mirrorImage(context: CanvasRenderingContext2D, horizontal = false, vertical = false, id?:number){
        // Create an off-screen canvas
        const offScreenCanvas = document.createElement("canvas")
        offScreenCanvas.width = context.canvas.width
        offScreenCanvas.height = context.canvas.height
        const offScreenContext = offScreenCanvas.getContext("2d") as CanvasRenderingContext2D

        // Draw the original canvas onto the off-screen canvas
        offScreenContext.drawImage(context.canvas, 0, 0)

        // Optionally add the canvas to the body for debugging
        if (this.dev) {
            this._DEV_addCanvasToBody(offScreenCanvas, "mirrorCanvas" + id)
        }

        // Save the current canvas state
        context.save()

        // Clear the main canvas using transformed context
        context.setTransform(
            horizontal ? -1 : 1, 0, // set the direction of x axis
            0, vertical ? -1 : 1,   // set the direction of y axis
            horizontal ? context.canvas.width : 0, // set the x origin
            vertical ? context.canvas.height : 0   // set the y origin
        )

        context.clearRect(0, 0, context.canvas.width, context.canvas.height)

        // Draw the off-screen canvas onto the main canvas with the transformation
        context.drawImage(offScreenCanvas, 0, 0)

        if (this.dev) {
            this._DEV_addCanvasToBody(context.canvas, "mirrorCanvas-context" + id)
        }

        // Restore the canvas state
        context.restore()
    }
        
    #skew3D(sourceImage: ImageData, angle: number, offset?: {top: number, bottom:number}){
        if (!offset) {
            offset = {
                top: 0,
                bottom: 0
            }
        }

        if (angle > 1) {
            console.warn("Angle should be a decimal value between 0 and 90")
        }

        const width = sourceImage.width
        const height = sourceImage.height

        const sourceCanvas = document.createElement("canvas") 
        sourceCanvas.width = width
        sourceCanvas.height = height
        const sourceContext = sourceCanvas.getContext("2d")
        
        const targetCanvas = document.createElement("canvas") 
        targetCanvas.width = width
        targetCanvas.height = height + offset.top + offset.bottom
        const targetContext = targetCanvas.getContext("2d")

        this._DEV_addCanvasToBody(sourceCanvas, "sourceCanvas")
        this._DEV_addCanvasToBody(targetCanvas, "targetCanvas")
        
        const offsetY = offset.top
        const offsetX = 0

        if (sourceContext && targetContext) {
            
            targetContext.beginPath()
            const skew = (angle/.9)

            sourceContext.putImageData(sourceImage, 0, 0)

            if (this.hinges === "right") {
                this.#mirrorImage(sourceContext, true, false, 1)
            }
            
            for (let i = 0; i <= sourceCanvas.height / 2; ++i) {
                // Top part
                targetContext.setTransform(1 - skew, - skew * i / sourceCanvas.height, 0, 1, offsetX, offsetY)
                targetContext.drawImage(sourceCanvas, 
                    0, sourceCanvas.height / 2 - i, this.width, 2, 
                    0, sourceCanvas.height / 2 - i, this.width, 2)
                // Bottom part
                targetContext.setTransform(1 - skew,  skew * i / sourceCanvas.height, 0, 1, offsetX, offsetY)
                targetContext.drawImage(sourceCanvas, 
                    0, sourceCanvas.height / 2 + i, this.width, 2, 
                    0, sourceCanvas.height / 2 + i, this.width, 2)
            }
            // targetContext.drawImage(sourceCanvas,0,this.padding.top)
            targetContext.closePath()

            if (this.hinges === "right") {
                this.#mirrorImage(targetContext, true, false, 2)
            }
 
            // sourceContext.resetTransform
            return targetContext
        }
        throw new Error("Can't create context")
    }

    #getDistance(pointA: {x:number, y:number}, pointB: {x:number, y:number}){
        const a = pointA.x - pointB.x
        const b = pointA.y - pointB.y
        return Math.sqrt( a*a + b*b )
    }

    #getLength(points: Array<{x:number, y:number}>){
        let distance = 0
        if (points.length > 0) {
            for (let index = 0; index < points.length-1; index++) {
                const point = points[index]
                const nextPoint = points[index+1]
                
                distance += this.#getDistance(point, nextPoint)
            }
        }
        return distance
    }
    
    #drawLine(ctx:CanvasRenderingContext2D, points: Array<{x:number, y:number}>, perc = 1 as number){
        const totalLength = this.#getLength(points)
        
        if (perc > 1) {
            perc = 1
            console.warn("Are you sure that you're passing the perc value as a decimal?")
        }

        let currentLength = 0
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let index = 0; index < points.length - 1; index++) {
            const current = points[index]
            const next = points[index+1]
            const length = this.#getLength([current, next])
            
            currentLength += length
            
            if (currentLength <= totalLength * perc) {
                ctx.lineTo(next.x, next.y)
            } else {
                const p = (totalLength * perc - (currentLength - length)) / length
                ctx.lineTo(current.x + p * (next.x - current.x), current.y + p * (next.y - current.y))
                ctx.lineTo(current.x + p * (next.x - current.x), current.y + p * (next.y - current.y))
                break
            }
        }
        ctx.stroke()
        ctx.closePath()
    }

    #updateSizes() {
        // Update door layer canvas
        const doorLayer = _.find(this.canvasLayers, {name: "doorLayer"})
        if (doorLayer) {
            doorLayer.canvas.width = this.width + this.padding.left + this.padding.right
            doorLayer.canvas.height = this.height + this.padding.top + this.padding.bottom
        }
        
        const frameLayer = _.find(this.canvasLayers, {name: "frameLayer"})
        if (frameLayer) {
            frameLayer.canvas.width = this.width + this.padding.left + this.padding.right
            frameLayer.canvas.height = this.height + this.padding.top + this.padding.bottom
        }

        // Update door 
        this.door.points = [
            {x: -this.width / 2, y: 0},
            {x: -this.width / 2, y: -this.height},
            {x: this.width / 2, y: -this.height},
            {x: this.width / 2, y: 0},
        ]
        
        // Update frame 
        this.frame.left = [
            {x: -this.width / 2, y: 0},
            {x: -this.width / 2, y: -this.height},
            {x: 0, y: -this.height}
        ]
        this.frame.right = [
            {x: this.width / 2, y: 0},
            {x: this.width / 2, y: -this.height},
            {x: 0, y: -this.height}
        ]
    }

    constructor (options: DoorOptions) {
        this.x = options.x
        this.y = options.y
        this.sourceElement = options.sourceElement
        this.targetCanvas = options.targetCanvas

        this.width = options.width ? options.width : 32
        this.height = options.height ? options.height : 80
        this.hinges = options.hinges ? options.hinges : "left"
        
        this.dev = import.meta.env.DEV
        this.frameBuild = false
        this.removed = false
        this.isOpen = false
        this.inTransition = false
        this.canvasLayers = []

        const targetContext = this.targetCanvas.getContext("2d")
        if (targetContext) {
            this.canvasLayers.push({
                name: "targetLayer",
                canvas: this.targetCanvas,
                context: targetContext
            })
        }

        this.frame = {
            perc: 0,
            left: [],
            right: [],
            color: "#fff"
        }

        this.door = {
            points: [],
            angle: 0,
            maxAngle: options.maxAngle ? options.maxAngle : 30,
        }

        this.padding = {
            top: 30,
            left: 30,
            bottom: 30,
            right: 30
        }

        this.#createScreenshotLayer()
        this.#createDoorLayer()
        this.#createFrameLayer()
        
        this.#updateSizes()
        this.#draw()

        // Automatically create frame when door is initiated
        this.createFrame()
            
        return new Proxy(this, {
            set: function (target: Door, key, value) {
                if (key === "x" || key === "y") {
                    target[key] = value
                }
                
                if (key === "width" || key === "height") {
                    target[key] = value
                    target.#updateSizes()
                }
                
                // Boolean
                if (key === "isOpen" ||
                    key === "dev" ||
                    key === "frameBuild" ||
                    key === "removed") {
                    target[key] = value
                }

                // String
                if (key === "hinges") {
                    target[key] = value
                }

                // if (typeof target[key] !== "undefined") {
                //     target[key] = value
                // }

                return true
            }
        })
    }

    createFrame(duration = .8) {
        return new Promise((resolve) => {
            gsap.to(this.frame, {
                perc: 100,
                duration,
                ease: "power1.out",
                onComplete: () => {
                    this.frameBuild = true
                }
            })
        })
    }

    destroyFrame(duration = .8) {
        return new Promise((resolve) => {
            this.frameBuild = false
            gsap.to(this.frame, {
                perc: 0,
                duration,
                ease: "power1.out",
                onComplete: () => {
                    resolve(this.frameBuild)
                }
            })
        })
    }
    
    open(opts?: {
        duration?: number,
        ease?: string,
        angle?: number
    }) {
        if (!opts) {
            opts = {}
        }

        if (!opts.duration) {
            opts.duration = .8
        }

        if (!opts.angle) {
            opts.angle = this.door.maxAngle
        }

        if (!opts.ease) {
            opts.ease = "back.out"
        }

        return new Promise((resolve) => {
            gsap.to(this.door, {
                angle: opts.angle,
                ease: opts.ease,
                duration: opts.duration,
                onComplete: () => {
                    this.isOpen = true
                    resolve(this.isOpen)
                }
            })
        })
    }

    close(opts?: {
        duration?: number,
        ease?: string,
    }) {
        if (!opts) {
            opts = {}
        }
        if (!opts.duration) {
            opts.duration = .8
        }

        if (!opts.ease) {
            opts.ease = "back.out"
        }

        return new Promise((resolve) => {
            gsap.to(this.door, {
                angle: 0,
                ease: opts.ease,
                duration: opts.duration,
                onComplete: () => {
                    this.isOpen = false
                    resolve(this.isOpen)
                }
            })
        })
    }

    remove() {
        if (this.isOpen) {
            this.close({
                duration: .5,
                ease: "power2.out"
            }).then(() => {
                setTimeout(() => {
                    this.destroyFrame().then(()=> {
                        this.removed = true
                    })
                },128)
            })
        } else {
            this.destroyFrame().then(()=> {
                this.removed = true
            })
        }
    }
}

export default Door