<template>

    <div class="options-overview">
        <header class="title">
            <h1>Speech bubble</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ref="matterContainer" ratio="1x1">
                <div class="scroll-container"
                    @mousedown="mouseDownEvent"
                    @touchstart="mouseDownEvent"
                    @mousemove="mouseMoveEvent">
                    <div class="render-canvas" ref="renderCanvas" :style="[{opacity: pageOptions.showMatterJS ? 1 : 0}]" />
                    <canvas id="paperCanvas" :style="[{opacity: pageOptions.showPaperJS ? 1 : 0}]" ></canvas>
                </div>
            </div>
            <textarea v-model="speechBubbleClass" cols="30" rows="7"></textarea>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Options" v-if="speechBubble">
                    <div class="option">
                        <span>
                            <input type="checkbox" id="displayMatterJS" v-model="pageOptions.showMatterJS">
                            <label for="displayMatterJS">
                                Show Matter JS
                            </label>
                        </span>
                    </div>
                    <div class="option">
                        <span>
                            <input type="checkbox" id="showPaperJS" v-model="pageOptions.showPaperJS">
                            <label for="showPaperJS">
                                Show Paper JS
                            </label>
                        </span>
                    </div>
                    <div class="option">
                        <span>
                            <strong>Text:</strong>
                            <br>
                            <br>
                            <textarea rows="3" v-model="speechBubble.text" />
                        </span>
                    </div>
                    <div class="option">
                        <span>
                            <strong>Animated text:</strong>
                            <br>
                            <br>
                            <textarea rows="5" v-model="animatedText" />
                            <br>
                            <br>
                            
                        </span>
                    </div>
                    <div class="option">
                        <label for="animateTextDuration">
                            animateTextDuration
                        </label>
                        <input type="number" id="animateTextDuration" v-model="animateTextDuration" step="2" min="0" max="1000">
                    </div>
                    <form class="option" @submit="animateText($event)">
                        <button class="button" type="submit">Update text</button>
                    </form>
                </div>
            </div>
        </aside>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue"
import Matter from "matter-js"
import MatterService from "@/services/matter-js"
import paperService from "@/services/paper-js"
import _ from "lodash"
import StatsJS from "stats.js"
import SpeechBubble from "@/models/speech-bubble"
import mousePosition from "@/services/mouse-position"
    
