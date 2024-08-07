<template>

    <div class="options-overview">
        <header class="title">
            <h1>Physics Matter-JS Paper-JS</h1>
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
                        <label for="amountOfBalls">
                            # Balls
                        </label>
                        <input type="number" id="amountOfBalls" v-model="options.amountOfBalls" step="1" min="1" max="96">
                    </div>
                    <div class="option">
                        <label for="ballSize">
                            Ball size
                        </label>
                        <input type="number" id="ballSize" v-model="options.ballSize" step="1" min="1" max="256">
                    </div>
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
                </div>
                <div class="option-group" name="Ball options">
                    <div class="option">
                        <label for="density">
                            Density 
                            <a href="https://brm.io/matter-js/docs/classes/Body.html#property_density" target="_blank" class="info">
                                <span class="info-icon">?</span>
                                <span class="info-details">
                                    A Number that defines the density of the body (mass per unit area). <br>
                                    <br>
                                    Mass will also be updated when set. <br>
                                    (click for more info)
                                </span>
                            </a>
                        </label>
                        <input type="number" id="density" v-model="options.density" step="0.001" min="0" max="1">
                    </div>
                    <div class="option">
                        <label for="friction">
                            Friction
                            <a href="https://brm.io/matter-js/docs/classes/Body.html#property_friction" target="_blank" class="info">
                                <span class="info-icon">?</span>
                                <span class="info-details">
                                    A Number that defines the friction of the body. The value is always positive and is in the range (0, 1). A value of 0 means that the body may slide indefinitely. A value of 1 means the body may come to a stop almost instantly after a force is applied. <br>
                                    <br>
                                    (click for more info)
                                </span>
                            </a>
                        </label>
                        <input type="number" id="friction" v-model="options.friction" step="0.01" min="0" max="1">
                    </div>
                    <div class="option">
                        <label for="mass">
                            Mass
                            <a href="https://brm.io/matter-js/docs/classes/Body.html#property_mass" target="_blank" class="info">
                                <span class="info-icon">?</span>
                                <span class="info-details">
                                    A Number that defines the mass of the body.<br>
                                    <br>
                                    Density will also be updated when set.
                                    <br>
                                    (click for more info)
                                </span>
                            </a>
                        </label>
                        <input type="number" id="mass" v-model="options.mass" step=".005" min="0.01" max="64">
                    </div>
                    <div class="option">
                        <label for="restitution">
                            Restitution
                            <a href="https://brm.io/matter-js/docs/classes/Body.html#property_restitution" target="_blank" class="info">
                                <span class="info-icon">?</span>
                                <span class="info-details">
                                    A Number that defines the restitution (elasticity) of the body. The value is always positive and is in the range (0, 1). A value of 0 means collisions may be perfectly inelastic and no bouncing may occur. A value of 0.8 means the body may bounce back with approximately 80% of its kinetic energy.<br>
                                    <br>
                                    (click for more info)
                                </span>
                            </a>
                        </label>
                        <input type="number" id="restitution" v-model="options.restitution" step=".01" min="0" max="4">
                    </div>
                    <div class="option">
                        <label for="slop">
                            Slop
                            <a href="https://brm.io/matter-js/docs/classes/Body.html#property_slop" target="_blank" class="info">
                                <span class="info-icon">?</span>
                                <span class="info-details">
                                    A Number that specifies a thin boundary around the body where it is allowed to slightly sink into other bodies.<br>
                                    <br>
                                    (click for more info)
                                </span>
                            </a>
                        </label>
                        <input type="number" id="slop" v-model="options.slop" step=".001" min="0" max="16">
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
            mRender: null as null | Matter.Render,
            mObject: [] as Array<Matter.Body>,
            ground: null as null | Matter.Body,
            paperGround: null as null | paper.Shape,
            stats: null as null | Stats,    
            animation: true,
            paperBalls: [] as Array<paper.Shape>,
            showMatterJS: true,
            showPaperJS: true,
            ignoreOptionsUpdate: true,
            options: {
                density: 0.001,
                friction: 0.1,
                amountOfBalls: 1,
                ballSize: 32,
                mass: 1,
                slop: 0.05,
                restitution: 0
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
        "options.amountOfBalls": {
            handler(current, prev) {
                if (this.options.amountOfBalls == 0) {
                    this.options.amountOfBalls = 1
                    return
                }
                
                if (this.options.amountOfBalls > 96) {
                    this.options.amountOfBalls = 96
                    // return
                }

                const el = this.$refs["matterContainer"] as HTMLElement
                if (!this.mWorld || !el) {
                    return
                }

                let balls = _.filter(this.mWorld.bodies, body => {
                    return body.label.startsWith("Circle")
                })
                
                if (current > prev) {

                    // Add ball
                    const newBalls = this.options.amountOfBalls - balls.length

                    for (let index = 0; index < newBalls; index++) {
                        Matter.Composite.add(this.mWorld, Matter.Bodies.circle(
                            el.clientWidth/2,
                            16,
                            this.options.ballSize/2, // Radius,
                            _.pick(this.options, [
                                "friction",
                                "mass",
                                "slop",
                                "density",
                                "restitution",
                            ])
                        ))

                        const shape = new Paper.Shape.Circle( new Paper.Point(el.clientWidth/2,  16), this.options.ballSize/2)

                        shape.strokeColor = new Paper.Color("#333")
                        shape.fillColor = new Paper.Color("#fff")
                        this.paperBalls.push(shape)
                    }
                        
                } else {
                    // Remove ball
                    // const ballsEl = this.$el.querySelectorAll(".ball")
                
                    // This prevents from balls being removed twice, cause they could also have been removed already by falling off-screen
                    while (balls.length > this.options.amountOfBalls) {
                        
                        if (!this.mWorld) {
                            return
                        }
                        this.paperBalls[0].remove()
                        this.paperBalls.shift()
                        Matter.Composite.remove(this.mWorld, balls[0])
                        
                        balls = _.filter(this.mWorld.bodies, body => {
                            return body.label.startsWith("Circle")
                        })
                    }
                }
            },
        },
        "options.ballSize": {
            handler(current, prev) {
                if (!this.mWorld) {
                    return
                }
                if (this.options.density == 0) {
                    this.options.density = 0.001
                    return
                }

                const balls = _.filter(this.mWorld.bodies, body => {
                    return body.label.startsWith("Circle")
                })

                balls.forEach(ball => {
                    if (!this.mWorld) {
                        return
                    }
                    const newBall = _.cloneDeep(ball)
                    Matter.Composite.remove(this.mWorld, ball)
                    Matter.Composite.add(this.mWorld, newBall)
                })

            }
        },
        "options.density": {
            handler(current, prev) {
                if (!this.mWorld) {
                    return
                }
                if (this.options.density == 0) {
                    this.options.density = 0.001
                    return
                }

                const balls = _.filter(this.mWorld.bodies, body => {
                    return body.label.startsWith("Circle")
                })

                balls.forEach(ball => {
                    Matter.Body.setDensity(ball, this.options.density)
                })

            }
        },
        "options.friction": {
            handler(current, prev) {
                if (!this.mWorld) {
                    return
                }
                if (this.options.friction < 0) {
                    this.options.friction = 0.001
                    return
                }

                const balls = _.filter(this.mWorld.bodies, body => {
                    return body.label.startsWith("Circle")
                })

                balls.forEach(ball => {
                    ball.friction = this.options.friction
                })

            }
        },
        "options.mass": {
            handler(current, prev) {
                if (!this.mWorld) {
                    return
                }
                if (this.options.mass == 0) {
                    this.options.mass = 0.001
                    return
                }

                const balls = _.filter(this.mWorld.bodies, body => {
                    return body.label.startsWith("Circle")
                })

                balls.forEach(ball => {
                    Matter.Body.setMass(ball, this.options.mass)
                })

            }
        },
        "options.slop": {
            handler(current, prev) {
                if (!this.mWorld) {
                    return
                }
                if (this.options.slop > 16) {
                    this.options.slop = 16
                    return
                }

                const balls = _.filter(this.mWorld.bodies, body => {
                    return body.label.startsWith("Circle")
                })

                balls.forEach(ball => {
                    ball.slop =  this.options.slop
                })

            }
        },
        "options.restitution": {
            handler(current, prev) {
                if (!this.mWorld) {
                    return
                }
                if (this.options.restitution < 0) {
                    this.options.restitution = 0
                    return
                }
                if (this.options.restitution > 4) {
                    this.options.restitution = 4
                    return
                }

                const balls = _.filter(this.mWorld.bodies, body => {
                    return body.label.startsWith("Circle")
                })

                balls.forEach(ball => {
                    ball.restitution =  this.options.restitution
                })
            }
        }
    },
    mounted() {
        this.loadOptions()
        this.initMatterJS()
        this.initPaperJS()
        const el = this.$el.querySelector(".scroll-container")
        this.displayFPS(el)
        window.addEventListener("resize", this.updateView)
    },
    unmounted() {
        this.mWorld = null
        this.stats = null
        
        if (this.mRunner) {
            Matter.Runner.stop(this.mRunner)
        }
        if (this.mEngine) {
            Matter.Engine.clear(this.mEngine)
        }
        window.removeEventListener("resize", this.updateView)
    },
    methods: {
        updateView() {
            const el = this.$refs["matterContainer"] as HTMLElement
            const scrollContainer = this.$el.querySelector(".scroll-container")
            
            if (!el) {
                throw new Error("matterContainer ref can not be found")
            }
            
            if (this.mWorld && this.mRender && this.ground) {
                Matter.Composite.remove(this.mWorld, this.ground)

                this.ground = Matter.Bodies.rectangle(el.clientWidth/2, el.clientHeight-16, el.clientWidth, 16, { isStatic: true })
                Matter.Composite.add(this.mWorld,  this.ground)
                console.log(this.mWorld, this.mRunner)
                this.mRender.canvas.width = el.clientWidth
                this.mRender.canvas.height = el.clientHeight
            }

            // Update paper canvas
            const canvas = this.$el.querySelector("#paperCanvas")
            
            if (!canvas) {
                console.error("Can't find canvas")
                return
            }

            canvas.width = scrollContainer.clientWidth
            canvas.height = scrollContainer.clientHeight

            Paper.view.viewSize = new Paper.Size(scrollContainer.clientWidth, scrollContainer.clientHeight)
            if (this.paperGround) {
                this.paperGround.remove()
            }

            this.mWorld?.bodies.forEach(body => {
                if (body.label.startsWith("Rectangle")) {
                    const width = body.bounds.max.x - body.bounds.min.x 
                    const height = body.bounds.max.y - body.bounds.min.y 
                    this.paperGround = new Paper.Shape.Rectangle( new Paper.Point(body.bounds.min.x,  body.bounds.min.y), new Paper.Size(width, height))

                    this.paperGround.strokeColor = new Paper.Color("#333")
                    this.paperGround.fillColor = new Paper.Color("#fff")
                }


            }) 
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

            this.mWorld?.bodies.forEach(body => {
                if (body.label.startsWith("Rectangle")) {
                    const width = body.bounds.max.x - body.bounds.min.x 
                    const height = body.bounds.max.y - body.bounds.min.y 
                    this.paperGround = new Paper.Shape.Rectangle( new Paper.Point(body.bounds.min.x,  body.bounds.min.y), new Paper.Size(width, height))

                    this.paperGround.strokeColor = new Paper.Color("#333")
                    this.paperGround.fillColor = new Paper.Color("#fff")
                }

                if (body.label.startsWith("Circle")) {
                    const circle = new Paper.Shape.Circle( new Paper.Point(body.position.x,  body.position.y), this.options.ballSize/2)

                    circle.strokeColor = new Paper.Color("#333")
                    circle.fillColor = new Paper.Color("#fff")
                    this.paperBalls.push(circle)
                }

            }) 
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
            const engine = Matter.Engine.create()

            const balls = [] as Array<Matter.Body>
                
            for (let index = 0; index < this.options.amountOfBalls; index++) {
                balls.push(Matter.Bodies.circle(
                    el.clientWidth/2,
                    16,
                    this.options.ballSize/2, // Radius,
                    _.pick(this.options, [
                        "friction",
                        "mass",
                        "slop",
                        "density",
                        "restitution",
                    ])
                ))
            }
            
            // create ground
            this.ground = Matter.Bodies.rectangle(el.clientWidth/2, el.clientHeight-16, el.clientWidth, 16, { isStatic: true })
            
            // add all of the bodies to the world
            Matter.Composite.add(engine.world, [...balls, this.ground])
            // create runner
            this.mRender = Matter.Render.create({
                element: canvasEl,
                engine: engine,
                options: {
                    width: canvasEl.clientWidth,
                    height: canvasEl.clientHeight,
                }
            })
            const runner = Matter.Runner.create()

            this.mWorld = engine.world
            this.mRunner = runner
            this.mEngine = engine
            Matter.Render.run(this.mRender)
            // run the engine
            Matter.Runner.run(this.mRunner, this.mEngine)
            this.renderLoop()
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

            const el = this.$refs["matterContainer"] as HTMLElement
            const balls = _.filter(this.mWorld.bodies, body => {
                return body.label.startsWith("Circle")
            })
          

            balls.forEach((ball, i) => {
                if (!this.mWorld) {
                    return
                }

                if (ball.position.y > el.clientHeight) {
                    Matter.Composite.remove(this.mWorld, ball)
                    this.paperBalls[i].remove()
                    delete this.paperBalls[i]
                    
                    this.options.amountOfBalls--
                }
                
                const paperBall = this.paperBalls[i]
                
                if (paperBall ) {
                    paperBall.position.x = ball.position.x
                    paperBall.position.y = ball.position.y
                }
            })
                
                
            this.paperBalls = _.compact(this.paperBalls)

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
