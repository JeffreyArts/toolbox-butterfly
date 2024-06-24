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
                    @touchend="releaseCatterpiller"
                    @click="mouseClickEvent"
                    @mousemove="mouseMoveEvent"
                    @touchmove="mouseMoveEvent">
                    <div class="render-canvas" ref="renderCanvas" :style="[{opacity: pageOptions.showMatterJS ? 1 : 0}]" />
                    <canvas id="paperCanvas"></canvas>
                </div>
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="Body" v-if="options.length">
                    <table>
                        <tr>
                            <td><strong>Length:</strong></td><td>{{options.length}}</td>
                        </tr>
                        <tr>
                            <td><strong>Max velocity:</strong></td><td>{{ parseFloat(options.maxVelocity.toString()).toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td><strong>Stiffness:</strong></td><td>{{ parseFloat(options.stiffness + "").toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td><strong>Restitution:</strong></td><td>{{ parseFloat(options.restitution + "").toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td><strong>Bodypart size:</strong></td><td>{{ parseFloat(options.bodyPart.size + "").toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td><strong>Bodypart restitution:</strong></td><td>{{ parseFloat(options.bodyPart.restitution + "").toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td><strong>Bodypart stiffness:</strong></td><td>{{ parseFloat(options.bodyPart.stiffness + "").toFixed(2) }}</td>
                        </tr>
                        <tr>
                            <td><strong>Bodypart damping:</strong></td><td>{{ parseFloat(options.bodyPart.damping + "").toFixed(2) }}</td>
                        </tr>
                    </table>
                </div>

                <div class="option-group" name="General">
                    <div class="option">
                        <span>
                            <input type="checkbox" id="displayMouth" v-model="pageOptions.showMouth">
                            <label for="displayMouth">
                                Show mouth
                            </label>
                        </span>
                    </div>
                    <div class="option">
                        <span>
                            <input type="checkbox" id="displayMatterJS" v-model="pageOptions.showMatterJS">
                            <label for="displayMatterJS">
                                Show Matter JS
                            </label>
                        </span>
                    </div>
                    <!-- <div class="option">
                        <span>
                            <input type="checkbox" id="blinkInterval" v-model="blinkInterval" @change="setBlinkInterval">
                            <label for="blinkInterval">
                                Auto blink
                            </label>
                        </span>
                    </div> -->
                    <div class="option">
                        <span>
                            <button class="button __is" for="blink" @click="blink">
                                Blink
                            </button>
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
import _ from "lodash"
import StatsJS from "stats.js"
import Paper from "paper"
import gsap from "gsap"
import Catterpillar, { CatterpillarOptions } from "@/models/catterpillar"
import mousePosition from "@/services/mouse-position"
    
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
            mouseDown: false,
            mousePos: {x: 0, y:0},
            mouseTarget: null as null | Matter.Body,
            isBlinking: false,
            blinks: 0,
            blinkInterval: true,
            blinkTimeout: 0,
            paperJS: {
                paths: [] as Array<paper.Path>,
                mouth: null as null | paper.Path,
            },
            catterPillar: null as null | Catterpillar,
            pageOptions: {
                showMatterJS: true,
                showMouth: true
            },
            ignoreOptionsUpdate: false,
            options: {
            } as CatterpillarOptions
        }
    },
    mounted() {
        this.initMatterJS()
        this.initPaperJS()
        const el = this.$el.querySelector(".scroll-container")
        this.displayFPS(el)
        this.createGround()
        this.generateOptions()
        // this.setBlinkInterval()

        window.addEventListener("keydown", this.keyPressEvent)
        window.addEventListener("mouseup", this.cancelMouseDown)
        window.addEventListener("resize", this.resetView)
    },
    unmounted() {
        this.removeCatterpillar()
        this.removeMatter()
        this.stats = null
        const el = this.$refs["matterContainer"] as HTMLElement
        if (!el) {
            return
        }
        window.removeEventListener("keydown", this.keyPressEvent)
        window.removeEventListener("mouseup", this.cancelMouseDown)
        window.removeEventListener("resize", this.resetView)
    },
    methods: {
        resetView() {
            this.removeMatter()
            setTimeout(() =>{
                this.initMatterJS()
                this.createGround()
                this.generateCatterpillar()
            })
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
        generateOptions() {
            this.options = {
                length:         12 + Math.floor(Math.random() * 4 - 2),
                maxVelocity:    3.2 + Math.random() * 1.6 - 0.8,
                stiffness:      .16 + Math.random() * 0.40 - 0.08, 
                restitution:    .72 + Math.random() * 0.16 - 0.08,
                bodyPart: {
                    size:        12 + Math.floor(Math.random() * 4 - 2),
                    stiffness:   .2 + Math.random() * .8 - .04,
                    damping:    0,
                    restitution: .5 + Math.random() * .6 - .3,
                }
            } as CatterpillarOptions
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
        releaseCatterpiller(e: TouchEvent) {
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

            if (canvasEl.children.length > 0) {
                for (let i=0; i < canvasEl.children.length; i++) {
                    canvasEl.children[i].remove()
                }
            }

            // create an engine
            const engine = Matter.Engine.create({
                enableSleeping: true,
                gravity: {
                    x: 0,
                    y: 1
                },
                timing: {
                    timeScale: 1
                }
            })

            // create runner
            const render = Matter.Render.create({
                element: canvasEl,
                engine: engine,
                options: {
                    width: canvasEl.clientWidth,
                    height: canvasEl.clientHeight,
                    showAngleIndicator: true,
                    showVelocity: true,
                }
            })

            const runner = Matter.Runner.create()
            
            this.mWorld = engine.world
            this.mRunner = runner
            this.mEngine = engine
            Matter.Render.run(render)

            // run the engine
            Matter.Runner.run(this.mRunner, this.mEngine)
            this.renderLoop()    
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
        catterPillarMove(bodies: Array<Matter.Body>, direction : "left" | "right", recursive?: boolean) {
            const promise = new Promise((resolve, reject) => {
                if (!bodies) {
                    return reject(new Error("Provide bodies"))
                }
            
                if (!this.mWorld || !this.ground || !this.catterPillar?.composite) {
                    return reject(new Error("Missing required variables mWorld | ground | catterPillar.composite"))
                }
                
                // Check if the catterpillar collides with the ground, and exit when it does not
                const collision = _.some(_.map(this.catterPillar.composite.bodies, body => {
                    if (!this.catterPillar) {
                        return
                    }

                    if (!this.ground) {
                        this.catterPillar.isMoving = false  
                        return false
                    }
                    return Matter.Collision.collides(body, this.ground)
                }))
                
                
                if (!collision) {
                    return reject(new Error("No active collision"))
                }
                
                const head = bodies[0]
                const butt = bodies[bodies.length-1]
                const belly = bodies[Math.floor((bodies.length-1)/2)]
                const duration = .8
                const newLength = (this.options.length * this.options.bodyPart.size)*.8
                const yOffset = (this.ground.bounds.max.y - this.ground.bounds.min.y) / 2
                let headConstaint = null as null | Matter.Constraint
                this.catterPillar.isMoving = true

                // Fix butt to ground
                const buttConstaint = Matter.Constraint.create({
                    bodyA: butt,
                    pointA: { x: 0, y: this.options.bodyPart.size/2 },
                    pointB: { x: butt.position.x - this.ground.bounds.max.x/2, y: -yOffset },
                    bodyB: this.ground,
                    length: 1,
                    stiffness: .8,
                    label: "bodyPartConnection",
                    render: {
                        strokeStyle: "#9f0",
                        type:"line",
                    }
                })
                Matter.Composite.add(this.mWorld, buttConstaint)
            
            
                if ((direction == "left" && head.position.x > butt.position.x) ||
                    (direction == "right" && head.position.x < butt.position.x)) {

                
                    // Kick head to opposite side
                    Matter.Body.setVelocity( head, {
                        x: 0,
                        y: (this.options.length * this.options.bodyPart.size),
                    })
                    // Fix belly to ground
                    const bellyConstaint = Matter.Constraint.create({
                        bodyA: belly,
                        pointA: { x: 0, y: this.options.bodyPart.size/2 },
                        pointB: { x: belly.position.x - this.ground.bounds.max.x/2, y: -yOffset },
                        bodyB: this.ground,
                        length: 1,
                        stiffness: .8,
                        label: "bodyPartConnection",
                        render: {
                            strokeStyle: "#9f0",
                            type:"line",
                        }
                    })
                    Matter.Composite.add(this.mWorld, bellyConstaint)
                
                    setTimeout(() => {
                        if (this.mWorld) {
                            Matter.Composite.remove(this.mWorld,[bellyConstaint])
                        }
                    }, 100)

                    gsap.to(this.catterPillar.constraint, {
                        length: (this.options.length * this.options.bodyPart.size) * .6,
                        onComplete: () => {
                            if (!this.catterPillar) {
                                return
                            }
                            
                            gsap.to(this.catterPillar.constraint, {
                                length: (this.options.length * this.options.bodyPart.size),
                                onComplete: () => {
                                    setTimeout(() => {
                                        if (this.mWorld) {
                                            Matter.Composite.remove(this.mWorld,[buttConstaint])
                                            resolve(true)
                                        }
                                    }, 320)
                                },
                                ease: "back.out",
                                duration: duration/2
                            })
                        },
                        ease: "back.out",
                        duration: duration/2
                    })

                } else {
                // Fix head to ground
                    headConstaint = Matter.Constraint.create({
                        bodyA: head,
                        pointA: { x: 0, y: this.options.bodyPart.size/2 },
                        pointB: { x: head.position.x - this.ground.bounds.max.x/2, y: -yOffset },
                        bodyB: this.ground,
                        length: 0.5,
                        stiffness: .8,
                        label: "bodyPartConnection",
                        render: {
                            strokeStyle: "#9f0",
                            type:"line",
                        }
                    })
                    Matter.Composite.add(this.mWorld, headConstaint)

                    // Actually move, when head is pointing in the right direction
                    if (this.catterPillar.constraint) {
                        // Slide butt forward ( to the left )
                        let newPosX = 0
                        if (direction === "left") {
                            newPosX = (butt.position.x - this.ground.bounds.max.x/2) - newLength/2
                        } else if (direction === "right") {
                            newPosX = (butt.position.x - this.ground.bounds.max.x/2) + newLength/2
                        }
                
                        gsap.to(buttConstaint.pointB, {
                            x: newPosX,
                            onComplete:() => {
                                if (!this.mWorld) {
                                    return
                                }
                                if (headConstaint) {
                                    Matter.Composite.remove(this.mWorld, headConstaint)
                                }
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
                                if (!this.catterPillar) {
                                    return
                                }
                                gsap.to(this.catterPillar.constraint, {
                                    length: (this.options.bodyPart.size) * this.options.length,
                                    onUpdate:() => {
                                        if (!this.mEngine) {
                                            return
                                        }
                                    },
                                    onComplete: () => {
                                        setTimeout(() => {
                                            if (this.mWorld) {
                                                Matter.Composite.remove(this.mWorld,buttConstaint)
                                                resolve(true)
                                            }
                                        }, 320)
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

                }

            })
            promise.then(() => {
                if (!this.catterPillar) {
                    throw new Error("this.catterPillar == null")
                }
                
                if (recursive) {
                    setTimeout(() => {
                        const head = bodies[0]
                        if (this.catterPillar) {
                            this.catterPillar.isMoving = false
                            return
                        }
                        if ((direction == "left" && head.position.x > this.mousePos.x) ||
                        direction == "right" && head.position.x < this.mousePos.x) {
                            this.catterPillarMove(bodies, direction, recursive)
                        } else {
                            this.catterPillar.isMoving = false
                            this.mousePos = {x:0, y:0}
                        }
                    }, 240)
                } else {
                    this.catterPillar.isMoving = false
                }
            }).catch(e => {
                if (!this.catterPillar) {
                    return
                }
                this.catterPillar.isMoving = false
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
    
            const options = this.options
            const x = el.clientWidth/2 - (options.length * options.bodyPart.size) / 2
            
            this.catterPillar = new Catterpillar({x, y: 8, ...options})
            
            Matter.Composite.add(this.mWorld, [
                this.catterPillar.constraint,
                this.catterPillar.composite
            ])
            
            // // Create mouth
            // this.paperJS.mouth = new Paper.Path([
            //     new Paper.Point(this.options.bodyPart.size * 0,   this.options.bodyPart.size * .5),
            //     new Paper.Point(this.options.bodyPart.size * 0.5, this.options.bodyPart.size * .6),
            //     new Paper.Point(this.options.bodyPart.size * 1,   this.options.bodyPart.size * .5),
            //     new Paper.Point(this.options.bodyPart.size * .5,  this.options.bodyPart.size * .9),
            // ])
            // this.paperJS.mouth.fillColor = new Paper.Color("#222")

            // this.paperJS.mouth.closePath()
            // this.paperJS.mouth.smooth({ type: "continuous"})
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
            if (!this.catterPillar) {
                return
            }
            this.catterPillar.blink()
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
            
            if (!el || !this.catterPillar || this.catterPillar.bodyLength < 0) {
                requestAnimationFrame(this.renderLoop)
                return
            }

            const catterpillar = this.catterPillar.composite
            // Reset catterpillar when it is off screen
            const head = this.catterPillar.head
            const butt = this.catterPillar.butt
            
            if ((head.position.x > el.clientWidth && butt.position.x > el.clientWidth) ||
            (head.position.x <= 0 && butt.position.x < 0) ||
            (head.position.y > el.clientHeight + 100 && butt.position.y > el.clientHeight + 100)
            ) {
                console.log("catterpillar", this.catterPillar.bodyLength)
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

            // Position eyes
            const maxOffset = 12
            const offsetPerc = (head.position.x - butt.position.x + catterpillar.bodies.length * this.options.bodyPart.size)/(catterpillar.bodies.length * this.options.bodyPart.size*2)
        
            this.catterPillar.eye.left.offset.x = maxOffset/2 + maxOffset * offsetPerc - maxOffset
            this.catterPillar.eye.right.offset.x = maxOffset/2 + maxOffset * offsetPerc - maxOffset
           
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