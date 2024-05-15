<template>
    <div class="options-overview">
        <header class="title" id="door-title">
            <h1>Door</h1>
        </header>

        <hr>
        <section class="viewport">
           
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

export default defineComponent ({ 
    props: [],
    data() {
        return {
            clickType: "dot" as "dot" | "masked-dot",
            mousePos: {x:-1, y:0},
            defaultClick: false,
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
        this.updateOverlay()
        this.createScreenshot()
        window.addEventListener("click", this.clickEvent)
        window.addEventListener("resize", this.updateOverlay)
    },
    unmounted() {
        window.removeEventListener("click", this.clickEvent)
        window.removeEventListener("resize", this.updateOverlay)
        let img = document.querySelector(".overlay") as HTMLImageElement
        img.remove()
    },
    methods: {
        updateOverlay() {
            let img = document.querySelector(".overlay") as HTMLImageElement
            if (!img) {
                img = document.createElement("img")
                img.className = "overlay"
                document.body.appendChild(img)
            }
            this.clickEvent()
        },
        createScreenshot() {
            let img = document.querySelector(".overlay") as HTMLImageElement
            if (!img) {
                return new Error("no overlay found")
            }

            return new Promise<HTMLImageElement>((resolve, reject) => {
                const domElement = document.querySelector("#app")
                if (!domElement) {
                    return reject("domElement missing")
                }
                domtoimage.toPng(domElement).then( (dataUrl) => {
                    img.src = dataUrl
                    // })
                    resolve(img)
                }).catch((err)=> {
                    console.error(err)
                    reject(err)
                })
            })
        },
        clickEvent(e?: MouseEvent | TouchEvent | customMouseEvent | customTouchEvent) {
            if (e) {
                
                this.updateMousePos(e)
                if (!this.defaultClickEvent || !this.defaultClickEvent.custom) {
                    e.preventDefault()
                    if (e instanceof MouseEvent) {
                        this.defaultClickEvent = e as customMouseEvent
                    } else {
                        this.defaultClickEvent = e as customTouchEvent
                    }
                }
            }
            
            if (this.mousePos.x != -1) {
                switch (this.clickType) {
                case "dot":
                    this.addDot()
                    break
                        
                default:
                    this.createScreenshot()
                    break
                }
                // console.log("Trigger opnieuw click event")
                this.defaultClick = false
                if (this.defaultClickEvent && !this.defaultClickEvent.custom) {
                    this.defaultClickEvent.custom = true
                    this.clickEvent(this.defaultClickEvent)
                }
            }
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
            const overlayCanvas = this.loadOverlay()
            
            if (!overlayCanvas || !overlayCanvas.width) {
                return
            }
            const ctx = overlayCanvas.getContext("2d")
            if (!ctx) {
                return
            }


            ctx.beginPath()
            ctx.arc(this.mousePos.x, this.mousePos.y, 40, 0, 2 * Math.PI)
            ctx.fillStyle = "red"
            ctx.fill()
            // ctx.strokeStyle = "red"
            // ctx.stroke()
            
            

            const overlay = document.querySelector(".overlay") as HTMLImageElement
            if (!overlay) {
                console.error("No overlay found")
                return 
            }
            overlay.src = overlayCanvas.toDataURL()
        },
        addMaskedDot() {
            const overlayCanvas = this.loadOverlay()
            
            if (!overlayCanvas || !overlayCanvas.width) {
                return
            }
            const ctx = overlayCanvas.getContext("2d")
            if (!ctx) {
                return
            }


            ctx.beginPath()
            ctx.arc(this.mousePos.x, this.mousePos.y, 40, 0, 2 * Math.PI)
            ctx.fillStyle = "red"
            ctx.fill()
            ctx.stroke()
            
            

            const overlay = document.querySelector(".overlay") as HTMLImageElement
            if (!overlay) {
                console.error("No overlay found")
                return 
            }
            const tmpCanvas = document.createElement("canvas") as HTMLCanvasElement
            tmpCanvas.width = overlay.width
            tmpCanvas.height = overlay.height
            const tmpCtx = tmpCanvas.getContext("2d")
            if (!tmpCtx) {
                return
            }
            /// draw the shape we want to use for clipping
            tmpCtx.drawImage(overlayCanvas, 0, 0)

            /// change composite mode to use that shape
            tmpCtx.globalCompositeOperation = "source-in"

            /// draw the image to be clipped
            tmpCtx.drawImage(overlay, 0, 0)

            overlay.src = overlayCanvas.toDataURL()
        },
        loadOverlay() {
            let img = document.querySelector(".overlay") as HTMLImageElement
            if (!img) {
                console.error(new Error("No overlay found"))
                return 
            }
            const canvas = document.createElement("canvas") as HTMLCanvasElement
            const ctx = canvas.getContext("2d")
            canvas.width = img.width
            canvas.height = img.height
            // ctx?.drawImage(img, 0,0,canvas.width, canvas.height)
            return canvas
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
#door-title {
    h1 {
        margin: 0;
    }
}
</style>