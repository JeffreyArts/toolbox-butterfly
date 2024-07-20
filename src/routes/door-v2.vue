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

                <div class="option-group" name="Properties">
                    <div class="option">
                        <label for="doorWidth">Door width</label>
                        <input type="number" id="doorWidth" v-model="doorOptions.width">
                    </div>
                    <div class="option">
                        <label for="doorHeight">Door height</label>
                        <input type="number" id="doorHeight" v-model="doorOptions.height">
                    </div>
                </div>
                <div class="option-group" name="Actions" v-if="door">
                    <div class="option">
                        <label for="doorOpen">Open door</label>
                        <button class="button" :class="door.isOpen ? '__isDisabled' : ''" :disabled="door.isOpen" @click="door.open">Open</button>
                        <button class="button" :class="door.isOpen ? '' : '__isDisabled'" :disabled="!door.isOpen" @click="door.close">Close</button>                    </div>
                    <div class="option">
                        <label for="doorAngle">Angle</label>
                        <input type="number" id="doorAngle" min="-90" max="180" v-model="door.door.angle">
                    </div>
                    <div class="option">
                        <label>Hinges</label>
                        <input type="radio" id="hinges-left" value="left" v-model="door.hinges">
                        <label for="hinges-left">
                            Left
                        </label>

                        <input type="radio" id="hinges-right" value="right" v-model="door.hinges">
                        <label for="hinges-right">
                            Right
                        </label>
                    </div>
                    <div class="option">
                        <label for="doorOpen">Destroy door</label>
                        <button class="button" @click="door.remove">Destroy</button>
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
        this.updateOverlay()
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
        updateOverlay() {
            let overlayCanvas = document.querySelector(".overlay") as HTMLCanvasElement
            if (!overlayCanvas) {
                overlayCanvas = document.createElement("canvas")
                overlayCanvas.width = window.innerWidth
                overlayCanvas.height = window.innerHeight
                overlayCanvas.className = "overlay"
                document.body.appendChild(overlayCanvas)
            }
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
                
                if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement || e.target instanceof HTMLLabelElement) {
                    return //e.preventDefault()
                }
            }
            
            if (this.door) {
                this.door.remove()
            }
            
            const overlayEl = document.querySelector(".overlay") as HTMLCanvasElement
            if (this.mousePos.x != -1 && overlayEl) {
                this.door = new Door({
                    sourceElement: document.body,
                    targetCanvas: overlayEl,
                    x: this.mousePos.x,
                    y: this.mousePos.y,
                    maxAngle: 45,
                    width: this.doorOptions.width,
                    height: this.doorOptions.height
                })

                if (import.meta.env.DEV) {
                    console.log(this.door)
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
    }
})
</script>


<style lang="scss" scoped>
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
label {
    cursor: not-allowed;
}
#door-title {
    h1 {
        margin: 0;
    }
}

</style>