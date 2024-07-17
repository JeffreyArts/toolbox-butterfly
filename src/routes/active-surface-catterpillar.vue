<template>

    <div class="active-surface-container">
        <header class="title">
            <h1>Active surface with Catterpillar</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ref="matterContainer" >
                <div class="scroll-container" ref="scrollContainer">
                    <div 
                        class="block"
                        b-solid="true"
                        :class="[k%2 == 1 ? '__isLeft' : '__isRight',
                        activeBlock == k ? '__isActive' : ''
                    ]"
                        v-for="(number,k) in amountOfBlocks" :key="k">
                        <span class="block-index">
                            {{ number }}
                        </span>
                    </div>
                </div>
                    
                <div id="matterCanvas" class="render-canvas" ref="renderCanvas" :style="[{opacity: showMatterJS ? 1 : 0}]" />
                <canvas id="paperCanvas" :style="[{opacity: showPaperJS ? 1 : 0}]"></canvas>
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="Options">

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
                    </div>
                    <div class="option">
                        <label for="inputNumber">
                            # Blocks
                        </label>
                        <input type="number" id="inputNumber" v-model="amountOfBlocks" step="1" min="1" max="50">
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>


<script lang="ts">
import { defineComponent } from "vue"
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
            amountOfBlocks: 4,
            activeBlock: 0,
            blocks: [] as Array<{
                el: HTMLElement,
                body: Matter.Body
            }>,
            mWorld: null as null | Matter.Composite,
            mEngine: null as null | Matter.Engine,
            mRunner: null as null | Matter.Runner,
            mObject: [] as Array<Matter.Body>,
            stats: null as null | Stats,    
            scrollY: 0,
            catterPillar: {
                reset: false,
                paths: [] as Array<paper.Path>,
                points: [] as Array<paper.Point>
            },
            scrollDown: true,
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
        "amountOfBlocks": {
            handler() {
                this.updateBlocks()
            },
            immediate: true
        },
    },
    mounted() {
        const elScrollContainer = this.$refs["scrollContainer"] as HTMLElement
        if (elScrollContainer)  {
            elScrollContainer.addEventListener("scroll", this.onScroll)
            this.displayFPS(elScrollContainer)
        }
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

        updateBlocks() {
            const elScrollContainer = this.$refs["scrollContainer"] as HTMLElement
            if (!this.mWorld || !elScrollContainer) {
                return
            }

            const blocks = _.filter(this.mWorld.bodies, (body) => {
                
                if (body?.label === "block" && this.mWorld) {
                    Matter.Composite.remove(this.mWorld, body)
                }
            })
            

            const blockElements = this.$el.querySelectorAll(".block.__isActive")
            const newBlocks = [] as Array<Matter.Body>

            
            _.each(blockElements, blockEl => {
                const x = blockEl.offsetLeft + blockEl.clientWidth/2
                const height = 200
                const y = blockEl.clientHeight + blockEl.offsetTop - elScrollContainer.scrollTop + height/2
                const body = Matter.Bodies.rectangle(x, y, blockEl.clientWidth, 200, {isStatic: true, label: "block"})
                this.blocks.push({
                    el: blockEl,
                    body
                }) 

                
                if (y > blockEl.offsetTop - elScrollContainer.scrollTop && this.scrollDown && this.mWorld) {
                    Matter.Composite.add(this.mWorld, body)
                }
            })
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
                })
                Matter.Composite.add(catterpillar, bodyPart)

                this.catterPillar.points.push(point)
                this.catterPillar.paths.push(this.generatePaperJSCircle(point))
                this.catterPillar.paths[this.catterPillar.paths.length-1].fillColor = new Paper.Color("#e6007e")

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
                            label: "bodyPartConnection"
                        }),
                    ])
                }

                prev = bodyPart
            }


            Matter.Composite.add(this.mWorld, catterpillar)
        },
        onScroll(e:Event) {
            const container = e.currentTarget as HTMLElement
            const paperCanvas = this.$el.querySelector("#paperCanvas")
            const matterCanvas = this.$el.querySelector("#matterCanvas")
            if (!container) {
                return
            }
            this.updateBlocks()
            if (this.scrollY > container.scrollTop) {
                this.scrollDown = false
            } else {
                this.scrollDown = true
            }
            
            this.scrollY = container.scrollTop
            
            this.setActiveBlock()
            
        },
        setActiveBlock() {
            const offset = 120
            const elScrollContainer = this.$refs["scrollContainer"] as HTMLElement

            const blocks = elScrollContainer.querySelectorAll("[b-solid]") 
            const treshold = elScrollContainer.scrollTop + offset

            blocks.forEach((block,index) => {
                const el = block as HTMLElement

                // if (el.offsetHeight < treshold) {
                if (el.offsetTop < treshold) {
                    this.activeBlock = index
                }
            })
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
            const el = this.$el.querySelector(".scroll-container")

            if (!this.mWorld || !el) {
                return
            }
            
            const catterpillars = _.filter(this.mWorld.composites, (composite) => {
                return composite?.label === "catterpillar"
            })
            
            if (catterpillars[0]) {
                const catterpillar = catterpillars[0]
                if (catterpillar.bodies[0].position.x > el.clientWidth ||
                    catterpillar.bodies[catterpillar.bodies.length - 1].position.x < 0 ||
                    catterpillar.bodies[0].position.y > el.clientHeight + 20
                ) {
                    this.catterPillar.reset = true
                    this.removeCatterpillar()
                    // return
                    setTimeout(() => {
                        this.catterPillar.reset = false
                        this.generateCatterpillar()
                        this.updateBlocks()
                    }, 800)
                } else {   
                    _.each(catterpillar.bodies, (body, i) => {
                        const path = this.catterPillar.paths[i]
                        path.position.x = body.position.x
                        path.position.y = body.position.y                    
                    })
                }
            }

            requestAnimationFrame(this.renderLoop)
        }
    }
})
</script>


<style lang="scss" scoped>

    @import './../assets/scss/variables.scss';


    .scroll-container {
        padding-top: 120px;
        padding-bottom: 120px;
        
        .block {
            color: $accentColor;
            font-size: 16vw;
            background-color: transparent;
            border-bottom: 2px solid currentColor;
        }
    }

    #matterCanvas {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
        pointer-events: none;
    }

    #paperCanvas {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
        pointer-events: none;
    }

</style>
