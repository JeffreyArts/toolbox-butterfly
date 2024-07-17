<template>

    <div class="options-overview">
        <header class="title">
            <h1>Catterpillar - Attempt 6 (mouth)</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ref="matterContainer" ratio="1x1">
                <div class="scroll-container"
                    @mousedown="mouseDownEvent"
                    @touchstart="mouseDownEvent"
                    @touchend="touchEndEvent"
                    @click="mouseClickEvent"
                    @mousemove="mouseMoveEvent"
                    @touchmove="mouseMoveEvent">
                    <div class="render-canvas" ref="renderCanvas" :style="[{opacity: pageOptions.showMatterJS ? 1 : 0}]" />
                    <canvas id="paperCanvas" :style="[{opacity: pageOptions.showPaperJS ? 1 : 0}]" />
                </div>
            </div>
            <span class="footnote">Press left or right arrow,  <br>
                click left/right from catterpillar, <br>
                or drag him around with your mouse/finger
            </span>
            <div :style="{backgroundColor: catterPillar?.isMoving ? 'green': 'red'}" style="width: 48px; height: 48px;"></div>
        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="Body" v-if="options.length">
                    <table>
                        <tr>
                            <td><strong>Length:</strong></td><td>{{options.length}}</td>
                        </tr>
                        <tr>
                            <td><strong>Max velocity:</strong></td><td>{{ displayFloat(options.maxVelocity) }}</td>
                        </tr>
                        <tr>
                            <td><strong>Stiffness:</strong></td><td>{{ displayFloat(options.stiffness) }}</td>
                        </tr>
                        <tr>
                            <td><strong>Restitution:</strong></td><td>{{ displayFloat(options.restitution) }}</td>
                        </tr>
                        <tr>
                            <td><strong>Bodypart size:</strong></td><td>{{ displayFloat(options.bodyPart?.size) }}</td>
                        </tr>
                        <tr>
                            <td><strong>Bodypart restitution:</strong></td><td>{{ displayFloat(options.bodyPart?.restitution) }}</td>
                        </tr>
                        <tr>
                            <td><strong>Bodypart stiffness:</strong></td><td>{{ displayFloat(options.bodyPart?.stiffness) }}</td>
                        </tr>
                        <tr>
                            <td><strong>Bodypart damping:</strong></td><td>{{ displayFloat(options.bodyPart?.damping) }}</td>
                        </tr>
                    </table>
                </div>

                <div class="option-group" name="Catterpillar">
                    <div class="option">
                        <span>
                            <strong>Current state: {{ catterPillar?.mouth.state }}</strong>
                            <br>
                            <br>
                            <button class="button __is" @click="switchState('🙂')" :style="catterPillar?.mouth.inTransition ? 'cursor: not-allowed; filter: grayscale(100%);' : ''">
                                🙂
                            </button>
                            <button class="button __is" @click="switchState('😮')" :style="catterPillar?.mouth.inTransition ? 'cursor: not-allowed; filter: grayscale(100%);' : ''">
                                😮
                            </button>
                            <button class="button __is" @click="switchState('😐')" :style="catterPillar?.mouth.inTransition ? 'cursor: not-allowed; filter: grayscale(100%);' : ''">
                                😐
                            </button>
                            <button class="button __is" @click="switchState('🙁')" :style="catterPillar?.mouth.inTransition ? 'cursor: not-allowed; filter: grayscale(100%);' : ''">
                                🙁
                            </button>
                            <button class="button __is" @click="switchState('😚')" :style="catterPillar?.mouth.inTransition ? 'cursor: not-allowed; filter: grayscale(100%);' : ''">
                                😚
                            </button>
                        </span>
                    </div>
                    <div class="option">
                        <span>
                            <button class="button __is" for="blink" @click="blink">
                                Blink
                            </button>
                        </span>
                    </div>
                    <div class="option">
                        <label for="">Color:</label>
                        <input type="color" v-model="options.color" />
                    </div>
                </div>
                <div class="option-group" name="General">
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
                            <input type="checkbox" id="paperJS" v-model="pageOptions.showPaperJS">
                            <label for="paperJS">
                                Show Paper JS
                            </label>
                        </span>
                    </div>
                    <div class="option">
                        <span>
                            <button class="button __is" for="displayMatterJS" @click="generateNewCatterpillar">
                                Regenerate Catterpillar
                            </button>
                        </span>
                    </div>
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
import Paper from "paper"
import Catterpillar, { CatterpillarOptions } from "@/models/catterpillar"
import { MouthState } from "@/models/catterpillar/mouth"
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
            ground: null as null | Matter.Body, 
            mouseDown: false,
            mousePos: {x: 0, y:0},
            mouseTarget: null as null | Matter.Body,
            catterPillar: null as null | Catterpillar,
            pageOptions: {
                showMatterJS: true,
                showPaperJS: true,
            },
            ignoreOptionsUpdate: false,
            options: {
            } as CatterpillarOptions
        }
    },
    watch: {
        "options.color": {
            handler(){
                if (this.catterPillar && this.options.color) {
                    this.catterPillar.color = this.options.color
                }
            },
            deep: true
        },
    },
    mounted() {
        const el = this.$el.querySelector(".scroll-container")
        this.displayFPS(el)
        this.initView()

        window.addEventListener("keydown", this.keyPressEvent)
        window.addEventListener("mouseup", this.cancelMouseDown)
        window.addEventListener("resize", this.resetView)
    },
    unmounted() {
        this.removeCatterpillar()
        this.removeMatter()
        this.removePaperJS()
        this.stats = null
        
        window.removeEventListener("keydown", this.keyPressEvent)
        window.removeEventListener("mouseup", this.cancelMouseDown)
        window.removeEventListener("resize", this.resetView)
    },
    methods: {
        displayFloat(v:number | string | undefined) {
            if (!v) {
                return "-"
            }
            v = v.toString()
            
            return parseFloat(v).toFixed(2)
        },
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
        initView() {
            this.initMatterJS()
            this.initPaperJS()
            this.generateOptions()
            this.generateCatterpillar()
            this.createGround()
        },
        resetView() {
            this.removeMatter()
            this.removePaperJS()

            setTimeout(this.initView)
        },

        cancelMouseDown() {
            if (!this.catterPillar || this.catterPillar.isMoving && !this.mouseTarget) {
                return
            }
            
            this.mouseDown = false
            this.mouseTarget = null
            this.catterPillar.isMoving = false

            _.each(this.catterPillar.composite?.bodies, body => {
                Matter.Body.setAngularSpeed(body, 0)
                Matter.Body.setAngularVelocity(body, 0)
            })
        },
        touchEndEvent(e: TouchEvent) {
            this.mouseDown = false
            this.mouseTarget = null
        },
        mouseClickEvent(e: MouseEvent) {
            if (!this.mWorld || !this.catterPillar?.composite ) {
                return
            }
            this.mousePos = mousePosition.xy(e)
            if (this.catterPillar.isMoving) {
                return
            }
            
            const head = this.catterPillar.composite.bodies[0]
            const butt = this.catterPillar.composite.bodies[this.catterPillar.composite.bodies.length-1]
            
            if (this.mousePos.x > head.position.x && this.mousePos.x < butt.position.x) {
                this.catterPillar.isMoving = false
                return
            }

            if (!this.catterPillar.isMoving) {
                this.catterPillar.isMoving = true
                this.catterPillarMove(this.catterPillar.composite.bodies, this.mousePos.x < head.position.x ? "left" : "right", true)
            }
        },
        mouseDownEvent(e:MouseEvent | TouchEvent) {
            e.stopPropagation() 
            if (!this.mWorld || !this.catterPillar?.composite) {
                return
            }
            if (!this.options.bodyPart) {
                console.error("Missing bodypart")
                return
            }
            
            let range = this.options.bodyPart.size

            if (!range) {
                console.error("Missing bodypart.size")
                return
            }

            this.mouseDown = true
            this.mousePos = mousePosition.xy(e)
            _.each(this.catterPillar.composite.bodies, body => {
                if (!range) {
                    return
                }
                if ((this.mousePos.x > (body.position.x - range) - range / 2) &&
                    (this.mousePos.x < (body.position.x + range) + range / 2) &&
                    (this.mousePos.y > (body.position.y - range) - range / 2) &&
                    (this.mousePos.y < (body.position.y + range) + range / 2)) {
                    this.mouseTarget = body
                }
            })
            
            if (this.mouseTarget) {
                this.catterPillar.isMoving = false
                e.preventDefault()
            }
        },
        mouseMoveEvent(e:MouseEvent | TouchEvent) {
            if (!this.mouseDown) {
                return
            }
            this.mousePos = mousePosition.xy(e)
        },
        keyPressEvent(e: KeyboardEvent) {
            if (!this.catterPillar || !this.mEngine || this.catterPillar.isMoving) {
                return
            }
            
            if (!this.catterPillar.composite) {
                console.warn("Missing catterpillar object")
                return
            }
            
            let direction = "" as "" | "right" | "left"
            if (e.key === "ArrowLeft" || e.key.toUpperCase() === "A") {
                direction = "left"
            } else if (e.key === "ArrowRight" || e.key.toUpperCase() === "D") {
                direction = "right"
            }

            
            if (direction) {
                this.catterPillar.isMoving = true
                this.catterPillarMove(this.catterPillar.composite.bodies, direction)
            }
        },


        generateOptions() {
            const color = this.options.color ? this.options.color : "#58f208"
            this.options = {
                color:          color,
                length:         14 + Math.floor(Math.random() * 8 - 4),
                maxVelocity:    3.2 + Math.random() * 1.6 - 0.8,
                stiffness:      .16 + Math.random() * 0.40 - 0.08, 
                restitution:    .72 + Math.random() * 0.16 - 0.08,
                bodyPart: {
                    size:        12 + Math.floor(Math.random() * 12 - 6),
                    stiffness:   .2 + Math.random() * .8 - .04,
                    damping:    0,
                    restitution: .5 + Math.random() * .6 - .3,
                }
            } as CatterpillarOptions
        },


        createGround() {
            const el = this.$refs["matterContainer"] as HTMLElement
            if (!el) {
                throw new Error("matterContainer ref can not be found")
            }
            if (!this.mWorld) {
                throw new Error("mWorld can't be null")
            }

            this.ground = Matter.Bodies.rectangle(el.clientWidth/2, el.clientHeight+160, el.clientWidth, 348, {
                isStatic: true,
                label: "ground",
                friction: 1,
                collisionFilter: {
                    // category: 2,create
                    // mask: 1
                }
            })
            
            // add all of the bodies to the world
            Matter.Composite.add(this.mWorld, [this.ground])
        },
        catterPillarMove(bodies: Array<Matter.Body>, direction : "left" | "right", recursive?: boolean) {
            if (!this.catterPillar) {
                throw new Error("Can't move catterpillar if it isn't there...")
            }
            let hasMoved: Promise<boolean> // true = has moved, false = has not moved
            if (direction === "left") {
                hasMoved = this.catterPillar.moveLeft()
            } else {
                hasMoved = this.catterPillar.moveRight()
            }

            hasMoved.then(really => {
                if (!really) {
                    return
                }
                if (!this.catterPillar) {
                    throw new Error("this.catterPillar == null")
                }
            
                if (recursive) {
                    setTimeout(() => {
                        const head = bodies[0]
                        if ((direction == "left" && head.position.x > this.mousePos.x) ||
                        direction == "right" && head.position.x < this.mousePos.x) {
                            this.catterPillarMove(bodies, direction)
                        } else {
                            this.mousePos = {x:0, y:0}
                        }
                    }, 240)
                }
            })
        },
        removeCatterpillar() {
            if (!this.mWorld) {
                return
            }

            // Remove existing catterpillar
            if (this.catterPillar) {
                Matter.Composite.remove(this.mWorld, this.catterPillar.composite)
                this.catterPillar.remove()
            } else {
                console.error("No catterpillar set to be removed")
                return
            }
            
            // Remove all constraints
            _.each(this.mWorld.constraints, constraint => {
                if (this.mWorld) {
                    Matter.Composite.remove(this.mWorld, constraint)
                }
            })
            
            // Remove all bodyPart composites
            _.each(this.mWorld.composites, composite => {
                if (this.mWorld && composite.label === "bodyPart") {
                    Matter.Composite.remove(this.mWorld, composite)
                }
            })
            
        },
        generateCatterpillar() {
            const el = this.$el.querySelector(".scroll-container")

            if (!el || !this.mWorld) {
                return
            }

            if (this.catterPillar) {
                this.removeCatterpillar()
            }
    
            if (!this.options.length || !this.options.bodyPart?.size) {
                return
            }

            const options = this.options
            const x = el.clientWidth/2 - (this.options.length * this.options.bodyPart.size) / 2
            
            this.catterPillar = new Catterpillar(this.mWorld, {x, y: 8, ...options, autoBlink: true})

            Matter.Composite.add(this.mWorld, [
                this.catterPillar.composite
            ])
        },
        generateNewCatterpillar() {
            this.generateOptions()
            this.generateCatterpillar()
        },
        displayFPS(targetEl: HTMLElement) {
            this.stats = new StatsJS()
            this.stats.showPanel( 0 ) // 0: fps, 1: ms, 2: mb, 3+: custom
            this.stats.update() // 0: fps, 1: ms, 2: mb, 3+: custom
            this.stats.dom.id = "fpsCanvas"
            targetEl.appendChild( this.stats.dom )
            requestAnimationFrame( this.updateFPS )      
        },
        blink() {
            this.catterPillar?.blink()
        },
        switchState(state:  MouthState) {
            this.catterPillar?.mouth.switchState(state, .64)
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
            
            if (!el || !this.catterPillar || this.catterPillar.bodyLength < 0) {
                requestAnimationFrame(this.renderLoop)
                return
            }

            // Reset catterpillar when it is off screen
            const head = this.catterPillar.head
            const butt = this.catterPillar.butt
            
            if ((head.position.x > el.clientWidth && butt.position.x > el.clientWidth) ||
            (head.position.x <= 0 && butt.position.x < 0) ||
            (head.position.y > el.clientHeight + 100 && butt.position.y > el.clientHeight + 100)
            ) {
                this.removeCatterpillar()
            
                // Don't create new catterpillar immediately for UX reasons
                setTimeout(() => {
                    this.generateCatterpillar()
                }, 480)
            } 
        
            if (this.mouseDown && this.mouseTarget) {
                Matter.Body.setVelocity( this.mouseTarget, {
                    x: this.mousePos.x - this.mouseTarget.position.x,
                    y: this.mousePos.y - this.mouseTarget.position.y,
                })
            }
            
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