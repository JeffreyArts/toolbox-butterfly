<template>

    <div class="options-overview">
        <header class="title">
            <h1>Catterpillar - Moving Attempt 2</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ref="matterContainer" ratio="1x1">
                <div class="scroll-container">
                    <div class="render-canvas" ref="renderCanvas" :style="{opacity: options.showMatterJS ? 1 : 0}" />
                    <canvas id="paperCanvas" :style="[{opacity: options.showPaperJS ? 1 : 0}]"></canvas>
                </div>
            </div>

            <span class="footnote">Press left arrow for movement</span>
        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="General">
                    <div class="option">
                        <span>
                            <input type="checkbox" id="displayMatterJS" v-model="options.showMatterJS">
                            <label for="displayMatterJS">
                                Show Matter JS
                            </label>
                        </span>
                        <span>
                            <input type="checkbox" id="displayPaperJS" v-model="options.showPaperJS">
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
                        <label for="bodyPartStiffness">
                            Bodypart stiffness
                        </label>
                        <input type="number" id="bodyPartStiffness" v-model="options.bodyPartStiffness" step="0.01" min="0" max="1">
                    </div>
                    
                    <div class="option">
                        <label for="bodyStiffness">
                            Body stiffness
                        </label>
                        <input type="number" id="bodyStiffness" v-model="options.bodyStiffness" step="0.01" min="0" max="1">
                    </div>
                    <div class="option">
                        <label for="maxVelocity">
                            Max velocity
                        </label>
                        <input type="number" id="maxVelocity" v-model="options.maxVelocity" step="0.05" min="0" max="10">
                    </div>
                    <div class="option">
                        <label for="restitution">
                            Restitution
                        </label>
                        <input type="number" id="restitution" v-model="options.restitution" step="0.05" min="0" max="1.2">
                    </div>
                    <span>
                        <button class="button __is" @click="resetOptions">
                            Reset options
                        </button>
                    </span>
                    <br>
                    <br>
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
import gsap from "gsap"

