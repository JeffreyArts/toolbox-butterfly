<template>

    <div class="options-overview">
        <header class="title">
            <h1>Paper-JS - Blob smooth</h1>
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
                        <input type="number" id="size" v-model="options.size" step="1" min="20" max="100">
                    </div>
                    
                    <div class="option">
                        <label for="stiffness">
                            Stiffness
                        </label>
                        <input type="number" id="stiffness" v-model="options.stiffness" step="0.001" min="0" max="1">
                    </div>
                    <div class="option">
                        <label for="damping">
                            Damping
                        </label>
                        <input type="number" id="damping" v-model="options.damping" step="0.05" min="0" max="1">
                    </div>
                </div>



            </div>
        </aside>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import Matter from "matter-js"
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
        this.initMatterJS()
        this.initPaperJS()
        const el = this.$el.querySelector(".scroll-container")
        this.displayFPS(el)
        this.generateBlob()

        this.addMousePointer()
    },
    unmounted() {
        this.removeMatter()
        this.stats = null
        const el = this.$refs["matterContainer"] as HTMLElement
        if (!el) {
            return
        }
        el.removeEventListener("mousemove",this.mouseMoveEvent)
    },
    methods: {
        removeMatter() {
            this.mWorld = null
            
            if (this.mRunner) {
                Matter.Runner.stop(this.mRunner)
            }

            if (this.mEngine) {
                Matter.Engine.clear(this.mEngine)
            }
        },
        addMousePointer() {
            const el = this.$refs["matterContainer"] as HTMLElement
            if (!el) {
                return
            }

            if (!this.mWorld) {
                console.error("First initialise Matter World")
                return
            }
            
            // const ground = 

            // add all of the bodies to the world
            // Matter.Composite.add(this.mWorld, Matter.Bodies.circle(el.clientWidth, el.clientHeight, el.clientHeight/16, { isStatic: false, label: "mousePointer" }))

            el.addEventListener("mousemove",this.mouseMoveEvent)
        },
        mouseMoveEvent(e: MouseEvent) {
            const pointer = this.mWorld?.bodies.find(body => body.label == "mousePointer")
            
            if (this.mEngine) {
                this.mEngine.gravity.x = (e.layerX / e.currentTarget.clientWidth) * 2 - 1
                this.mEngine.gravity.y = (e.layerY / e.currentTarget.clientHeight) * 2 - 1
            }
            
        },
        initPaperJS() {
            const canvas = this.$el.querySelector("#paperCanvas")
            const el = this.$el.querySelector(".scroll-container")
            
            if (!canvas) {
                console.error("Can't find canvas")
                return
            }

            canvas.width = el.clientWidth
            canvas.height = el.clientHeight
            Paper.setup(canvas)
        },
        initMatterJS() {
            const el = this.$refs["matterContainer"] as HTMLElement
            const canvasEl = this.$refs["renderCanvas"] as HTMLCanvasElement
            if (!el) {
                throw new Error("matterContainer ref can not be found")
            }
            if (!canvasEl) {
                throw new Error("renderCanvas ref can not be found")
            }

            // create an engine
            const engine = Matter.Engine.create({
                gravity: {
                    x: 0,
                    y: 0
                }
            })

            // create runner
            const render = Matter.Render.create({
                element: canvasEl,
                engine: engine,
                options: {
                    width: canvasEl.clientWidth,
                    height: canvasEl.clientHeight,
                }
            })

            const runner = Matter.Runner.create()
            const ground = Matter.Bodies.rectangle(el.clientWidth/2, el.clientHeight-16, el.clientWidth, 16, { isStatic: true, label: "ground" })

            // add all of the bodies to the world
            Matter.Composite.add(engine.world, [ground])
            
            this.mWorld = engine.world
            this.mRunner = runner
            this.mEngine = engine
            Matter.Render.run(render)

            // run the engine
            Matter.Runner.run(this.mRunner, this.mEngine)
            this.renderLoop()
        },
        removeBlob() {
            if (!this.mWorld) {
                return
            }
            // Remove existing blob
            this.imgBlob.points = []
            const bodies = _.clone(this.mWorld.bodies)
            _.each(bodies, body => {
                if (body.label !== "ground" && this.mWorld) {
                    Matter.Composite.remove(this.mWorld, body)
                }
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
        generateBlob() {
            const offset = 40
            const el = this.$el.querySelector(".scroll-container")
            if (!el || !this.mWorld) {
                return
            }
            this.removeBlob()

            const center = {x: el.clientWidth/2, y: el.clientHeight/2}
            

            const staticRadius = Math.min(el.clientHeight/2, el.clientWidth/2) - offset
            let radius = Math.min(el.clientHeight/2, el.clientWidth/2) - offset
            let prev = null
            let first = null

            const centerCircle = Matter.Bodies.circle( center.x, center.y, this.options.size, {
                label: "centerPoint",
                isStatic: true
            })

            for (let i=0; i < this.options.points; i++) {
                const angle = 360/this.options.points
                radius = i === 0 ? radius + Math.random() * .7  : radius + Math.random() * .7 * 20 - 10
                
                if (i == 15) {
                    radius = (radius + this.imgBlob.points[0].x - el.clientWidth/2) / 2
                }

                const x = center.x + (radius * Math.cos(angle*i*Math.PI/180)) * this.options.size/100
                const y = center.y + (radius * Math.sin(angle*i*Math.PI/180)) * this.options.size/100
                
                const staticX = center.x + staticRadius * Math.cos(angle*i*Math.PI/180) * this.options.size/100
                const staticY= center.y + staticRadius * Math.sin(angle*i*Math.PI/180) * this.options.size/100

                // const skeletonCircle = Matter.Bodies.circle( staticX, staticY, 4, {
                //     label: "skeletonCircle",
                //     isStatic: true,
                // })
                // const skeletonConstraint = Matter.Constraint.create({
                //     bodyA: circle,
                //     bodyB: skeletonCircle,
                //     stiffness: .1,
                //     damping: this.options.damping
                // })


                const circle = Matter.Bodies.circle( x, y, 8, {
                    label: "blobCircle",
                    restitution: .8
                })

                
                Matter.Composite.add(this.mWorld, [circle, centerCircle])

                if (prev) {
                    Matter.Composite.add(this.mWorld, [
                        Matter.Constraint.create({
                            bodyA: circle,
                            bodyB: prev,
                            stiffness: this.options.stiffness,
                            damping: this.options.damping,
                            label: "blob"
                        }),
                        // Matter.Constraint.create({
                        //     bodyA: prev,
                        //     bodyB: circle,
                        //     stiffness: this.options.stiffness,
                        //     damping: this.options.damping,
                        //     label: "blob"
                        // }),
                    ])
                }

                Matter.Composite.add(this.mWorld, [
                    Matter.Constraint.create({
                        bodyA: circle,
                        bodyB: centerCircle,
                        stiffness: 0.0025,
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
                Matter.Composite.add(this.mWorld, 
                    [
                        Matter.Constraint.create({
                            bodyA: first,
                            bodyB: prev,
                            stiffness: this.options.stiffness,
                            damping: this.options.damping,
                            label: "blob"
                        }),
                        // Matter.Constraint.create({
                        //     bodyA: prev,
                        //     bodyB: first,
                        //     stiffness: this.options.stiffness,
                        //     damping: this.options.damping,
                        //     label: "blob"
                        // })
                    ]
                )
            }
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

            
            const circles = _.filter(this.mWorld.bodies, (body) => {
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
            // _.each(this.imgBlob.matterCircle, segment => {
            //     console.log(segment.point)
            // })
            // _.each(this.imgBlob.paperPath?.segments, segment => {
            //     console.log(segment.point)
            // })
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
