<template>

    <div class="options-overview">
        <header class="title">
            <h1>Catterpillar - Moving Attempt 3</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ref="matterContainer" ratio="1x1">
                <div class="scroll-container">
                    <div class="render-canvas" ref="renderCanvas" :style="[{opacity: options.showMatterJS ? 1 : 0}]" />
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
                        <input type="number" id="size" v-model="options.bodyPart.size" step="1" min="4" max="100">
                    </div>
                    
                    <div class="option">
                        <label for="bodyPart.stiffness">
                            Bodypart stiffness
                        </label>
                        <input type="number" id="bodyPart.stiffness" v-model="options.bodyPart.stiffness" step="0.01" min="0" max="1">
                    </div>
                    
                    <div class="option">
                        <label for="bodyStiffness">
                            Body stiffness
                        </label>
                        <input type="number" id="bodyStiffness" v-model="options.stiffness" step="0.01" min="0" max="1">
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
import { CatterpillarOptions, CatterpillarBodyPartOptions } from "./../services/catterpillar"

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
                // points: [] as Array<paper.Point>
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
                size: 8,
                length: 12,
                stiffness: .8,
                restitution: 0.8,
                showMatterJS: true,
                showPaperJS: false,
                bodyPart: {
                    size: 12,
                    stiffness: .2,
                    restitution: 0.8,
                } as CatterpillarBodyPartOptions
            } as any,
            originalOptions: {
                maxVelocity: 3,
                length: 12,
                size: 8,
                stiffness: .8,
                restitution: 0.8,
                showMatterJS: true,
                showPaperJS: false,
                bodyPart: {
                    stiffness: .2,
                    size: 12,
                    restitution: 0.8,
                } as CatterpillarBodyPartOptions
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
        "options.bodyPart.size": {
            handler() {
                this.generateCatterpillar()
            }
        },
        "options.length": {
            handler() {
                this.generateCatterpillar()
            }
        },
        "options.bodyPart.stiffness": {
            handler() {
                if (!this.mWorld || !this.catterPillar.composite) {
                    return
                }
                _.each(this.catterPillar.composite.constraints, constraint => {
                    if (this.mWorld && this.options.bodyPart.stiffness) {
                        constraint.stiffness = this.options.bodyPart.stiffness
                    }
                })
                
            }
        },
        "options.stiffness": {
            handler() {
                if (!this.catterPillar.constraint || !this.options.stiffness) {
                    return
                }
                this.catterPillar.constraint.stiffness = this.options.stiffness
                
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
        this.stats = null
        
        window.removeEventListener("resize", this.resetView)
        window.removeEventListener("keydown", this.keyPressEvent)
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
                    this.catterPillar.isMoving = false
                    return false
                }
                return Matter.Collision.collides(body, this.ground)
            }))
            
            if (!collision) {
                
                return
            }

            
            if (direction === "left") {
                this.catterPillar.isMoving = true
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
            const newLength = (this.options.length * this.options.bodyPart.size)*.8

            if (!this.mWorld || !this.ground) {
                return
            }
                
            // Fix head to ground
            const firstBodyConstaint = Matter.Constraint.create({
                bodyA: firstBody,
                pointA: { x: 0, y: this.options.bodyPart.size/2 },
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
                pointA: { x: 0, y: this.options.bodyPart.size/2 },
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
                            length: (this.options.bodyPart.size*1.5) * this.options.length,
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
                this.catterPillar.isMoving = false
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
            return new Paper.Path.Circle(new Paper.Point(x,y), this.options.bodyPart.size) 
        },
        generateCatterpillar() {
            const el = this.$el.querySelector(".scroll-container")

            if (!el || !this.mWorld) {
                return
            }

            if (this.catterPillar.composite) {
                this.removeCatterpillar()
            }

            const options = {
                length:         this.options.length,
                maxVelocity:    this.options.maxVelocity,
                stiffness:      this.options.stiffness, 
                restitution:    this.options.restitution,
                // damping: this.options.damping, 
                bodyPart: {
                    size:       this.options.bodyPart.size,
                    stiffness:  this.options.bodyPart.stiffness,
                    damping:    this.options.bodyPart.damping,
                    restitution:this.options.bodyPart.restitution,
                }
            } as CatterpillarOptions
            const res = this._createCatterpillar(el.clientWidth/2, 0, options)

            this.catterPillar.composite = res.composite
            this.catterPillar.constraint = res.constraint

            Matter.Composite.add(this.mWorld, [
                this.catterPillar.constraint,
                this.catterPillar.composite
            ])
            
            // Center catterpillar
            _.each(this.catterPillar.composite.bodies, (body,i) => {
                body.isStatic = true
                const x =  body.position.x + (el.clientWidth) / 2 - (this.options.length*this.options.bodyPart.size*2)/2
                const y =  0.05 + (Math.abs(i - this.options.length/2) + (Math.abs(i - this.options.length/2)) / 2) * .001
                Matter.Body.setPosition(body, {x, y})
                body.isStatic = false
            })
                
            // Update paperJS paths
            for (let i=0; i < this.options.length; i++) {
                const newPath = this.generatePaperJSCircle(0,0)
                newPath.fillColor = new Paper.Color({
                    gradient: {
                        stops: ["#58f208", "#000"]
                    },
                    origin: new Paper.Point(0,0),
                    destination: new Paper.Point(0,this.options.bodyPart.size)
                })
                this.paperJS.paths.push(newPath)
            }
        },
        _createCatterpillar(x:number,y:number, options: CatterpillarOptions) {
            const defaultOptions = {
                length:         8,
                maxVelocity:    3,
                stiffness:      .2, 
                restitution:    .8,
                // damping: 8 
                bodyPart: {
                    size:       8,
                    stiffness:  .8,
                    damping:    .2,
                    restitution:.8,
                }
            } as CatterpillarOptions

            if (!options) {
                options = _.clone(defaultOptions)
            }

            _.forOwn(defaultOptions, (value: number, key) => {
                if (!options[key]) {
                    options[key] = value
                }
            })

            // All options set, now call the helper functions to create the catterpillar
            const composite = this._createBodyParts(options)
            const constraint = this._createBodyConstraint(composite, options)
            
            return { composite, constraint }
        },
        _createBodyParts(options: CatterpillarOptions) {
            const group = Matter.Body.nextGroup(true)

            const bodyParts = Matter.Composites.stack(0, 32, options.length, 1, options.bodyPart.size, 0, (x:number, y:number) => {
                return Matter.Bodies.rectangle(x, y, options.bodyPart.size, options.bodyPart.size * .5, { 
                    collisionFilter: { group: group }, 
                    restitution: options.restitution,
                    label: "partBody"
                })
            })
            // Matter
            const composite = Matter.Composite.create({
                bodies: bodyParts.bodies,
                label:"catterpillar",
            })
            // Matter.Composite.add(composite, bodyParts)

            let prev = null as null | Matter.Body
            _.each(composite.bodies, bodyPart => {
                if (prev) {
                    Matter.Composite.add(composite, [
                        Matter.Constraint.create({
                            bodyA: bodyPart,
                            bodyB: prev,
                            pointA: {x: -options.bodyPart.size*.5, y:0},
                            pointB: {x: options.bodyPart.size*.5, y:0},
                            length: 0,
                            // length: options.bodyPart.size*.5,
                            stiffness: options.bodyPart.stiffness,
                            label: "bodyPartConnection",
                            render: {
                                strokeStyle: "#444",
                                type:"line",
                            }
                        }),
                    ])
                }
                
                prev = bodyPart
            })

            composite.label = "catterpillar"
            return composite
        },
        _createBodyConstraint: (catterpillarBody: Matter.Composite, options: CatterpillarOptions) => {
            const head = catterpillarBody.bodies[0]
            const butt = catterpillarBody.bodies[catterpillarBody.bodies.length-1]
            return Matter.Constraint.create({
                bodyA: head,
                bodyB: butt,
                length: (options.bodyPart.size*1.5) * options.length,
                stiffness: options.bodyPart.stiffness,
                damping: options.bodyDamping,
                label: "catterpillarConstraint",
                render: {
                    visible: true,
                    strokeStyle: "#4f0944",
                    type: "spring",
                }
            })
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
            const head = catterpillar.bodies[0]
            const butt = catterpillar.bodies[catterpillar.bodies.length -1]

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
            
            // Update PaperJS
            _.each(catterpillar.bodies, (body, i) => {
                const path = this.paperJS.paths[i]
                if (!path) {
                    return
                }
                // path.rotation = body.angle
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