export default defineComponent ({ 
    props: [],
    data() {
        return {
            mWorld: null as null | Matter.Composite,
            mEngine: null as null | Matter.Engine,
            mRunner: null as null | Matter.Runner,
            mObject: [] as Array<Matter.Body>,
            stats: null as null | Stats,   
            ground: null as null | Matter.Body, 
            paperJS: {
                paths: [] as Array<paper.Path>,
            },
            catterPillar: {
                isMoving: false,
                constraint: null as null | Matter.Constraint,
                composite: null as null | Matter.Composite,
            },
            ignoreOptionsUpdate: false,
            options: {
                maxVelocity: 3,
                length: 12,
                bodyStiffness: .8,
                bodyPartStiffness: .2,
                size: 12,
                restitution: 0.8,
                showMatterJS: true,
                showPaperJS: false,
            } as any,
            originalOptions: {
                maxVelocity: 3,
                length: 12,
                bodyStiffness: .8,
                bodyPartStiffness: .2,
                size: 12,
                restitution: 0.8,
                showMatterJS: true,
                showPaperJS: false,
            } as any
        }
    },
    watch: {
        "options": {
            handler(){
                if (this.ignoreOptionsUpdate) {
                    return
                }
                
                let newOptions = {} as any
                const localStorageOptions = localStorage.getItem("options")
                if (localStorageOptions) {
                    newOptions = _.cloneDeep(JSON.parse(localStorageOptions))
                }
                _.forOwn(this.options, (value, key) => {
                    if (_.isObject(value)) {
                        if (!_.isObject(newOptions[key])) {
                            newOptions[key] = {}
                        }
                        _.forOwn(value, (v, k) => {
                            newOptions[key][k] = v
                        })
                    } else {
                        newOptions[key] = value
                    }
                })
                localStorage.setItem("options", JSON.stringify(newOptions))
            },
            deep: true
        },
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
        "options.bodyPartStiffness": {
            handler() {
                if (!this.mWorld || !this.catterPillar.composite) {
                    return
                }
                _.each(this.catterPillar.composite.constraints, constraint => {
                    if (this.mWorld) {
                        constraint.stiffness = this.options.bodyPartStiffness
                    }
                })
                
            }
        },
        "options.bodyStiffness": {
            handler() {
                if (!this.catterPillar.constraint) {
                    return
                }
                this.catterPillar.constraint.stiffness = this.options.bodyStiffness
                
            }
        }
    },
    mounted() {
        const el = this.$el.querySelector(".scroll-container")
        this.displayFPS(el)
        this.loadOptions()
        this.initView()

        window.addEventListener("keydown", this.keyPressEvent)
        window.addEventListener("resize", this.resetView)
    },
    unmounted() {
        this.removeMatter()
        this.removePaperJS()
        window.removeEventListener("keydown", this.keyPressEvent)
        window.removeEventListener("resize", this.resetView)
        this.stats = null
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

        keyPressEvent(e: KeyboardEvent) {
            if (!this.mEngine || this.catterPillar.isMoving) {
                return
            }

            if (!this.catterPillar.composite) {
                console.warn("Missing catterpillar object")
                return
            }

            let direction = ""
            if (e.key === "ArrowLeft" || e.key.toUpperCase() === "A") {
                direction = "left"
            } else if (e.key === "ArrowRight" || e.key.toUpperCase() === "D") {
                direction = "right"
            }


            // Check if the catterpillar collides with the ground, and exit when it does not
            const collision = _.some(_.map(this.catterPillar.composite.bodies, body => {
                if (!this.ground) {
                    return false
                }
                return Matter.Collision.collides(body, this.ground)
            }))
            
            if (!collision) {
                return
            }

            this.catterPillar.isMoving = true
            
            if (direction === "left") {
                this.catterPillarMoveLeft(this.catterPillar.composite.bodies)

            } else if (direction === "right") {
                console.log("should go right")
                this.catterPillar.isMoving = false
            }
        },

        loadOptions() {
            this.ignoreOptionsUpdate = true
            const optionsString = localStorage.getItem("options")
            if (optionsString) {
                const localOptions = JSON.parse(optionsString)
                _.forOwn(this.options, (value,key) => {
                    if (localOptions[key]) {
                        this.options[key] = localOptions[key]
                    }
                })
            }
            setTimeout(() => {
                this.ignoreOptionsUpdate = false
            })
        },
        resetOptions() {
            this.options = JSON.parse(JSON.stringify(this.originalOptions))
        },
        
        createGround() {
            const el = this.$refs["matterContainer"] as HTMLElement
            if (!el) {
                throw new Error("matterContainer ref can not be found")
            }
            if (!this.mWorld) {
                throw new Error("mWorld can't be null")
            }

            this.ground = Matter.Bodies.rectangle(el.clientWidth/2, el.clientHeight-16, el.clientWidth, 16, {
                isStatic: true,
                label: "ground",
                friction: 1,
                collisionFilter: {
                    category: 2,
                    mask: 1
                }
            })
            
            // add all of the bodies to the world
            Matter.Composite.add(this.mWorld, [this.ground])
        },
        catterPillarMoveLeft(bodies: Array<Matter.Body>) {
            if (!bodies) {
                throw new Error("Provide bodies")
            }
            const firstBody = bodies[0]
            const lastBody = bodies[bodies.length-1]
            const duration = .6
            const newLength = (this.options.length * this.options.size)*.8

            if (!this.mWorld || !this.ground) {
                return
            }
                
            // Fix head to ground
            const firstBodyConstaint = Matter.Constraint.create({
                bodyA: firstBody,
                pointA: { x: 0, y: this.options.size/2 },
                pointB: { x: firstBody.position.x - this.ground.bounds.max.x/2, y: -8 },
                bodyB: this.ground,
                length: 0.5,
                stiffness: .8,
                label: "bodyPartConnection",
                render: {
                    strokeStyle: "#9f0",
                    type:"line",
                }
            })
                
            // Fix butt to ground
            const lastBodyConstaint = Matter.Constraint.create({
                bodyA: lastBody,
                pointA: { x: 0, y: this.options.size/2 },
                pointB: { x: lastBody.position.x - this.ground.bounds.max.x/2, y: -8 },
                bodyB: this.ground,
                length: 1,
                stiffness: .8,
                label: "bodyPartConnection",
                render: {
                    strokeStyle: "#9f0",
                    type:"line",
                }
            })

            Matter.Composite.add(this.mWorld, [firstBodyConstaint, lastBodyConstaint])

            if (this.catterPillar.constraint) {
                // Slide butt forward ( to the left )
                gsap.to(lastBodyConstaint.pointB, {
                    x: (lastBody.position.x - this.ground.bounds.max.x/2) - newLength/2 ,
                    onComplete:() => {
                        if (!this.mWorld) {
                            return
                        }
                        Matter.Composite.remove(this.mWorld,firstBodyConstaint)
                    },
                    // ease: "power2.out",
                    ease: "back.out",
                    duration: duration*.777,
                })

                // Animate body
                gsap.to(this.catterPillar.constraint, {
                    length: newLength,
                    onUpdate:() => {
                        if (!this.mEngine) {
                            return
                        }
                    },
                    ease: "back.out",
                    duration: duration/2,
                    onComplete:() => {
                        if (!this.catterPillar.composite) {
                            return
                        }
                        gsap.to(this.catterPillar.constraint, {
                            length: (this.options.size*1.5) * this.options.length,
                            onUpdate:() => {
                                if (!this.mEngine) {
                                    return
                                }
                            },
                            onComplete: () => {
                                setTimeout(() => {
                                    if (this.mWorld) {
                                        Matter.Composite.remove(this.mWorld,lastBodyConstaint)
                                    }
                                }, 320)
                                this.catterPillar.isMoving = false
                            },
                            ease: "power2.in",
                            duration: duration/2
                        })
                    }
                })
            }
                
            // Make body curl
            const centerIndex = Math.floor(bodies.length/2)
            const maxVelocity  = this.options.maxVelocity
                
            _.each(bodies, (body,index) => {
                if (index != 0 && index !=bodies.length-1) {
                    const velocity = centerIndex === index ? maxVelocity : maxVelocity - maxVelocity / index
                    Matter.Body.setVelocity( body, {
                        x: 0,
                        y: -velocity * (centerIndex - Math.abs(index - centerIndex))/2,
                    })
                } else {
                    body.mass = 1000
                    body.friction = 1
                    Matter.Body.setVelocity( body, {
                        x: 0,
                        y: 10
                    })
                }
            })
        },
        removeCatterpillar() {
            if (!this.mWorld) {
                return
            }

            // Remove existing catterpillar
            if (this.catterPillar.composite) {
                Matter.Composite.remove(this.mWorld, this.catterPillar.composite)
                this.catterPillar.composite = null
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
            
            // Remove paperJS properties
            if (this.paperJS.paths.length > 0) {
                for (let i=0; i < this.paperJS.paths.length; i++) {
                    this.paperJS.paths[i].remove()
                }
                this.paperJS.paths.length = 0
            }
        },
        generatePaperJSCircle(x: number, y: number) {
            return new Paper.Path.Circle(new Paper.Point(x,y), this.options.size) 
        },
        generateCatterpillar() {
            const el = this.$el.querySelector(".scroll-container")

            if (!el || !this.mWorld) {
                return
            }
            if (this.catterPillar.composite) {
                this.removeCatterpillar()
            }
            
            this.catterPillar.isMoving = false
            
            const center = {x: el.clientWidth/2, y: el.clientHeight/2}
            const size = this.options.size

            for (let i=0; i < this.options.length; i++) {
                const newPath = this.generatePaperJSCircle(0,0)
                newPath.fillColor = new Paper.Color("#58f208")
                this.paperJS.paths.push(newPath)
            }
            
            const group = Matter.Body.nextGroup(true)

            // Helper function for generating catterpillar bodies
            const catterPillarBodies = Matter.Composites.stack(center.x - (this.options.length*this.options.size*2) / 2, 32, this.options.length, 1, this.options.size, 0, (x:number, y:number) => {
                return Matter.Bodies.rectangle(x, y, this.options.size*2, this.options.size, { 
                    collisionFilter: { group: group }, 
                    restitution: this.options.restitution,
                    label: "bodyPart"
                })
            })

            // Create catterpillar
            this.catterPillar.composite = Matter.Composites.chain(catterPillarBodies, this.options.size/100, 0, -this.options.size/100, 0, { 
                stiffness: this.options.bodyPartStiffness, 
                length: 0, 
                label:"catterpillar" 
            })
            
            // Set 1 constraint from head to bud
            this.catterPillar.constraint = Matter.Constraint.create({
                bodyA: this.catterPillar.composite.bodies[0],
                bodyB: this.catterPillar.composite.bodies[this.catterPillar.composite.bodies.length-1],
                length: (size*1.5) * this.options.length,
                stiffness: this.options.bodyStiffness,
                damping: .2,
                label: "catterpillarConstraint",
                render: {
                    visible: true,
                    strokeStyle: "#4f0944",
                    type:"spring",
                }
            })

            Matter.Composite.add(this.mWorld, [
                this.catterPillar.constraint,
                this.catterPillar.composite
            ])
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
            // Exit renderLoop component has been unmounted
            if (!this.mWorld) {
                return
            }
            
            const el = this.$refs.renderCanvas as HTMLElement
            const catterpillar = this.catterPillar.composite

            if (!el || !catterpillar) {
                requestAnimationFrame(this.renderLoop)
                return
            }

            // Reset catterpillar when it is off screen
            const firstBody = catterpillar.bodies[0]
            const lastBody = catterpillar.bodies[catterpillar.bodies.length -1]

            if ((firstBody.position.x > el.clientWidth && lastBody.position.x > el.clientWidth) ||
            (firstBody.position.x <= 0 && lastBody.position.x < 0) ||
            (firstBody.position.y > el.clientHeight + 100 && lastBody.position.y > el.clientHeight + 100)
            ) {
                this.removeCatterpillar()
                
                // Don't create new catterpillar immediately for UX reasons
                setTimeout(() => {
                    this.generateCatterpillar()
                }, 480)
            } 
            
            // Update PaperJS
            _.each(catterpillar.bodies, (body, i) => {
                const path = this.paperJS.paths[i]
                if (!path) {
                    return
                }
                path.position.x = body.position.x
                path.position.y = body.position.y                    
            })

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
