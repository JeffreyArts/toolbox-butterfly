<template>

    <div class="options-overview">
        <header class="title">
            <h1>Physics Matter-JS Render</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ref="matterContainer" ratio="1x1">
                <div class="scroll-container">
                    <div class="render-canvas" ref="renderCanvas" />
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
    
export default defineComponent ({ 
    props: [],
    data() {
        return {
            mWorld: null as null | Matter.World,
            mEngine: null as null | Matter.Engine,
            mRunner: null as null | Matter.Runner,
            mObject: [] as Array<Matter.Body>,
            stats: null as null | Stats,    
            animation: true,
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
                        Matter.World.add(this.mWorld, Matter.Bodies.circle(
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
                        
                } else {
                    // Remove ball
                    // const ballsEl = this.$el.querySelectorAll(".ball")
                
                    // This prevents from balls being removed twice, cause they could also have been removed already by falling off-screen
                    while (balls.length > this.options.amountOfBalls) {
                        if (!this.mWorld) {
                            return
                        }

                        Matter.World.remove(this.mWorld, balls[0])
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
                    Matter.World.remove(this.mWorld, ball)
                    Matter.World.add(this.mWorld, newBall)
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
        const el = this.$el.querySelector(".scroll-container")
        this.displayFPS(el)
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
    },
    methods: {
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
            const ground = Matter.Bodies.rectangle(el.clientWidth/2, el.clientHeight-16, el.clientWidth, 16, { isStatic: true })
            
            // add all of the bodies to the world
            Matter.Composite.add(engine.world, [...balls, ground])
            // create runner
            const render = Matter.Render.create({
                element: canvasEl,
                engine: engine
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

            balls.forEach((ball) => {
                if (!this.mWorld) {
                    return
                }

                if (ball.position.y > el.clientHeight) {
                    Matter.World.remove(this.mWorld, ball)
                    this.options.amountOfBalls--
                }
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
</style>
