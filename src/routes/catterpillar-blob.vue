<template>

    <div class="options-overview">
        <header class="title">
            <h1>Catterpillar Blob</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ref="matterContainer" ratio="1x1">
                <div class="scroll-container">
                    <div class="render-canvas" ref="renderCanvas" :style="[{opacity: showMatterJS ? 1 : 0}]" />
                    <canvas id="paperCanvas" :style="[{opacity: showPaperJS ? 1 : 0}]"></canvas>
                </div>
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="General">
                    <div class="option">
                        <span>
                            <input type="checkbox" id="displayMatterJS" v-model="showMatterJS">
                            <label for="displayMatterJS">
                                Show Matter JS
                            </label>
                        </span>
                        <span>
                            <input type="checkbox" id="displayPaperJS" v-model="showPaperJS">
                            <label for="displayPaperJS">
                                Show Paper JS
                            </label>
                        </span>
                        <br>
                        <br>
                        <span>
                            <button class="button __is" for="displayMatterJS" @click="generateBlob">
                                Regenerate Blob
                            </button>
                        </span>
                    </div>
                </div>

                <div class="option-group" name="Options">
                    <div class="option">
                        <span>
                            <input type="checkbox" id="options.smooth" v-model="options.smooth">
                            <label for="options.smooth">
                                Smooth
                            </label>
                        </span>
                    </div>

                    <div class="option">
                        <label for="points">
                            Points
                        </label>
                        <input type="number" id="points" v-model="options.points" step="1" min="3" max="32">
                    </div>

                    <div class="option">
                        <label for="size">
                            Size
                        </label>
                        <input type="number" id="size" v-model="options.size" step="1" min="4" max="100">
                    </div>
                    
                    <div class="option">
                        <label for="stiffness">
                            Stiffness
                        </label>
                        <input type="number" id="stiffness" v-model="options.stiffness" step="0.02" min="0" max="1">
                    </div>
                    <div class="option">
                        <label for="damping">
                            Damping
                        </label>
                        <input type="number" id="damping" v-model="options.damping" step="0.02" min="0" max="1">
                    </div>
                    <div class="option">
                        <label for="restitution">
                            Restitution
                        </label>
                        <input type="number" id="restitution" v-model="options.restitution" step="0.02" min="0" max="1">
                    </div>
                </div>



            </div>
        </aside>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import Matter, { Composite } from "matter-js"
import paperService from "@/services/paper-js"
import MatterService from "@/services/matter-js"
import _ from "lodash"
import StatsJS from "stats.js"
import Paper from "paper"
    
