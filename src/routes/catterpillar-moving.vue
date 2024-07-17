<template>

    <div class="options-overview">
        <header class="title">
            <h1>Catterpillar - Moving Attempt 1</h1>
            
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ref="matterContainer" ratio="1x1">
                <div class="scroll-container">
                    <div class="render-canvas" ref="renderCanvas" :style="[{opacity: showMatterJS ? 1 : 0}]" />
                    <canvas id="paperCanvas" :style="[{opacity: showPaperJS ? 1 : 0}]"></canvas>
                </div>
            </div>
            <span class="footnote">Press left or right arrow for movement</span>
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
            catterPillar: {
                reset: false,
                constraint: null as null | Matter.Constraint,
                composite: null as null | Matter.Composite,
                paths: [] as Array<paper.Path>,
                points: [] as Array<paper.Point>
            },
            showMatterJS: true,
            showPaperJS: false,
            ignoreOptionsUpdate: true,
            options: {
                damping: 0,
                length: 12,
                stiffness: .2,
                size: 12,
                restitution: 0.8,
            } as any,
            originalOptions: {
                damping: 0,
                length: 12,
                stiffness: .2,
                size: 12,
                restitution: 0.8,
            } as any
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
        this.loadOptions()
        this.initView()

        this.initCatterpillarMovement()
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
            console.log("initPaperJS", el.clientWidth, el)
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
            this.generateCatterpillar()
            this.createGround()
        },

        keyPressEvent(e: KeyboardEvent) {
            if (!this.mEngine) {
                return
            }
            let direction = ""
            if (e.key === "ArrowLeft" || e.key.toUpperCase() === "A") {
                direction = "left"
            } else if (e.key === "ArrowRight" || e.key.toUpperCase() === "D") {
                direction = "right"
            }
            // Create collision events
            if (!this.catterPillar.composite) {
                console.warn("Missing catterpillar object")
                return
            }
            const collision = _.map(this.catterPillar.composite.bodies, body => {
                if (!this.ground) {
                    return false
                }
                return Matter.Collision.collides(body, this.ground)
            })
            
            if (direction === "left") {
                // this.catterPillar.composite.bodies[0].position.x -= 10
                const bodies = this.catterPillar.composite.bodies
                
                // const obj = _.clone(bodies[bodies.length-1].position)
                // gsap.to(obj, {
                //     x: obj.x - 50,
                //     onUpdate:() => {
                //         console.log(bodies)
                //         Matter.Body.setPosition(bodies[bodies.length-1], {
                //             x: obj.x,
                //             y: bodies[bodies.length-1].position.y
                //         })
                //         // bodies[bodies.length-1].setPosition({})
                //         // this.catterPillar.composite.bodies[0].position.y = obj.y
                //     },
                //     ease: "circ.out",
                //     duration: 1
                // })
                const obj = {
                    t: 0
                }
                if (!this.mWorld) {
                    return
                }
                // Matter.Composite.add(this.mWorld, [
                //     Matter.Constraint.create({
                //         bodyA: this.catterPillar.composite.bodies[this.catterPillar.composite.bodies.length-1],
                //         pointA: { x: 0, y: this.options.size/2 },
                //         pointB: { x: 0, y: -8 },
                //         // damping: this.options.damping,
                //         bodyB: this.ground,
                //         length: 1,
                //         stiffness: 1,
                //         // stiffness: this.options.stiffness,
                //         label: "bodyPartConnection",
                //         render: {
                //             // visible: false
                //             strokeStyle: "#f09",
                //             type:"line",
                //         }
                //     })])
                if (this.catterPillar.constraint) {
                    gsap.to(this.catterPillar.constraint, {
                        length: this.catterPillar.constraint.length/2,
                        onUpdate:() => {
                            if (!this.mEngine) {
                                return
                            }
                            
                            // bodies[bodies.length-1].setPosition({})
                            // this.catterPillar.composite.bodies[0].position.y = obj.y
                        },
                        ease: "power4.out",
                        duration: .5,
                        onComplete:() => {
                            if (!this.catterPillar.composite) {
                                return
                            }
                            gsap.to(this.catterPillar.constraint, {
                                length: this.options.size * (this.catterPillar.composite.bodies.length ),
                                onUpdate:() => {
                                    if (!this.mEngine) {
                                        return
                                    }
                                
                                // bodies[bodies.length-1].setPosition({})
                                // this.catterPillar.composite.bodies[0].position.y = obj.y
                                },
                                ease: "power4.in",
                                duration: .5
                            })
                        }
                    })
                }
                const centerIndex = Math.ceil(bodies.length/2)
                _.each(bodies, (body,index) => {
                    const maxVelocity = 16 / centerIndex
                    // console.log(maxVelocity / Math.abs(index-centerIndex*.99))
                    if (index != 0 && index !=bodies.length-1) {
                        Matter.Body.setVelocity( body, {
                            x: 0,
                            y: maxVelocity / Math.abs(index-centerIndex*.99) * -1
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
                
                // Matter.Body.setVelocity( bodies[centerIndex+1], {
                //     x: 0,
                //     y:-14
                // })
                // Matter.Body.setVelocity( bodies[centerIndex-1], {
                //     x: 0,
                //     y: -12
                // })
            } else if (direction === "right") {
                // const angle = 100 * (Math.PI/180)
                // // console.log(angle)
                // // Matter.Body.setAngle(this.catterPillar.composite.bodies[0], angle)
                // // Matter.Body.setAngularVelocity(this.catterPillar.composite.bodies[0], 200)
                // console.log(Matter.Body.getAngularVelocity(this.catterPillar.composite.bodies[0]))
                const bodies = this.catterPillar.composite.bodies
                // bodies[1].friction = 1
                // bodies[0].friction = 1
                // bodies[0].mass = 100
                // bodies[1].mass = 100
                const obj = {
                    t: 0
                }
                
                
                // setTimeout(()=> {
                //     Matter.Body.setVelocity(bodies[bodies.length-1], { x: 33, y: 0 })
                // }, 400)
                gsap.to(obj, {
                    t: 100,
                    onUpdate:() => {
                        if (!this.mEngine) {
                            return
                        }
                        const interval = (2 * Math.PI) / bodies.length *.2
                            
                        for (var i = 0; i < bodies.length; i++) {
                            var body = bodies[i]
                            const velocity = -Math.sin((obj.t * 0.05) + ((i) * interval )) 
                            let velocityX = 0
                            if (velocity < 0){
                                velocityX = 1.5
                            }
                            Matter.Body.setVelocity(body, { x: velocityX, y: velocity * 2 })
                            // Matter.Body.setVelocity(body, { x: -Math.cos((obj.t * 0.1) + (i*.1 )) * 2, y: -Math.sin((obj.t * 0.1) + (i*.8 )) * 2 })
                        }
                        
                        // bodies[bodies.length-1].setPosition({})
                        // this.catterPillar.composite.bodies[0].position.y = obj.y
                    },
                    ease: "linear",
                    duration: 2
                })
                // const bodies = this.catterPillar.composite.bodies
                // .setAngularVelocity(.x += 10)
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
        initCatterpillarMovement() {
            window.addEventListener("keydown", this.keyPressEvent)
            if (!this.mEngine) {
                return
            }
            // Matter.Events.on(this.mEngine, "collisionStart", (event) => {
            //     _.each(event.pairs, collision => {
            //         let ground = null
            //         let body = null
                    
            //         if (collision.bodyA.label === "ground") {
            //             ground = collision.bodyA
            //             body = collision.bodyB
            //         } else if (collision.bodyB.label === "ground") {
            //             ground = collision.bodyB
            //             body = collision.bodyA
            //         }
            //         if (body) {
            //             this.catterPillar.grounded = true 
            //             this.catterPillar.groundedTimeout = setTimeout(() => {
            //                 this.catterPillar.grounded = false
            //                 console.log("grounded reset", this.catterPillar.grounded)
                            
            //             }, 100)
            //             console.log("grounded", this.catterPillar.grounded)
            //         } else {
            //             clearTimeout(this.catterPillar.groundedTimeout)
            //         }
            //     })
            // }) 
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
                this.catterPillar.composite = null
            }
        },
        generatePaperJSCircle(center: paper.Point) {
            return new Paper.Path.Circle(center, this.options.size) 
        },
        generateCatterpillar() {
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
                // const radius = size / 2
                const radius = size / 2
                const point = new Paper.Point(x,y)
                let parts = []
                parts.push(Matter.Bodies.circle(x, y, radius, {
                    label: "bodyPartCircle",
                    // frictionAir: 0.05 + (Math.abs(i - this.options.length/2) + (Math.abs(i - this.options.length/2)) / 2) * .001,
                    // // frictionAir: 0.025,
                    // restitution: this.options.restitution,
                    // density: 5,
                    // mass: size,
                    // collisionFilter: {
                    //     category: 1,
                    //     mask: 2 | 1
                    // },
                    isStatic:true
                })) 
                if (i!=0) {
                    parts.push( Matter.Bodies.rectangle(x, y+size/4, size*.9, size/2, {
                        label: "bodyPartSquare",
                        isStatic:true
                        // // frictionAir: 0.025,
                        // density: 5,
                    }))
                }
                const bodyPart = Matter.Body.create({
                    parts: parts,
                    frictionAir: 0.05 + (Math.abs(i - this.options.length/2) + (Math.abs(i - this.options.length/2)) / 2) * .001,
                    restitution: this.options.restitution,
                    mass: size,
                    collisionFilter: {
                        category: 1,
                        mask: 2 | 1
                    },
                    label: "bodyPart",
                })
                Matter.Composite.add(catterpillar, bodyPart)
                // if ((i)%2 && i !=0) {
                //     const secondPrev = catterpillar.bodies[catterpillar.bodies.length-2]
                //     console.log("i",i,secondPrev)
                //     if (secondPrev) {
                //         Matter.Composite.add(this.mWorld, [
                //             Matter.Constraint.create({
                //                 bodyA: bodyPart,
                //                 // pointB: { x: size/2, y: 0 },
                //                 // pointA: { x: size/2, y: 0 },
                //                 // damping: this.options.damping,
                //                 bodyB: secondPrev,
                //                 length: size*1.8,
                //                 stiffness: .6,
                //                 label: "bodyPartConnection2"
                //             }),
                //         ])
                //     }
                // }
                this.catterPillar.points.push(point)
                this.catterPillar.paths.push(this.generatePaperJSCircle(point))
                this.catterPillar.paths[this.catterPillar.paths.length-1].fillColor = new Paper.Color("#58f208")
                // Create constraint between body parts
                if (prev) {
                    Matter.Composite.add(this.mWorld, [
                        Matter.Constraint.create({
                            bodyA: bodyPart,
                            // pointB: { x: 0, y: -size/2 },
                            // pointA: { x: 0, y: -size/2 },
                            // damping: this.options.damping,
                            bodyB: prev,
                            length: size,
                            // stiffness: 1,
                            stiffness: this.options.stiffness,
                            label: "bodyPartConnection",
                            render: {
                                // visible: false
                                strokeStyle: "#444",
                                type:"line",
                            }
                        }),
                        // Matter.Constraint.create({
                        //     bodyA: bodyPart,
                        //     pointB: { x: 0, y: size/2 },
                        //     pointA: { x: 0, y: size/2 },
                        //     // damping: this.options.damping,
                        //     bodyB: prev,
                        //     length: size,
                        //     // stiffness: 1,
                        //     stiffness: this.options.stiffness,
                        //     label: "bodyPartConnection",
                        //     render: {
                        //         // visible: false
                        //         strokeStyle: "#444",
                        //         type:"line",
                        //     }
                        // }),
                        // Matter.Constraint.create({
                        //     bodyA: bodyPart,
                        //     pointB: { x: 0, y: size/2 },
                        //     pointA: { x: 0, y: -size/2 },
                        //     // damping: this.options.damping,
                        //     bodyB: prev,
                        //     length: size,
                        //     // stiffness: 1,
                        //     stiffness: this.options.stiffness,
                        //     label: "bodyPartConnection",
                        //     render: {
                        //         // visible: false
                        //         strokeStyle: "#444",
                        //         type:"line",
                        //     }
                        // }),
                        // Matter.Constraint.create({
                        //     bodyA: bodyPart,
                        //     pointB: { x: 0, y: -size/2 },
                        //     pointA: { x: 0, y: size/2 },
                        //     // damping: this.options.damping,
                        //     bodyB: prev,
                        //     length: size,
                        //     // stiffness: 1,
                        //     stiffness: this.options.stiffness,
                        //     label: "bodyPartConnection",
                        //     render: {
                        //         // visible: false
                        //         strokeStyle: "#444",
                        //         type:"line",
                        //     }
                        // }),
                    ])
                }
                prev = bodyPart
            }
            this.catterPillar.constraint = Matter.Constraint.create({
                bodyA: catterpillar.bodies[0],
                bodyB: catterpillar.bodies[catterpillar.bodies.length-1],
                length: size * catterpillar.bodies.length ,
                stiffness: .1,
                damping: .8,
                label: "catterpillarConstraint"
            })
            Matter.Composite.add(this.mWorld, [this.catterPillar.constraint])
            this.catterPillar.composite = catterpillar
            Matter.Composite.add(this.mWorld, catterpillar)
            // Matter.Events.on(catterpillar, "eventNames", callback)
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
            if (!this.mWorld) {
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