export default defineComponent ({ 
    props: [],
    data() {
        return {
            mWorld: null as null | Matter.World,
            mEngine: null as null | Matter.Engine,
            mRunner: null as null | Matter.Runner,
            mObject: [] as Array<Matter.Body>,
            stats: null as null | Stats,   
            mouseDown: false,
            mousePos: {x: 0, y:0},
            mouseTarget: null as null | Matter.Body,
            paperJS: {
                paths: [] as Array<paper.Path>,
            },
            animateTextDuration: 40,
            speechBubble: null as null | SpeechBubble,
            animatedText: "",
            speechBubbleClass: `.speech-bubble {
    font-size: 14px;
    color: #222;
    padding: 4px 0;
    max-width: 140px;
}`,
            pageOptions: {
                showMatterJS: false,
                showPaperJS: true
            },
        }
    },
    watch: {
        speechBubbleClass: {
            handler() {
                let styleElement = document.head.querySelector("#dynamic-css")
                if (!styleElement) {
                    styleElement = document.createElement("style")
                    document.head.append(styleElement)
                }
                styleElement.innerHTML = this.speechBubbleClass
                this.resetView()
            },
            immediate: true
        }
    },
    mounted() {
        this.initMatterJS()
        this.initPaperJS()
        const el = this.$el.querySelector(".scroll-container")
        this.createSpeechBubble()
        this.displayFPS(el)

        window.addEventListener("resize", this.resetView)
    },
    unmounted() {

        this.removeMatter()
        this.removePaperJS()
        if (this.speechBubble) {
            this.removeSpeechBubble()
        }
        this.stats = null

        window.removeEventListener("resize", this.resetView)
    },
    methods: {
        initPaperJS() {
            const canvas = this.$el.querySelector("#paperCanvas")
            const el = this.$el.querySelector(".scroll-container")
            if (!el) {
                throw new Error("Can't find .scroll-container")
            }
            paperService.init(canvas, el.clientWidth, el.clientHeight)
        },
        initMatterJS() {
            if (!this.$refs) {
                throw new Error("Missing $refs")
            }
            const canvasEl = this.$refs["renderCanvas"] as HTMLCanvasElement
            const mjs = MatterService.init(canvasEl)
            
            this.mWorld = mjs.world
            this.mRunner = mjs.runner
            this.mEngine = mjs.engine
            
            this.renderLoop()    
        },
        removePaperJS() {
            paperService.destroy()
        },
        removeMatter() {
            this.mWorld = null
            if (this.mRunner && this.mEngine) {
                MatterService.destroy(this.mRunner, this.mEngine)
            }
        },
        resetView() {
            this.removeSpeechBubble()
            this.removeMatter()
            this.removePaperJS()

            setTimeout(() =>{
                this.initView()
            })
        },
        initView() {
            this.initPaperJS()
            this.initMatterJS()
            this.createSpeechBubble()
        },

        mouseClickEvent(e: MouseEvent) {
            if (!this.mWorld || !this.speechBubble ) {
                return
            }
            this.mousePos = mousePosition.xy(e)

            this.speechBubble.x = this.mousePos.x
            this.speechBubble.y = this.mousePos.x
            // if (this.catterPillar.isMoving) {
            //     return
            // }
            
            // const head = this.catterPillar.composite.bodies[0]
            // const butt = this.catterPillar.composite.bodies[this.catterPillar.composite.bodies.length-1]
            
            // if (this.mousePos.x > head.position.x && this.mousePos.x < butt.position.x) {
            //     this.catterPillar.isMoving = false
            //     return
            // }

            // if (!this.catterPillar.isMoving) {
            //     this.catterPillar.isMoving = true
            //     this.catterPillarMove(this.catterPillar.composite.bodies, this.mousePos.x < head.position.x ? "left" : "right", true)
            // }
        },
        mouseDownEvent(e:MouseEvent | TouchEvent) {
            e.stopPropagation() 
            if (!this.mWorld || !this.speechBubble ) {
                return
            }
            this.mousePos = mousePosition.xy(e)

            this.speechBubble.x = this.mousePos.x
            this.speechBubble.y = this.mousePos.y

            // Matter.Body.setVelocity( this.speechBubble.body, {
            //     x: this.mousePos.x - this.mouseTarget.position.x,
            //     y: this.mousePos.y - this.mouseTarget.position.y,
            // })
            // if (!this.mWorld || !this.catterPillar?.composite) {
            //     return
            // }
        
            
            // if (this.mouseTarget) {
            //     this.catterPillar.isMoving = false
            //     e.preventDefault()
            // }
        },
        mouseMoveEvent(e:MouseEvent | TouchEvent) {
            if (!this.mouseDown) {
                return
            }
            this.mousePos = mousePosition.xy(e)
        },

        displayFloat(v:number | string | undefined) {
            if (!v) {
                return "-"
            }
            v = v.toString()
            
            return parseFloat(v).toFixed(2)
        },
        animateTextLoop(duration = 100, index = 0) {
            if (this.speechBubble) {
                this.speechBubble.text = this.animatedText.slice(0, index+1) + "..."
                if (index >= this.animatedText.length - 1) {
                    this.speechBubble.text += "..."

                    setTimeout(() => {
                        if (!this.speechBubble) { return }
                        this.speechBubble.text = this.animatedText.slice(0, index+1) + " .."
                        setTimeout(() => {
                            if (!this.speechBubble) { return }
                            this.speechBubble.text = this.animatedText.slice(0, index+1) + "  ."
                            setTimeout(() => {
                                if (!this.speechBubble) { return }
                                this.speechBubble.text = this.animatedText.slice(0, index+1)
                            }, duration *.6)
                        }, duration *.7)
                    }, duration *.8)
                }
            }
            if (index < this.animatedText.length - 1) {
                setTimeout(() => {
                    this.animateTextLoop(duration, index+1)
                }, duration)
            }
        },
        animateText(e:Event) {
            e.preventDefault()
            // this.animateTextLoop(72)
            this.animateTextLoop(this.animateTextDuration)
        },
        createSpeechBubble() {
            if (this.mWorld) {
                const el = this.$el.querySelector(".scroll-container")
                this.speechBubble = new SpeechBubble(this.mWorld, el, {x: el.clientWidth/2, y: el.clientHeight/2, text: "Hello world"})
                Matter.Composite.add(this.mWorld, [this.speechBubble.composite])
            }
        },
        removeSpeechBubble() {
            if (!this.mWorld) {
                return
            }

            // Remove existing catterpillar
            if (this.speechBubble) {
                this.speechBubble.remove()
            } else {
                console.error("No speech bubble set to be removed")
                return
            }

            
        },
        displayFPS(targetEl: HTMLElement) {
            this.stats = new StatsJS()
            this.stats.showPanel( 0 ) // 0: fps, 1: ms, 2: mb, 3+: custom
            this.stats.update() // 0: fps, 1: ms, 2: mb, 3+: custom
            this.stats.dom.id = "fpsCanvas"
            targetEl.appendChild( this.stats.dom )
            requestAnimationFrame( this.updateFPS )      
        },
        updateFPS () {
            if (!this.stats) {
                return
            }

            this.stats.begin()
            this.stats.end()

            requestAnimationFrame( this.updateFPS )
        },
        renderLoop() {
            // Exit renderLoop when component has been unmounted
            if (!this.mWorld) {
                return
            }
            
            const el = this.$refs.renderCanvas as HTMLElement
            
            if (!el) {
                requestAnimationFrame(this.renderLoop)
                return
            }

            // // Reset catterpillar when it is off screen
            // const head = this.catterPillar.head
            // const butt = this.catterPillar.butt
            
            // // if ((head.position.x > el.clientWidth && butt.position.x > el.clientWidth) ||
            // // (head.position.x <= 0 && butt.position.x < 0) ||
            // // (head.position.y > el.clientHeight + 100 && butt.position.y > el.clientHeight + 100)
            // // ) {
            // //     console.log("catterpillar", this.catterPillar.bodyLength)
            // //     this.removeSpeechBubble()
            
                
            // // } 
        
            // if (this.mouseDown && this.mouseTarget) {
            //     Matter.Body.setVelocity( this.mouseTarget, {
            //         x: this.mousePos.x - this.mouseTarget.position.x,
            //         y: this.mousePos.y - this.mouseTarget.position.y,
            //     })
            // }
            
            requestAnimationFrame(this.renderLoop)
        }
    }
})
</script>


<style lang="scss" scoped>

    @import '../assets/scss/variables.scss';
    .option-group {
        table {
            width: 100%;
            margin-bottom: 16px;
        }
        td {
            padding-bottom: 4px;
        }
    }
    .scroll-container {
        // touch-action: none;
        overflow: hidden;
        
        &.__disableTouch {
            touch-action: none;
        }
    }
    .render-canvas {
        width: 100%;
        height: 100%;
    }

    #paperCanvas {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
</style>

<!-- <style lang="scss">
.speech-bubble {
    font-size: 14px;
    color: #222;
    padding: 4px 0;
    max-width: 140px;
}
</style> -->