export default defineComponent ({ 
    props: [],
    data() {
        return {
            mWorld: null as null | Matter.Composite,
            mEngine: null as null | Matter.Engine,
            mRunner: null as null | Matter.Runner,
            mObject: [] as Array<Matter.Body>,
            stats: null as null | Stats,    
            animation: true,
            paperBalls: [] as Array<paper.Shape>,
            imgBlob: {
                paperPath: null as null | paper.Path,
                points: [] as Array<paper.Point>
            },
            showMatterJS: true,
            showPaperJS: true,
            options: {
                smooth: true,
                damping: 0,
                stiffness: 0.01,
                points: 6,
                size: 100,
                restitution: .8
            }
        }
    },
    watch: {
        "options.size": {
            handler() {
                this.generateBlob()
            }
        },
        "options.points": {
            handler() {
                this.generateBlob()
            }
        },
        "options.stiffness": {
            handler() {
                if (!this.mWorld) {
                    return
                }

                _.each(this.mWorld.constraints, constraint => {
                    if (this.mWorld && constraint.label === "blob") {
                        constraint.stiffness = this.options.stiffness
                    }
                })
                
            }
        }
    },
    mounted() {
        const el = this.$el.querySelector(".scroll-container")
        this.displayFPS(el)
        this.initView()

        this.addMouseEvent()

        window.addEventListener("resize", this.resetView)
    },
    beforeUnmount() {
        const el = this.$refs["matterContainer"] as HTMLElement
        if (!el) {
            return
        }
        el.removeEventListener("mousemove",this.mouseMoveEvent)
    },
    unmounted() {
        this.removeMatter()
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
            
            if (this.mRunner) {
                Matter.Runner.stop(this.mRunner)
            }

            if (this.mEngine) {
                Matter.Engine.clear(this.mEngine)
            }
        },
        resetView() {
            this.removeMatter()
            this.removePaperJS()

            setTimeout(this.initView)
        }, 
        initView() {
            this.initMatterJS()
            this.initPaperJS()
            this.createGround()
            this.generateBlob()
        },    
        
        
        addMouseEvent() {
            const el = this.$refs["matterContainer"] as HTMLElement
            if (!el) {
                return
            }

            if (!this.mWorld) {
                console.error("First initialise Matter World")
                return
            }

            el.addEventListener("mousemove",this.mouseMoveEvent)
        },
        mouseMoveEvent(e: MouseEvent) {
            // console.log("Mouse",e)
        },
        
        removeBlob() {
            if (!this.mWorld) {
                return
            }
            // Remove existing blob
            this.imgBlob.points = []
            const bodyBlobs = _.filter(this.mWorld.composites, composite => {
                return composite.label === "bodyBlob"
            })
            _.each(bodyBlobs, bodyBlob => {
                if (!this.mWorld) {
                    return
                }
                Matter.Composite.remove(this.mWorld, bodyBlob)
            })
            
            const constraints = _.clone(this.mWorld.constraints)
            _.each(constraints, constraint => {
                if (this.mWorld) {
                    Matter.Composite.remove(this.mWorld, constraint)
                }
            })

            if (this.imgBlob.paperPath) {
                this.imgBlob.paperPath.remove()
            }
        },
        createGround() {
            const el = this.$refs["matterContainer"] as HTMLElement
            if (!el) {
                throw new Error("matterContainer ref can not be found")
            }
            if (!this.mWorld) {
                throw new Error("mWorld can't be null")
            }

            const ground = Matter.Bodies.rectangle(el.clientWidth/2, el.clientHeight-16, el.clientWidth, 16, {
                isStatic: true,
                label: "ground",
                friction: 1,
                collisionFilter: {
                    category: 2,
                    mask: 1
                }
            })
            
            // add all of the bodies to the world
            Matter.Composite.add(this.mWorld, [ground])
        },
        generateBlob() {
            const offset = 40
            const el = this.$el.querySelector(".scroll-container")
            if (!el || !this.mWorld) {
                return
            }
            this.removeBlob()

            const center = {x: el.clientWidth/2, y: el.clientHeight/2}
            const centerRadius = this.options.size/2
            
            let radius = Math.min(el.clientHeight/2, el.clientWidth/2) - offset
            let prev = null
            let first = null

            const bodyPartBlob = Matter.Composite.create({label: "bodyBlob"})
            const centerCircle = Matter.Bodies.circle( center.x, center.y, this.options.size*.9, {
                label: "centerPoint",
                isStatic: false
            })
            Matter.Composite.add(bodyPartBlob, centerCircle)

            for (let i=0; i < this.options.points; i++) {
                const angle = 360/this.options.points
                
                const x = center.x + (radius * Math.cos(angle*i*Math.PI/180)) * this.options.size/100
                const y = center.y + (radius * Math.sin(angle*i*Math.PI/180)) * this.options.size/100
                
                const circle = Matter.Bodies.circle( x, y, this.options.size/10, {
                    label: "blobCircle",
                    restitution: this.options.restitution
                })

                Matter.Composite.add(bodyPartBlob, circle)

                // Create tension between outer points
                if (prev) {
                    Matter.Composite.add(bodyPartBlob, [
                        Matter.Constraint.create({
                            bodyA: circle,
                            bodyB: prev,
                            stiffness: this.options.stiffness,
                            damping: this.options.damping,
                            label: "blob"
                        }),
                    ])
                }

                Matter.Composite.add(bodyPartBlob, [
                    Matter.Constraint.create({
                        bodyA: circle,
                        bodyB: centerCircle,
                        pointA: {x: 0, y: 0},
                        pointB: {
                            x: centerRadius * Math.cos(angle*i*Math.PI/180), 
                            y: centerRadius * Math.sin(angle*i*Math.PI/180)},
                        stiffness: .8,
                        damping: this.options.damping,
                        label: "centerCircle"
                    })
                ])
                
                if (!first) {
                    first = circle
                }

                this.imgBlob.points.push(new Paper.Point(x, y))
                prev = circle
            }

            if (first && prev) {
                Matter.Composite.add(bodyPartBlob, 
                    [
                        Matter.Constraint.create({
                            bodyA: first,
                            bodyB: prev,
                            stiffness: this.options.stiffness,
                            damping: this.options.damping,
                            label: "blob"
                        }),
                    ]
                )
            }

            Matter.Composite.add(this.mWorld, bodyPartBlob)

            const Path = new Paper.Path(this.imgBlob.points)
            Path.closed = true

            if (this.options.smooth) {
                Path.smooth()
            }

            Path.fillColor = new Paper.Color("#58f208")
            Path.strokeColor = new Paper.Color("#58f208")

            this.imgBlob.paperPath = Path
        },
        displayFPS(targetEl: HTMLElement) {
            this.stats = new StatsJS()
            this.stats.showPanel( 0 ) // 0: fps, 1: ms, 2: mb, 3+: custom
            this.stats.update() // 0: fps, 1: ms, 2: mb, 3+: custom
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
            if (!this.mWorld) {
                return
            }
            const bodyBlob = _.filter(this.mWorld.composites, (composite) => {
                return composite.label  === "bodyBlob"
            })
            if (!bodyBlob || bodyBlob.length < 0 || !bodyBlob[0]) {
                requestAnimationFrame(this.renderLoop)
                return
            }

            const circles = _.filter(bodyBlob[0].bodies, (body) => {
                return body?.label === "blobCircle"
            })

            _.each(circles, (body, i) => {
                if (body?.label === "blobCircle" && this.mWorld) {
                    const segment = this.imgBlob.paperPath?.segments[i]
                    if (segment) {
                        segment.point.x = body.position.x
                        segment.point.y = body.position.y
                    }
                }
            })

            if (this.options.smooth && this.imgBlob.paperPath) {
                this.imgBlob.paperPath.smooth()
            }
            
            requestAnimationFrame(this.renderLoop)
        }
    }
})
</script>


<style lang="scss" scoped>

    @import '../assets/scss/variables.scss';
    .ball {
        width: 32px;
        height: 32px;
        left: calc(50% - 16px);
        border-radius: 100%;
        display: block;
        background-color: #fff;
        position: absolute;
    }
    .scroll-container {
        overflow: hidden;
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
