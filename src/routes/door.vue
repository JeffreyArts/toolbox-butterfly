<template>
    <div class="options-overview">
        <header class="title" id="door-title">
            <h1>Door</h1>
        </header>

        <hr>
        <section class="viewport">
           <canvas ref="sourceCanvas"></canvas>
            <strong>Hidden canvas</strong>
        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="Click">
                    <p>Click anywhere on the screen, to create {{ displayClickType }}</p>
                    <div class="option">
                        <label>Click type</label>
                        <input type="radio" name="dot" value="dot" id="dot" v-model="clickType">
                        <label for="dot"> Dot </label>
                        
                        <input type="radio" value="masked-dot" id="masked-dot" v-model="clickType">
                        <label for="masked-dot"> Masked dot </label>
                        
                        <input type="radio" value="animated-doorway" id="animated-doorway" v-model="clickType">
                        <label for="animated-doorway"> Animated Doorway </label>
                    </div>
                </div>

            </div>
        </aside>
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

export default defineComponent ({ 
    props: [],
    data() {
        return {
            clickType: "dot" as "dot" | "masked-dot" | "animated-doorway",
            mousePos: {x:-1, y:0},
            defaultClick: false,
            animation: true,
            clearDrawing: false,
            defaultClickEvent: null as null | customMouseEvent | customTouchEvent,
        }
    },
    computed: {
        displayClickType() {
            const parts = this.clickType.split("-")
            let res = ""
            for (let i = 0; i < parts.length; i++) {
                if (i===0) {
                    res += parts[i].charAt(0) + parts[i].slice(1)
                } else {
                    
                    res += " " + parts[i]
                }
                
            }
            
            return ["a","e","u","i","o"].includes(res.charAt(0).toLocaleLowerCase()) ? `an ${res}` : `a ${res}`
        }
    },
    mounted() {
        this.draw()
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
        draw() {
            if (!this.animation) {
                return
            }
            // console.log("✍️")
            const sourceCanvas = this.$refs.sourceCanvas as HTMLCanvasElement
            const sourceContext = sourceCanvas.getContext("2d")
            const overlayCanvas =  document.querySelector(".overlay") as HTMLCanvasElement
            
            // Error checks
            if (!overlayCanvas) {
                this.updateOverlay()
                requestAnimationFrame(this.draw)
                return
            }
            const overlayContext = overlayCanvas.getContext("2d")
            if (!overlayContext) {
                return console.error("Missing overlayContext")
            }
            if (!sourceCanvas || !sourceContext) {
                return console.error("Missing sourceCanvas")
            }
            // First clear canvas
            overlayContext.clearRect(0,0,overlayCanvas.width,overlayCanvas.height)
            
            // Update overlay canvas
            overlayContext.drawImage(sourceCanvas, this.mousePos.x - sourceCanvas.width/2, this.mousePos.y - sourceCanvas.height/2)

            requestAnimationFrame(this.draw)
        },
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
            if (e) {
                this.updateMousePos(e)
            }

            if (this.mousePos.x != -1) {
                switch (this.clickType) {
                case "dot":
                    this.addDot()
                    break
                        
                case "masked-dot":
                    this.addMaskedDot()
                    break
                        
                case "animated-doorway":
                    this.addAnimatedDoorway()
                    break
                        
                default:
                    console.log("!!!! No default action !!!!!")
                    // this.createScreenshot()
                    break
                }
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
        addDot() {
            const size = 40
            const sourceCanvas = this.$refs.sourceCanvas as HTMLCanvasElement
            
            if (!sourceCanvas) {
                console.error("Missing target canvas")
                return
            }
            
            sourceCanvas.width = size
            sourceCanvas.height = size

            const ctx = sourceCanvas.getContext("2d")
            if (!ctx) {
                return
            }


            ctx.beginPath()
            ctx.arc(size/2,size/2, size/2, 0, 2 * Math.PI)
            ctx.fillStyle = "red"
            ctx.fill()
            ctx.closePath()
        },
        addMaskedDot() {
            const size = 40
            const sourceCanvas = this.$refs.sourceCanvas as HTMLCanvasElement
            
            sourceCanvas.width = size
            sourceCanvas.height = size

            const ctx = sourceCanvas.getContext("2d")
            if (!ctx) {
                return
            }

            const overlay = document.querySelector(".overlay") as HTMLImageElement
            if (!overlay) {
                console.error("No overlay found")
                return 
            }

            this.createScreenshot().then((imgData) => {
                const source = {
                    x: this.mousePos.x - size/2,
                    y: this.mousePos.y - size/2,
                    width: size,
                    height: size,
                }
                    
                const imgElement = new Image()
                imgElement.onload = function() {
                    /// draw the shape we want to use for clipping
                    ctx.beginPath()
                    ctx.arc(size/2,size/2, size/2, 0, 2 * Math.PI)
                    ctx.fillStyle = "black"
                    ctx.fill()
                    
                    /// change composite mode to use that shape
                    ctx.globalCompositeOperation = "source-in"
                        
                    /// draw the image to be clipped
                    ctx.drawImage(imgElement, source.x, source.y, source.width, source.height, 0,0, size, size)

                    // Set back to default
                    ctx.globalCompositeOperation = "source-over"

                    /// draw the shape we want to use for clipping
                    ctx.beginPath()
                    ctx.arc(size/2,size/2, size/2, 0, 2 * Math.PI)
                    ctx.strokeStyle = "black"
                    ctx.stroke()
                }
                imgElement.src = imgData
            })
        },
        addAnimatedDoorway() {
            const size = 320
            const sourceCanvas = this.$refs.sourceCanvas as HTMLCanvasElement
            
            sourceCanvas.width = size
            sourceCanvas.height = size

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
                x: this.mousePos.x - size/2,
                y: this.mousePos.y - size/2,
                width: size,
                height: size,
            }

            const door = {
                width: 64,
                height: 128,
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

            const backgroundDrawn = new Promise((resolve, reject) => {
                this.createScreenshot().then((imgData) => {
                    const imgElement = new Image()
                    imgElement.onload = function() {
                        ctx.drawImage(imgElement, source.x, source.y, source.width, source.height, 0,0, size, size)
                        resolve(true)
                    }
                    imgElement.src = imgData
                })
            })

            backgroundDrawn.then(() => {
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
                        ctx.beginPath()
                        ctx.strokeStyle = "rgba(128,128,128,1)"
                        ctx.moveTo(door.x1, door.y1)
                        ctx.lineTo(door.x1, lineLeft.y)
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
                        ctx.beginPath()
                        ctx.strokeStyle = "rgba(128,128,128,1)"
                        ctx.moveTo(source.width/2 + door.width/2, lineLeft.y)
                        ctx.lineTo(door.x2, lineLeft.y)
                        ctx.stroke()
                        ctx.closePath()
                    },
                })

                // Draw door handle
                const handle = {
                    x: source.width/2 + door.width/2 - 20,
                    y: source.height/2 - door.height*.56
                }
                tl.to(handle, {
                    x: handle.x + 12,
                    duration: .4,
                    delay: -.64,
                    ease: "power2.in",
                    onUpdate: () => {
                        ctx.beginPath()
                        ctx.strokeStyle = "rgba(180,180,180,1)"
                        ctx.moveTo(source.width/2 + door.width/2 - 20, handle.y)
                        ctx.lineTo(handle.x, handle.y)
                        ctx.stroke()
                        ctx.closePath()
                    },
                })
            })
        },
        loadOverlay() {
            let overlayCanvas = document.querySelector(".overlay") as HTMLCanvasElement
            if (!overlayCanvas) {
                console.error(new Error("No overlay found"))
                return 
            }
            
            return overlayCanvas
        }
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
}
.viewport {
    flex-flow: column;
    display: flex;
    gap: 16px;
    align-items: center;
}
#door-title {
    h1 {
        margin: 0;
    }
}
</style>