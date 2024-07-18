import _ from "lodash"
import Matter from "matter-js"
import Color from "color"
import gsap from "gsap"
import domtoimage from "dom-to-image"

export type DoorOptions = {
    x: number
    y: number
    sourceElement: HTMLElement
    targetCanvas: HTMLCanvasElement
    width?: number,
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
    door: {
        points: Array<{x: number, y:number}>
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
    sourceElement: HTMLElement
    canvas: HTMLCanvasElement
    targetCanvas: HTMLCanvasElement
}

class Door  {
    #draw() {
        const doorLayer = _.find(this.canvasLayers, {name: "doorLayer"})
        const targetLayer = _.find(this.canvasLayers, {name: "targetLayer"})

        this.#clearDoorCanvas()
        this.#drawFrame()
        this.#drawDoor()

        if (doorLayer && targetLayer) {
            // Remove old doorLayer
            targetLayer.context.clearRect(this.x - doorLayer.canvas.width/2, this.y - doorLayer.canvas.height + this.padding.bottom, doorLayer.canvas.width,doorLayer.canvas.height)
            // Add new doorLayer to targetLayer
            targetLayer.context.drawImage(doorLayer.canvas, this.x - doorLayer.canvas.width/2, this.y - doorLayer.canvas.height + this.padding.bottom)
        }
        
        requestAnimationFrame(() => this.#draw())
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

    #clearDoorCanvas() {
        const door = _.find(this.canvasLayers, {name: "doorLayer"})
        if (!door) {
            return
        }
        door.context.clearRect(0,0,door.canvas.width, door.canvas.height)
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

        
        doorLayer.context.strokeStyle = new Color(this.frame.color).darken(.5).hex()
        this.#drawLine(doorLayer.context, coords)
        // screenshotLayer.context.getImageData(door.x1, door.y1-door.height, door.width, door.height)
    }

    #drawFrame() {
        const doorLayer = _.find(this.canvasLayers, {name: "doorLayer"})
        
        if (!doorLayer) {
            console.error("Missing required doorLayer.")
            return
        }
        
        const offset = {
            x: doorLayer.canvas.width / 2,
            y: doorLayer.canvas.height - this.padding.bottom
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
        const strokeColor = new Color("#444")
        this.frame.color = strokeColor.lighten(this.frame.perc/100*2).hex()
        doorLayer.context.strokeStyle = this.frame.color
        
        this.#drawLine(doorLayer.context, coordsLeft, this.frame.perc/100)
        this.#drawLine(doorLayer.context, coordsRight, this.frame.perc/100)
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
    }

    #updateSizes() {
        // Update door layer canvas
        const doorLayer = _.find(this.canvasLayers, {name: "doorLayer"})
        if (doorLayer) {
            doorLayer.canvas.width = this.width + this.padding.left + this.padding.right
            doorLayer.canvas.height = this.height + this.padding.top + this.padding.bottom
        }

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
        
        this.frameBuild = false
        this.isOpen = false
        this.inTransition = true
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
            right: []
        }

        this.door = {
            points: [
                {x: -this.width / 2, y: 0},
                {x: -this.width / 2, y: -this.height},
                {x: this.width / 2, y: -this.height},
                {x: this.width / 2, y: 0},
                // {x: -this.width / 2, y: 0},
            ]
        }

        this.padding = {
            top: 20,
            left: 20,
            bottom: 20,
            right: 20
        }
        this.#createScreenshotLayer()
        this.#createDoorLayer()
        
        this.#updateSizes()
        const totalLength = this.#getLength(this.frame.left)
        this.#draw()
        // this.#loop()
        this.createFrame()
            
        return new Proxy(this, {
            set: function (target: Door, key, value) {
                if (key === "x" || key === "y") {
                    target[key] = value
                    // target.updatePosition()
                }
                if (key === "width" || key === "height") {
                    target[key] = value
                    target.#updateSizes()
                }

                return true
            }
        })
    }
    createFrame(duration = .8) {
        // this.frame.perc = 50
        gsap.to(this.frame, {
            perc: 100,
            duration,
            ease: "power1.out",
            onComplete: () => {
                this.frameBuild = true
            }
        })
    }

    // openDoor(dir = "left" as "left" | "right", toAngle = 45) {
    //     const openLeft = (img: ImageData, context: CanvasRenderingContext2D, skew: number) => {
    //         const height = img.height
    //         const width = img.width
    //         const offsetY = source.height/ 2 - door.height
    //         const offsetX = source.width / 2 - door.width/2
            
    //         const canvas = document.createElement("canvas")
    //         canvas.height = height
    //         canvas.width = width
    //         const ctx = canvas.getContext("2d")
    //         if (!ctx) {
    //             return
    //         }
    //         ctx.putImageData(img, 0,0)
            
    //         // Draw borders
    //         ctx.beginPath()
    //         ctx.strokeStyle = "rgba(128,128,128,1)"
    //         ctx.moveTo(0 , 0)
    //         ctx.lineTo(img.width, 0)
    //         ctx.lineTo(img.width, img.height)
    //         ctx.lineTo(0 , img.height)
    //         ctx.lineTo(0 , 0)
    //         ctx.stroke()
    //         ctx.closePath()

    //         // Draw door shadow
    //         const shadowDoor = ctx.createLinearGradient(0,0, img.width,0)
    //         shadowDoor.addColorStop(0, `rgba(0,0,0,${skew * .48})`)
    //         shadowDoor.addColorStop(1, "transparent")
    //         ctx.fillStyle = shadowDoor
    //         ctx.fillRect(0, 0, img.width, img.height)

    //         for (let i = 0; i <= height / 2; ++i) {
    //             // Top part
    //             context.setTransform(1 - skew, -skew * i / height, 0, 1, offsetX, offsetY)
    //             context.drawImage(canvas, 
    //                 0, height / 2 - i, width, 1, 
    //                 0, height / 2 - i, width, 2)
    //             // Bottom part
    //             context.setTransform(1 - skew, skew * i / height, 0, 1, offsetX, offsetY)
    //             context.drawImage(canvas, 
    //                 0, height / 2 + i, width, 2, 
    //                 0, height / 2 + i, width, 2)
    //         }
    //     }
    // }

    OriginalCode() {
        const size = {
            width: 80,
            height: 320
        }
        
        const source = {
            x: this.x - size.width/2,
            y: this.y - size.height/2,
            width: size.width,
            height: size.height,
        }

        const door = {
            width: 32,
            height: 80,
            angle: 0,
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 0
        }

        door.x1 = source.width/2 - door.width/2
        door.x2 = source.width/2 + door.width/2
        door.y1 = source.height/2
        door.y2 = source.height/2

        // this.frame.points = [
        //     {x: -this.width / 2, y: 0},
        //     {x: -this.width / 2, y: -this.height},
        //     {x: this.width / 2, y: -this.height},
        //     {x: this.width / 2, y: 0},
        // ]


        const target = _.find(this.canvasLayers, {name: "targetLayer"})
        if (target) {

            target.context.fillStyle = "#f09"
            target.context.fillRect(0, 0, target.canvas.width, target.canvas.height)
        }

        // console.log(this.#getLength(this.frame.points))
        // const openLeft = (img: ImageData, context: CanvasRenderingContext2D, skew: number) => {
        //     const height = img.height
        //     const width = img.width
        //     const offsetY = source.height/ 2 - door.height
        //     const offsetX = source.width / 2 - door.width/2
            
        //     const canvas = document.createElement("canvas")
        //     canvas.height = height
        //     canvas.width = width
        //     const ctx = canvas.getContext("2d")
        //     if (!ctx) {
        //         return
        //     }
        //     ctx.putImageData(img, 0,0)
            
        //     // Draw borders
        //     ctx.beginPath()
        //     ctx.strokeStyle = "rgba(128,128,128,1)"
        //     ctx.moveTo(0 , 0)
        //     ctx.lineTo(img.width, 0)
        //     ctx.lineTo(img.width, img.height)
        //     ctx.lineTo(0 , img.height)
        //     ctx.lineTo(0 , 0)
        //     ctx.stroke()
        //     ctx.closePath()

        //     // Draw door shadow
        //     const shadowDoor = ctx.createLinearGradient(0,0, img.width,0)
        //     shadowDoor.addColorStop(0, `rgba(0,0,0,${skew * .48})`)
        //     shadowDoor.addColorStop(1, "transparent")
        //     ctx.fillStyle = shadowDoor
        //     ctx.fillRect(0, 0, img.width, img.height)

        //     for (let i = 0; i <= height / 2; ++i) {
        //         // Top part
        //         context.setTransform(1 - skew, -skew * i / height, 0, 1, offsetX, offsetY)
        //         context.drawImage(canvas, 
        //             0, height / 2 - i, width, 1, 
        //             0, height / 2 - i, width, 2)
        //         // Bottom part
        //         context.setTransform(1 - skew, skew * i / height, 0, 1, offsetX, offsetY)
        //         context.drawImage(canvas, 
        //             0, height / 2 + i, width, 2, 
        //             0, height / 2 + i, width, 2)
        //     }
        // }


        // const backgroundDrawn = new Promise((resolve, reject) => {
        //     this.#createScreenshotLayer().then((imgData) => {
        //         const imgElement = new Image()
        //         imgElement.onload = () => {
        //             const artboard = _.find(this.canvasLayers, {name: "doorLayer"})
        //             if (!artboard) {
        //                 throw new Error("Can't find door canvas")
        //             }
        //             artboard.context.drawImage(imgElement, source.x + size.width /2 - door.width/2, source.y + size.height / 2 - door.height, door.width, door.height, door.x1 ,door.y1-door.height, door.width, door.height)
        //             // ctx.drawImage(imgElement, source.x, source.y, source.width, source.height, 0,0, size, size)
        //             // ctx.drawImage(imgElement, source.x, source.y, source.width, source.height, door.x1, door.y1 - door.height, door.width, size)
        //             resolve(true)
        //         }
        //         imgElement.src = imgData
        //     })
        // })

        // backgroundDrawn.then(() => {
        //     const artboard = _.find(this.canvasLayers, {name: "doorLayer"})
        //     console.log(artboard)
        //     if (!artboard) {
        //         throw new Error("Missing doorLayer")
        //     }
            
        //     this.inTransition = true
        //     const doorFront = artboard.context.getImageData(door.x1, door.y1-door.height, door.width, door.height)
        //     artboard.context.beginPath()
        //     artboard.context.strokeStyle = "rgba(255,255,255,.2)"
        //     artboard.context.moveTo(frame.x, frame.y)
        //     const tl = gsap.timeline()
        //     gsap.timeline()
        //     tl.to(frame, {
        //         y: source.height/2 - door.height,
        //         duration: .6,
        //         ease: "ease",
        //         onUpdate: () => {
        //             this.inTransition = true
        //             artboard.context.beginPath()
        //             artboard.context.strokeStyle = "rgba(128,128,128,1)"
        //             artboard.context.moveTo(door.x1 , door.y1)
        //             artboard.context.lineTo(door.x1 , frame.y)
        //             artboard.context.stroke()
        //             artboard.context.closePath()
                    
        //             artboard.context.strokeStyle = "rgba(128,128,128,1)"
        //             artboard.context.moveTo(door.x2, door.y1)
        //             artboard.context.lineTo(door.x2, frame.y)
        //             artboard.context.stroke()
        //             artboard.context.closePath()
        //         },
        //     })

        //     // Draw top part
        //     tl.to(door, {
        //         x1: source.width/2 + door.width/4,
        //         duration: .2,
        //         ease: "power2.in",
        //         onUpdate: () => {
        //             this.inTransition = true
        //             artboard.context.beginPath()
        //             artboard.context.strokeStyle = "rgba(128,128,128,1)"
        //             artboard.context.moveTo(source.width/2 - door.width/2, frame.y)
        //             artboard.context.lineTo(door.x1, frame.y)
        //             artboard.context.stroke()
        //             artboard.context.closePath()
        //         },
        //     })
        //     tl.to(door, {
        //         x2: source.width/2 - door.width/4,
        //         duration: .2,
        //         delay: -.2,
        //         ease: "power2.in",
        //         onUpdate: () => {
        //             this.inTransition = true
        //             artboard.context.beginPath()
        //             artboard.context.strokeStyle = "rgba(128,128,128,1)"
        //             artboard.context.moveTo(source.width/2 + door.width/2, frame.y)
        //             artboard.context.lineTo(door.x2, frame.y)
        //             artboard.context.stroke()
        //             artboard.context.closePath()
        //         },
        //     })
            
        //     tl.to(door, {
        //         angle: 0.48,
        //         duration: 1.6,
        //         delay: 0.6,
        //         ease: "back.out",
        //         onUpdate: () => {
        //             this.inTransition = true
        //             artboard.context.restore()
        //             artboard.context.clearRect(0, 0, source.width, source.height)
        //             artboard.context.save()
        //             artboard.context.beginPath()
        //             artboard.context.fillStyle = "#ffffff"
        //             artboard.context.rect(source.width/2 - door.width/2, source.height/2 - door.height, door.width, door.height)
        //             artboard.context.fill()
        //             artboard.context.closePath()

        //             // Draw shadow top right
        //             const shadowProp = {
        //                 topRight: {
        //                     x1: source.width/2 + door.width/2,
        //                     x2: source.width/2 + door.width/2,
        //                     y1: source.height/2 - door.height,
        //                     y2: source.height/2 - door.height,
        //                     radius: 20
        //                 },
        //                 bottomRight: {
        //                     x1: source.width/2 + door.width/2,
        //                     x2: source.width/2 + door.width/2,
        //                     y1: source.height/2,
        //                     y2: source.height/2,
        //                     radius: 20
        //                 },
        //             }
        //             const shadowDepth = door.width * .64
        //             // Define shadow gradients
        //             const shadow = {
        //                 right:       artboard.context.createLinearGradient(source.width/2 + door.width/2, 0, source.width/2 + door.width/2 +shadowDepth, 0),
        //                 bottom:      artboard.context.createLinearGradient(0, source.height/2, 0, source.height/2 +shadowDepth),
        //                 top:         artboard.context.createLinearGradient(0, source.height/2 - door.height, 0, source.height/2  - door.height -shadowDepth),
        //                 topRight:    artboard.context.createRadialGradient(source.width/2 + door.width/2, source.height/2 - door.height, 0, source.width/2 + door.width/2, source.height/2 - door.height ,shadowDepth),
        //                 topLeft:     artboard.context.createRadialGradient(source.width/2 - door.width/2, source.height/2 - door.height, 0, source.width/2 - door.width/2, source.height/2 - door.height,shadowDepth),
        //                 bottomLeft:  artboard.context.createRadialGradient(source.width/2 - door.width/2, source.height/2, 0, source.width/2 - door.width/2, source.height/2 , shadowDepth),
        //                 bottomRight: artboard.context.createRadialGradient(source.width/2 + door.width/2, source.height/2              , 0, source.width/2 + door.width/2, source.height/2             ,shadowDepth)
        //             }
                    
        //             // Top right
        //             shadow.topRight.addColorStop(0, `rgba(255,255,255,${door.angle * .72})`)
        //             shadow.topRight.addColorStop(1, "transparent")
        //             artboard.context.fillStyle = shadow.topRight
        //             artboard.context.fillRect(source.width/2 + door.width/2, source.height/2 - door.height - 40 ,shadowDepth*2, 40)
                    
        //             // Top left
        //             shadow.topLeft.addColorStop(0, `rgba(255,255,255,${door.angle * .72})`)
        //             shadow.topLeft.addColorStop(1, "transparent")
        //             artboard.context.fillStyle = shadow.topLeft
        //             artboard.context.beginPath()
        //             artboard.context.moveTo(source.width/2 - door.width/2, source.height/2 - door.height)
        //             artboard.context.lineTo(source.width/2 - door.width/2, source.height/2 - door.height -shadowDepth)
        //             artboard.context.lineTo(source.width/2 - door.width/2 -shadowDepth*door.angle, source.height/2 - door.height -shadowDepth)
        //             artboard.context.lineTo(source.width/2 - door.width/2 -shadowDepth*door.angle, source.height/2 - door.height -shadowDepth +shadowDepth*door.angle)
        //             artboard.context.closePath()
        //             artboard.context.fill()
                    
        //             // artboard.context.fillRect(source.width/2 - door.width/2 -shadowDepth*2, source.height/2 - door.height - 40 ,shadowDepth*2, 40)
                    
        //             // Bottom right
        //             shadow.bottomRight.addColorStop(0, `rgba(255,255,255,${door.angle * .72})`)
        //             shadow.bottomRight.addColorStop(1, "transparent")
        //             artboard.context.fillStyle = shadow.bottomRight
        //             artboard.context.fillRect(source.width/2 + door.width/2, source.height/2 ,shadowDepth*2, 40)
                    
        //             // Bottom left
        //             shadow.bottomLeft.addColorStop(0, `rgba(255,255,255,${door.angle * .72})`)
        //             shadow.bottomLeft.addColorStop(1, "transparent")
        //             artboard.context.fillStyle = "red"
        //             artboard.context.fillStyle = shadow.bottomLeft
        //             artboard.context.beginPath()
        //             artboard.context.moveTo(source.width/2 - door.width/2, source.height/2)
        //             artboard.context.lineTo(source.width/2 - door.width/2, source.height/2 + shadowDepth)
        //             artboard.context.lineTo(source.width/2 - door.width/2 - shadowDepth*door.angle, source.height/2 + shadowDepth)
        //             artboard.context.lineTo(source.width/2 - door.width/2 -shadowDepth*door.angle, source.height/2 + shadowDepth -shadowDepth*door.angle)
        //             // artboard.context.lineTo(source.width/2 - door.width/2 -shadowDepth*door.angle, source.height/2 - door.height -shadowDepth)
        //             // artboard.context.lineTo(source.width/2 - door.width/2 -shadowDepth*door.angle, source.height/2 - door.height -shadowDepth +shadowDepth*door.angle)
        //             artboard.context.closePath()
        //             artboard.context.fill()

        //             // Right
        //             shadow.right.addColorStop(0, `rgba(255,255,255,${door.angle * .72})`)
        //             shadow.right.addColorStop(1, "transparent")
        //             artboard.context.fillStyle = shadow.right
        //             artboard.context.fillRect(source.width/2 + door.width/2, source.height/2 - door.height ,shadowDepth*2, door.height)
                    
        //             // Bottom
        //             shadow.bottom.addColorStop(0, `rgba(255,255,255,${door.angle * .64})`)
        //             shadow.bottom.addColorStop(1, "transparent")
        //             artboard.context.fillStyle = shadow.bottom
        //             artboard.context.fillRect(source.width/2 - door.width/2, source.height/2, door.width, door.width*.72*2)
                    
        //             // Top
        //             shadow.top.addColorStop(0, `rgba(255,255,255,${door.angle * .72})`)
        //             shadow.top.addColorStop(1, "transparent")
        //             artboard.context.fillStyle = shadow.top
        //             artboard.context.fillRect(source.width/2 - door.width/2, source.height/2 - door.height -shadowDepth*2, door.width,shadowDepth*2)
                    
        //             openLeft(doorFront, artboard.context, door.angle)
        //             // Draw door
        //             // ctx.beginPath()
        //             // ctx.strokeStyle = "rgba(128,128,128,1)"
        //             // ctx.moveTo(door.x1, door.y1)
        //             // ctx.lineTo(door.x1, door.y1 - door.height)
        //             // ctx.lineTo(door.x1 + door.width, door.y1 - door.height)
        //             // ctx.lineTo(door.x1 + door.width, door.y1)
        //             // ctx.stroke()
        //             // ctx.closePath()
        //         },
        //         onComplete: () => {
        //             this.inTransition = false
        //         }
        //     })

        //     // openDoor(doorFront, ctx, .2)
        //     // // Draw door handle
        //     // const handle = {
        //     //     x1: source.width/2 + door.width/2 - 20,
        //     //     x2: source.width/2 + door.width/2 - 20,
        //     //     y1: source.height/2 - door.height*.56,
        //     //     y2: source.height/2 - door.height*.56
        //     // }
        //     // tl.to(handle, {
        //     //     x1: handle.x1 + 12,
        //     //     duration: .4,
        //     //     delay: -.64,
        //     //     ease: "power2.in",
        //     //     onUpdate: () => {
        //     //         ctx.beginPath()
        //     //         ctx.strokeStyle = "rgba(180,180,180,1)"
        //     //         ctx.moveTo(handle.x1, handle.y1)
        //     //         ctx.lineTo(handle.x2, handle.y2)
        //     //         ctx.stroke()
        //     //         ctx.closePath()
        //     //     },
        //     // })
        //     // tl.to(handle, {
        //     //     y1: handle.y1 + 6,
        //     //     x1: handle.x1 + 6,
        //     //     duration: .2,
        //     //     delay: 0,
        //     //     ease: "power2.in",
        //     //     onUpdate: () => {

        //     //         ctx.clearRect( source.width/2 + door.width/2 - 20 ,source.height/2 - door.height*.56 -1,18,16)
        //     //         ctx.beginPath()
        //     //         ctx.strokeStyle = "rgba(180,180,180,1)"
        //     //         ctx.moveTo(handle.x1, handle.y1)
        //     //         ctx.lineTo(handle.x2, handle.y2)
        //     //         ctx.stroke()
        //     //         ctx.closePath()
        //     //     },
        //     // })
        // })
    }

}

export default Door