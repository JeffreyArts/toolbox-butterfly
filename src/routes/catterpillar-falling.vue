<template>

    <div class="options-overview">
        <header class="title">
            <h1>Catterpillar - Falling</h1>
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
                            <button class="button __is" for="displayMatterJS" @click="generateCatterpillar">
                                Regenerate Catterpillar
                            </button>
                        </span>
                    </div>
                </div>

                <div class="option-group" name="Options">
                   
                    <div class="option">
                        <label for="length">
                            Length
                        </label>
                        <input type="number" id="length" v-model="options.length" step="1" min="3" max="32">
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
                        <input type="number" id="stiffness" v-model="options.stiffness" step="0.01" min="0" max="1">
                    </div>
                    <div class="option">
                        <label for="damping">
                            Damping
                        </label>
                        <input type="number" id="damping" v-model="options.damping" step="0.05" min="0" max="1">
                    </div>
                    <div class="option">
                        <label for="restitution">
                            Restitution
                        </label>
                        <input type="number" id="restitution" v-model="options.restitution" step="0.05" min="0" max="1.2">
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
    
export default defineComponent ({ 
    props: [],
    data() {
        return {
            mWorld: null as null | Matter.Composite,
            mEngine: null as null | Matter.Engine,
            mRunner: null as null | Matter.Runner,
            mObject: [] as Array<Matter.Body>,
            stats: null as null | Stats,    
            catterPillar: {
                paths: [] as Array<paper.Path>,
                points: [] as Array<paper.Point>
            },
            showMatterJS: true,
            showPaperJS: true,
            options: {
                damping: 0,
                length: 8,
                stiffness: 0.2,
                size: 16,
                restitution: 0.8,
            }
        }
    },
    watch: {
        "options.size": {
            handler() {
                this.generateCatterpillar()
            }
        },
        "options.length": {
            handler() {
                this.generateCatterpillar()
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

        window.addEventListener("resize", this.resetView)
    },
    unmounted() {
        this.removeMatter()
        this.removePaperJS()
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
            this.removeMatter()
            this.removePaperJS()

            setTimeout(this.initView)
        },
        initView() {
            this.initMatterJS()
            this.initPaperJS()
            this.createGround()
            this.generateCatterpillar()
        },
        removeCatterpillar() {
            if (!this.mWorld) {
                return
            }
            // Remove existing blob
            const bodies = _.clone(this.mWorld.bodies)
            const composites = _.clone(this.mWorld.composites)
            _.each(bodies, body => {
                if (body.label !== "ground" && this.mWorld) {
                    Matter.Composite.remove(this.mWorld, body)
                }
            })
            
            _.each(composites, composite => {
                if (composite.label !== "ground" && this.mWorld) {
                    Matter.Composite.remove(this.mWorld, composite)
                }
            })
            const constraints = _.clone(this.mWorld.constraints)
            _.each(constraints, constraint => {
                if (this.mWorld) {
                    Matter.Composite.remove(this.mWorld, constraint)
                }
            })

            if (this.catterPillar) {
                this.catterPillar.points.length = 0

                for (let i=0; i < this.catterPillar.paths.length; i++) {
                    this.catterPillar.paths[i].remove()
                }
                this.catterPillar.paths.length = 0
            }
        },
        generatePaperJSCircle(center: paper.Point) {
            return new Paper.Path.Circle(center, this.options.size) 
        },
        generateCatterpillar() {
            //this.options.length
            const el = this.$el.querySelector(".scroll-container")

            if (!el || !this.mWorld) {
                return
            }
            this.removeCatterpillar()

            const center = {x: el.clientWidth/2, y: el.clientHeight/2}
            const size = this.options.size
            const startX = center.x - size * this.options.length/2
            const startY =  16
            const catterpillar = Matter.Composite.create({label:"catterpillar"})
            let prev = null as null | Matter.Body

            for (let i=0; i < this.options.length; i++) {
                // Create body part and add it to `catterpillar` variable & this.catterpillar
                const x = startX + i * size
                const y = startY - (Math.abs(i - this.options.length/2)) * 4 + (Math.abs(i - this.options.length/2)) / 2
                const radius = size / 2
                const point = new Paper.Point(x,y)

                const bodyPart = Matter.Bodies.circle(x, y, radius, {
                    label: "bodyPart",
                    frictionAir: 0.05 + (Math.abs(i - this.options.length/2) + (Math.abs(i - this.options.length/2)) / 2) * .001,
                    restitution: this.options.restitution,
                    density: 0.005,
                    mass: size,
                    friction: 0.01,
                })
                Matter.Composite.add(catterpillar, bodyPart)

                this.catterPillar.points.push(point)
                this.catterPillar.paths.push(this.generatePaperJSCircle(point))
                this.catterPillar.paths[this.catterPillar.paths.length-1].fillColor = new Paper.Color("#58f208")

                // Create constraint between body parts
                if (prev) {
                    Matter.Composite.add(this.mWorld, [
                        Matter.Constraint.create({
                            bodyA: bodyPart,
                            // pointB: { x: size/2, y: 0 },
                            // pointA: { x: size/2, y: 0 },
                            // damping: this.options.damping,
                            bodyB: prev,
                            length: size,
                            stiffness: this.options.stiffness,
                            label: "bodyPartConnection",
                            render: {
                                type: "line"
                            }
                        }),
                    ])
                }

                prev = bodyPart
            }


            Matter.Composite.add(this.mWorld, catterpillar)
        },
        createGround() {
            const el = this.$refs["matterContainer"] as HTMLElement
            if (!el) {
                throw new Error("matterContainer ref can not be found")
            }
            if (!this.mWorld) {
                throw new Error("mWorld can't be null")
            }

            const ground = Matter.Bodies.rectangle(el.clientWidth/2, el.clientHeight+160, el.clientWidth, 348, {
                isStatic: true,
                label: "ground",
                friction: 1,
                collisionFilter: {
                    // category: 2,create
                    // mask: 1
                }
            })
            
            // add all of the bodies to the world
            Matter.Composite.add(this.mWorld, [ground])
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


            
            const catterpillars = _.filter(this.mWorld.composites, (composite) => {
                return composite?.label === "catterpillar"
            })
            
            if (catterpillars[0]) {
                const catterpillar = catterpillars[0]
                _.each(catterpillar.bodies, (body, i) => {
                    const path = this.catterPillar.paths[i]
                    path.position.x = body.position.x
                    path.position.y = body.position.y                    
                })
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
