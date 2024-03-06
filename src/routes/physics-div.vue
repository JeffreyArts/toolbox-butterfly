<template>

    <div class="options-overview">
        <header class="title">
            <h1>Physics div</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ref="matterContainer" ratio="1x1">
                <div class="scroll-container">
                    <i class="ball" v-for="(number,k) in amountOfBalls" :key="k" />
                </div>
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="Options">
                    <div class="option">
                        <label for="inputNumber">
                            # Balls
                        </label>
                        <input type="number" id="inputNumber" v-model="amountOfBalls" step="1" min="1" max="64">
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
    
export default defineComponent ({ 
    props: [],
    data() {
        return {
            amountOfBalls: 1,
            mWorld: null as null | Matter.World,
            mEngine: null as null | Matter.Engine,
            mRunner: null as null | Matter.Runner,
            mObject: [] as Array<Matter.Body>,
            animation: true
        }
    },
    watch: {
        amountOfBalls: {
            handler(current, prev) {
                const ballsEl = this.$el.querySelectorAll(".ball")
                const el = this.$refs["matterContainer"] as HTMLElement
                if (!this.mWorld || !el) {
                    return
                }

                if (current > prev) {
                    // Add ball
                    const ball = ballsEl[ballsEl.length-1]
                    Matter.World.add(this.mWorld, Matter.Bodies.circle(
                        el.clientWidth/2,
                        16,
                        ball.clientWidth/2, // Radius
                    ))
                        
                } else {
                    // Remove ball
                    const balls = _.filter(this.mWorld.bodies, body => {
                        return body.label.startsWith("Circle")
                    })
                    
                    // This prevents from balls being removed twice, cause they could also have been removed already by falling off-screen
                    if (ballsEl.length == balls.length) {
                        Matter.World.remove(this.mWorld, balls[0])
                    }
                }
            },
        }
    },
    mounted() {
        window.dispatchEvent(new Event("resize"))
        this.initMatterJS()
    },
    methods: {
        initMatterJS() {
            const el = this.$refs["matterContainer"] as HTMLElement
            if (!el) {
                throw new Error("matterContainer ref can not be found")
            }

            // create an engine
            var engine = Matter.Engine.create()
            const balls = [] as Array<Matter.Body>
                
            this.$el.querySelectorAll(".ball").forEach((ball: HTMLElement) => {
                balls.push(Matter.Bodies.circle(
                    ball.offsetLeft,
                    ball.offsetTop,
                    ball.clientWidth/2, // Radius
                ))
            })
            
            // create ground
            var ground = Matter.Bodies.rectangle(el.clientWidth/2, el.clientHeight-16, el.clientWidth, 16, { isStatic: true })
            
            // add all of the bodies to the world
            Matter.Composite.add(engine.world, [...balls, ground])
            // create runner
            var runner = Matter.Runner.create()

            this.mWorld = engine.world
            this.mRunner = runner
            this.mEngine = engine

            // run the engine
            Matter.Runner.run(this.mRunner, this.mEngine)
            this.animationUpdate()
        },
        animationUpdate() {
            if (!this.mWorld) {
                return
            }

            const balls = _.filter(this.mWorld.bodies, body => {
                return body.label.startsWith("Circle")
            })

            const el = this.$refs["matterContainer"] as HTMLElement
            if (!el) {
                throw new Error("matterContainer ref can not be found")
            }

            
            this.$el.querySelectorAll(".ball").forEach((ball, index) => {
                const ballEl = ball as HTMLElement
                const ballBody = balls[index]
                // console.log(index, "ball length", balls.length)
                if (!ballBody || !this.mWorld) {
                    return
                }

                ballEl.style.left = `${ballBody.position.x}px`
                ballEl.style.top = `${ballBody.position.y}px`

                if (ballBody.position.y > el.clientHeight) {
                    Matter.World.remove(this.mWorld, ballBody)
                    this.amountOfBalls--
                }
                
            })

            requestAnimationFrame(this.animationUpdate)
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
</style>
