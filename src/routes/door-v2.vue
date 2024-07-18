<template>
    <div class="options-overview">
        <header class="title" id="door-title">
            <h1>Door V2</h1>
        </header>

        <hr>
        <section class="viewport" :class="[showHiddenCanvas ? '' : '__isHidden']">
            <div class="footnote">
                Click anywhere on the screen to open a door
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="Click">
                    <div class="option">
                        <label for="doorWidth">Door width</label>
                        <input type="number" id="doorWidth" v-model="doorOptions.width">
                        
                        <label for="doorHeight">Door height</label>
                        <input type="number" id="doorHeight" v-model="doorOptions.height">
                    </div>
                </div>
            </div>
        </aside>
        <canvas class="overlay" ref="overlayCanvas"></canvas>
    </div>
</template>


<script lang="ts">
type customMouseEvent = MouseEvent & {
    custom: boolean
}
type customTouchEvent = TouchEvent & {
    custom: boolean
}
import {defineComponent} from "vue"
import _ from "lodash"
import domtoimage from "dom-to-image"
import gsap from "gsap"
import Door from "@/models/door"

export default defineComponent ({ 
    props: [],
    data() {
        return {
            mousePos: {x:-1, y:0},
            defaultClick: false,
            animation: true,
            clearDrawing: false,
            updateDrawing: true,
            door: null as null | Door,
            doorOptions: {
                width: 40,
                height: 80,  
            },
            showHiddenCanvas: true,
            defaultClickEvent: null as null | customMouseEvent | customTouchEvent,
        }
    },
    watch:{
        "doorOptions": {
            handler(){
                if (!this.door) {
                    return
                }
                this.door.width = this.doorOptions.width
                this.door.height = this.doorOptions.height
            },
            deep: true
        }
    },
    mounted() {
        // this.draw()
        // this.createScreenshot()
        window.addEventListener("click", this.clickEvent)
        window.addEventListener("resize", this.updateOverlay)
    },
    unmounted() {
        this.animation = false
        window.removeEventListener("click", this.clickEvent)
        window.removeEventListener("resize", this.updateOverlay)
        let img = document.querySelector(".overlay") as HTMLImageElement
        img.remove()
    },
    methods: {
        // draw() {
        //     if (!this.animation) {
        //         return
        //     }

        //     const sourceCanvas = this.$refs.sourceCanvas as HTMLCanvasElement
        //     const sourceContext = sourceCanvas.getContext("2d")
        //     const overlayCanvas =  document.querySelector(".overlay") as HTMLCanvasElement
            
        //     // Error checks
        //     if (!overlayCanvas) {
        //         this.updateOverlay()
        //         requestAnimationFrame(this.draw)
        //         return
        //     }
        //     const overlayContext = overlayCanvas.getContext("2d")
        //     if (!overlayContext) {
        //         return console.error("Missing overlayContext")
        //     }
        //     if (!sourceCanvas || !sourceContext) {
        //         return console.error("Missing sourceCanvas")
        //     }
        //     if (this.updateDrawing) {
        //         // First clear canvas
        //         overlayContext.clearRect(0,0,overlayCanvas.width,overlayCanvas.height)
            
        //         // Update overlay canvas
        //         overlayContext.drawImage(sourceCanvas, this.mousePos.x - sourceCanvas.width/2, this.mousePos.y - sourceCanvas.height/2)
        //         this.updateDrawing = false
        //     }

        //     requestAnimationFrame(this.draw)
        // },
        updateOverlay() {
            let overlayCanvas = document.querySelector(".overlay") as HTMLCanvasElement
            if (!overlayCanvas) {
                overlayCanvas = document.createElement("canvas")
                overlayCanvas.width = window.innerWidth
                overlayCanvas.height = window.innerHeight
                overlayCanvas.className = "overlay"
                document.body.appendChild(overlayCanvas)
            }
            this.clickEvent()
        },
        createScreenshot() {
            return new Promise<string>((resolve, reject) => {
                let img = document.querySelector(".overlay") as HTMLCanvasElement
                if (!img) {
                    return reject("no overlay found")
                }
                const domElement = document.querySelector("#app")
                if (!domElement) {
                    return reject("domElement missing")
                }
                domtoimage.toPng(domElement).then( (dataUrl) => {
                    resolve(dataUrl)
                }).catch((err)=> {
                    console.error(err)
                    reject(err)
                })
            })
        },
        clickEvent(e?: MouseEvent | TouchEvent | customMouseEvent | customTouchEvent) {
            if (e && e.target) {
                this.updateMousePos(e)
                
                if (e.target instanceof HTMLInputElement) {
                    return e.preventDefault()
                }
            }
            
            const overlayEl = this.$refs["overlayCanvas"] as HTMLCanvasElement
            if (this.mousePos.x != -1 && overlayEl) {
                this.door = new Door({
                    sourceElement: document.body,
                    targetCanvas: overlayEl,
                    x: this.mousePos.x,
                    y: this.mousePos.y,
                    width: this.doorOptions.width,
                    height: this.doorOptions.height
                })
            }
            this.clearDrawing = true
        },
        updateMousePos(e: MouseEvent | TouchEvent) {
            this.mousePos.x = 0
            this.mousePos.y = 0
            if (e instanceof MouseEvent) {
                this.mousePos.x = e.clientX
                this.mousePos.y = e.clientY
            }
            
            if (window.TouchEvent && e instanceof TouchEvent) {
                this.mousePos.x = e.touches[0].clientX
                this.mousePos.y = e.touches[0].clientY
            }   
        },
        
        addAnimatedDoorway() {
            const size = {
                width: 80,
                height: 320
            }
            const sourceCanvas = this.$refs.sourceCanvas as HTMLCanvasElement
            
            sourceCanvas.width = size.width
            sourceCanvas.height = size.height

            const ctx = sourceCanvas.getContext("2d")
            if (!ctx) {
                return
            }

            const overlay = document.querySelector(".overlay") as HTMLImageElement
            if (!overlay) {
                console.error("No overlay found")
                return 
            }

            const source = {
                x: this.mousePos.x - size.width/2,
                y: this.mousePos.y - size.height/2,
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

            const lineLeft = {
                x: door.x1,
                y: door.y1,
            }

            const openDoor = (img: ImageData, context: CanvasRenderingContext2D, skew: number) => {
                const height = img.height
                const width = img.width
                const offsetY = source.height/ 2 - door.height
                const offsetX = source.width / 2 - door.width/2
                
                const canvas = document.createElement("canvas")
                canvas.height = height
                canvas.width = width
                const ctx = canvas.getContext("2d")
                if (!ctx) {
                    return
                }
                ctx.putImageData(img, 0,0)
                
                // Draw borders
                ctx.beginPath()
                ctx.strokeStyle = "rgba(128,128,128,1)"
                ctx.moveTo(0 , 0)
                ctx.lineTo(img.width, 0)
                ctx.lineTo(img.width, img.height)
                ctx.lineTo(0 , img.height)
                ctx.lineTo(0 , 0)
                ctx.stroke()
                ctx.closePath()

                // Draw door shadow
                const shadowDoor = ctx.createLinearGradient(0,0, img.width,0)
                shadowDoor.addColorStop(0, `rgba(0,0,0,${skew * .48})`)
                shadowDoor.addColorStop(1, "transparent")
                ctx.fillStyle = shadowDoor
                ctx.fillRect(0, 0, img.width, img.height)

                for (var i = 0; i <= height / 2; ++i) {
                    // Top part
                    context.setTransform(1 - skew, -skew * i / height, 0, 1, offsetX, offsetY)
                    context.drawImage(canvas, 
                        0, height / 2 - i, width, 1, 
                        0, height / 2 - i, width, 2)
                    // Bottom part
                    context.setTransform(1 - skew, skew * i / height, 0, 1, offsetX, offsetY)
                    context.drawImage(canvas, 
                        0, height / 2 + i, width, 2, 
                        0, height / 2 + i, width, 2)
                }
            }


            const backgroundDrawn = new Promise((resolve, reject) => {
                this.createScreenshot().then((imgData) => {
                    const imgElement = new Image()
                    imgElement.onload = function() {
                        ctx.drawImage(imgElement, source.x + size.width /2 - door.width/2, source.y + size.height / 2 - door.height, door.width, door.height, door.x1 ,door.y1-door.height, door.width, door.height)
                        // ctx.drawImage(imgElement, source.x, source.y, source.width, source.height, 0,0, size, size)
                        // ctx.drawImage(imgElement, source.x, source.y, source.width, source.height, door.x1, door.y1 - door.height, door.width, size)
                        resolve(true)
                    }
                    imgElement.src = imgData
                })
            })

            backgroundDrawn.then(() => {
                this.updateDrawing = true
                const doorFront = ctx.getImageData(door.x1, door.y1-door.height, door.width, door.height)
                ctx.beginPath()
                ctx.strokeStyle = "rgba(255,255,255,.2)"
                ctx.moveTo(lineLeft.x, lineLeft.y)
                const tl = gsap.timeline()
                gsap.timeline()
                tl.to(lineLeft, {
                    y: source.height/2 - door.height,
                    duration: .6,
                    ease: "ease",
                    onUpdate: () => {
                        this.updateDrawing = true
                        ctx.beginPath()
                        ctx.strokeStyle = "rgba(128,128,128,1)"
                        ctx.moveTo(door.x1 , door.y1)
                        ctx.lineTo(door.x1 , lineLeft.y)
                        ctx.stroke()
                        ctx.closePath()
                        
                        ctx.strokeStyle = "rgba(128,128,128,1)"
                        ctx.moveTo(door.x2, door.y1)
                        ctx.lineTo(door.x2, lineLeft.y)
                        ctx.stroke()
                        ctx.closePath()
                    },
                })

                // Draw top part
                tl.to(door, {
                    x1: source.width/2 + door.width/4,
                    duration: .2,
                    ease: "power2.in",
                    onUpdate: () => {
                        this.updateDrawing = true
                        ctx.beginPath()
                        ctx.strokeStyle = "rgba(128,128,128,1)"
                        ctx.moveTo(source.width/2 - door.width/2, lineLeft.y)
                        ctx.lineTo(door.x1, lineLeft.y)
                        ctx.stroke()
                        ctx.closePath()
                    },
                })
                tl.to(door, {
                    x2: source.width/2 - door.width/4,
                    duration: .2,
                    delay: -.2,
                    ease: "power2.in",
                    onUpdate: () => {
                        this.updateDrawing = true
                        ctx.beginPath()
                        ctx.strokeStyle = "rgba(128,128,128,1)"
                        ctx.moveTo(source.width/2 + door.width/2, lineLeft.y)
                        ctx.lineTo(door.x2, lineLeft.y)
                        ctx.stroke()
                        ctx.closePath()
                    },
                })
                
                tl.to(door, {
                    angle: 0.48,
                    duration: 1.6,
                    delay: 0.6,
                    ease: "back.out",
                    onUpdate: () => {
                        this.updateDrawing = true
                        ctx.restore()
                        ctx.clearRect(0, 0, source.width, source.height)
                        ctx.save()
                        ctx.beginPath()
                        ctx.fillStyle = "#ffffff"
                        ctx.rect(source.width/2 - door.width/2, source.height/2 - door.height, door.width, door.height)
                        ctx.fill()
                        ctx.closePath()

                        // Draw shadow top right
                        const shadowProp = {
                            topRight: {
                                x1: source.width/2 + door.width/2,
                                x2: source.width/2 + door.width/2,
                                y1: source.height/2 - door.height,
                                y2: source.height/2 - door.height,
                                radius: 20
                            },
                            bottomRight: {
                                x1: source.width/2 + door.width/2,
                                x2: source.width/2 + door.width/2,
                                y1: source.height/2,
                                y2: source.height/2,
                                radius: 20
                            },
                        }
                        const shadowDepth = door.width * .64
                        // Define shadow gradients
                        const shadow = {
                            right:       ctx.createLinearGradient(source.width/2 + door.width/2, 0, source.width/2 + door.width/2 +shadowDepth, 0),
                            bottom:      ctx.createLinearGradient(0, source.height/2, 0, source.height/2 +shadowDepth),
                            top:         ctx.createLinearGradient(0, source.height/2 - door.height, 0, source.height/2  - door.height -shadowDepth),
                            topRight:    ctx.createRadialGradient(source.width/2 + door.width/2, source.height/2 - door.height, 0, source.width/2 + door.width/2, source.height/2 - door.height ,shadowDepth),
                            topLeft:     ctx.createRadialGradient(source.width/2 - door.width/2, source.height/2 - door.height, 0, source.width/2 - door.width/2, source.height/2 - door.height,shadowDepth),
                            bottomLeft:  ctx.createRadialGradient(source.width/2 - door.width/2, source.height/2, 0, source.width/2 - door.width/2, source.height/2 , shadowDepth),
                            bottomRight: ctx.createRadialGradient(source.width/2 + door.width/2, source.height/2              , 0, source.width/2 + door.width/2, source.height/2             ,shadowDepth)
                        }
                        
                        // Top right
                        shadow.topRight.addColorStop(0, `rgba(255,255,255,${door.angle * .72})`)
                        shadow.topRight.addColorStop(1, "transparent")
                        ctx.fillStyle = shadow.topRight
                        ctx.fillRect(source.width/2 + door.width/2, source.height/2 - door.height - 40 ,shadowDepth*2, 40)
                        
                        // Top left
                        shadow.topLeft.addColorStop(0, `rgba(255,255,255,${door.angle * .72})`)
                        shadow.topLeft.addColorStop(1, "transparent")
                        ctx.fillStyle = shadow.topLeft
                        ctx.beginPath()
                        ctx.moveTo(source.width/2 - door.width/2, source.height/2 - door.height)
                        ctx.lineTo(source.width/2 - door.width/2, source.height/2 - door.height -shadowDepth)
                        ctx.lineTo(source.width/2 - door.width/2 -shadowDepth*door.angle, source.height/2 - door.height -shadowDepth)
                        ctx.lineTo(source.width/2 - door.width/2 -shadowDepth*door.angle, source.height/2 - door.height -shadowDepth +shadowDepth*door.angle)
                        ctx.closePath()
                        ctx.fill()
                        
                        // ctx.fillRect(source.width/2 - door.width/2 -shadowDepth*2, source.height/2 - door.height - 40 ,shadowDepth*2, 40)
                        
                        // Bottom right
                        shadow.bottomRight.addColorStop(0, `rgba(255,255,255,${door.angle * .72})`)
                        shadow.bottomRight.addColorStop(1, "transparent")
                        ctx.fillStyle = shadow.bottomRight
                        ctx.fillRect(source.width/2 + door.width/2, source.height/2 ,shadowDepth*2, 40)
                        
                        // Bottom left
                        shadow.bottomLeft.addColorStop(0, `rgba(255,255,255,${door.angle * .72})`)
                        shadow.bottomLeft.addColorStop(1, "transparent")
                        ctx.fillStyle = "red"
                        ctx.fillStyle = shadow.bottomLeft
                        ctx.beginPath()
                        ctx.moveTo(source.width/2 - door.width/2, source.height/2)
                        ctx.lineTo(source.width/2 - door.width/2, source.height/2 + shadowDepth)
                        ctx.lineTo(source.width/2 - door.width/2 - shadowDepth*door.angle, source.height/2 + shadowDepth)
                        ctx.lineTo(source.width/2 - door.width/2 -shadowDepth*door.angle, source.height/2 + shadowDepth -shadowDepth*door.angle)
                        // ctx.lineTo(source.width/2 - door.width/2 -shadowDepth*door.angle, source.height/2 - door.height -shadowDepth)
                        // ctx.lineTo(source.width/2 - door.width/2 -shadowDepth*door.angle, source.height/2 - door.height -shadowDepth +shadowDepth*door.angle)
                        ctx.closePath()
                        ctx.fill()

                        // Right
                        shadow.right.addColorStop(0, `rgba(255,255,255,${door.angle * .72})`)
                        shadow.right.addColorStop(1, "transparent")
                        ctx.fillStyle = shadow.right
                        ctx.fillRect(source.width/2 + door.width/2, source.height/2 - door.height ,shadowDepth*2, door.height)
                        
                        // Bottom
                        shadow.bottom.addColorStop(0, `rgba(255,255,255,${door.angle * .64})`)
                        shadow.bottom.addColorStop(1, "transparent")
                        ctx.fillStyle = shadow.bottom
                        ctx.fillRect(source.width/2 - door.width/2, source.height/2, door.width, door.width*.72*2)
                        
                        // Top
                        shadow.top.addColorStop(0, `rgba(255,255,255,${door.angle * .72})`)
                        shadow.top.addColorStop(1, "transparent")
                        ctx.fillStyle = shadow.top
                        ctx.fillRect(source.width/2 - door.width/2, source.height/2 - door.height -shadowDepth*2, door.width,shadowDepth*2)
                        
                        openDoor(doorFront, ctx, door.angle)
                        // Draw door
                        // ctx.beginPath()
                        // ctx.strokeStyle = "rgba(128,128,128,1)"
                        // ctx.moveTo(door.x1, door.y1)
                        // ctx.lineTo(door.x1, door.y1 - door.height)
                        // ctx.lineTo(door.x1 + door.width, door.y1 - door.height)
                        // ctx.lineTo(door.x1 + door.width, door.y1)
                        // ctx.stroke()
                        // ctx.closePath()
                    },
                })
   
                // openDoor(doorFront, ctx, .2)
                // // Draw door handle
                // const handle = {
                //     x1: source.width/2 + door.width/2 - 20,
                //     x2: source.width/2 + door.width/2 - 20,
                //     y1: source.height/2 - door.height*.56,
                //     y2: source.height/2 - door.height*.56
                // }
                // tl.to(handle, {
                //     x1: handle.x1 + 12,
                //     duration: .4,
                //     delay: -.64,
                //     ease: "power2.in",
                //     onUpdate: () => {
                //         ctx.beginPath()
                //         ctx.strokeStyle = "rgba(180,180,180,1)"
                //         ctx.moveTo(handle.x1, handle.y1)
                //         ctx.lineTo(handle.x2, handle.y2)
                //         ctx.stroke()
                //         ctx.closePath()
                //     },
                // })
                // tl.to(handle, {
                //     y1: handle.y1 + 6,
                //     x1: handle.x1 + 6,
                //     duration: .2,
                //     delay: 0,
                //     ease: "power2.in",
                //     onUpdate: () => {

                //         ctx.clearRect( source.width/2 + door.width/2 - 20 ,source.height/2 - door.height*.56 -1,18,16)
                //         ctx.beginPath()
                //         ctx.strokeStyle = "rgba(180,180,180,1)"
                //         ctx.moveTo(handle.x1, handle.y1)
                //         ctx.lineTo(handle.x2, handle.y2)
                //         ctx.stroke()
                //         ctx.closePath()
                //     },
                // })
            })
        },
    }
})
</script>


<style lang="scss">
.overlay {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 2024;
}
.viewport {
    flex-flow: column;
    display: flex;
    gap: 16px;
    align-items: center;
    &.__isHidden {
        opacity: 0;
        pointer-events: none;
    }
}
#door-title {
    h1 {
        margin: 0;
    }
}

</style>