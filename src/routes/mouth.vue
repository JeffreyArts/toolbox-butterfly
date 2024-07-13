<template>

    <div class="options-overview">
        <header class="title">
            <h1>Mouth</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ref="matterContainer" ratio="1x1">
                <div class="scroll-container"
                    @mousedown="mouseDownEvent"
                    @touchstart="mouseDownEvent"
                    @mousemove="mouseMoveEvent">
                    <!-- <div class="render-canvas" ref="renderCanvas" :style="[{opacity: pageOptions.showMatterJS ? 1 : 0}]" /> -->
                    <canvas id="paperCanvas"></canvas>
                </div>
            </div>
            <div class="data-object">
                <pre>{{ JSON.stringify(mouthData, null, 2) }}</pre>
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">


                <div class="option-group" name="Options" v-if="mouth">
                    <div class="option">
                        <span>
                            <strong>Current state: {{ mouth.state }}</strong>
                            <br>
                            <br>
                            <button class="button __is" @click="switchState('🙂')" :style="mouth.inTransition ? 'cursor: not-allowed; filter: grayscale(100%);' : ''">
                                🙂
                            </button>
                            <button class="button __is" @click="switchState('😮')" :style="mouth.inTransition ? 'cursor: not-allowed; filter: grayscale(100%);' : ''">
                                😮
                            </button>
                            <button class="button __is" @click="switchState('😐')" :style="mouth.inTransition ? 'cursor: not-allowed; filter: grayscale(100%);' : ''">
                                😐
                            </button>
                            <button class="button __is" @click="switchState('🙁')" :style="mouth.inTransition ? 'cursor: not-allowed; filter: grayscale(100%);' : ''">
                                🙁
                            </button>
                        </span>
                    </div>
                    <div class="option">
                        <span>
                            <input type="checkbox" id="displayPoints" v-model="displayPoints" @change="toggleDisplayPoints">
                            <label for="displayPoints">
                                Display points
                            </label>
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
import Mouth, { MouthState } from "@/models/catterpillar/mouth"
import mousePosition from "@/services/mouse-position"
    
export default defineComponent ({ 
    props: [],
    data() {
        return {
            stats: null as null | Stats,   
            active: true,
            mouseDown: false,
            mousePos: {x: 0, y:0},
            mouseTarget: null as Matter.Body | null,
            mouth: null as Mouth | null,
            mouthData: {
                topLip: {
                    left: {x: 1, y:1},
                    center: {x: 1, y:1},
                    right: {x: 1, y:1},
                },
                bottomLip: {
                    left: {x: 1, y:1},
                    center: {x: 1, y:1},
                    right: {x: 1, y:1},
                }
            },
            activePoint: undefined as {dot:paper.Path, parentDot: paper.Point} | undefined,
            points: [] as Array<{dot:paper.Path, parentDot: paper.Point}>,
            displayPoints: true,
            ignoreOptionsUpdate: false,
        }
    },
    mounted() {
        this.initPaperJS()

        console.log(this.mouth)
        const el = this.$el.querySelector("#paperCanvas")
        
        const head = new Paper.Path.Circle({x: el.width/4, y: el.height/4}, el.width/4)
        head.fillColor = new Paper.Color("rgb(88, 242, 8)")
        this.mouth = new Mouth({size: 10, scale: 14})
        this.mouth.x = el.width/4
        this.mouth.y = el.height/10 + el.height/4
        this.createPoints()
        this.displayFPS(el)

        window.addEventListener("mouseup", this.cancelMouseDown)
    },
    unmounted() {
        this.active = false
        this.stats = null
        window.removeEventListener("mouseup", this.cancelMouseDown)
    },
    methods: {
        createPoints() {
            if (!this.mouth) {
                throw new Error("First initiate mouth object")
            }

            this.points.push({
                dot: new Paper.Path.Circle(this.mouth.topLip.left, 6),
                parentDot: this.mouth.topLip.left
            })
            this.points.push({
                dot: new Paper.Path.Circle(this.mouth.topLip.center, 6),
                parentDot: this.mouth.topLip.center
            })
            this.points.push({
                dot: new Paper.Path.Circle(this.mouth.topLip.right, 6),
                parentDot: this.mouth.topLip.right
            })

            this.points.push({
                dot: new Paper.Path.Circle(this.mouth.bottomLip.left, 6),
                parentDot: this.mouth.bottomLip.left
            })
            this.points.push({
                dot: new Paper.Path.Circle(this.mouth.bottomLip.center, 6),
                parentDot: this.mouth.bottomLip.center
            })
            this.points.push({
                dot: new Paper.Path.Circle(this.mouth.bottomLip.right, 6),
                parentDot: this.mouth.bottomLip.right
            })

            if (this.displayPoints) {
                this.showPoints()
            }
        },
        toggleDisplayPoints() {
            if (this.displayPoints) {
                this.showPoints()
            } else {
                this.hidePoints()
            }
        },
        showPoints() {
            _.each(this.points, (point) => {
                point.dot.fillColor = new Paper.Color("#777")
            })
        },
        hidePoints() {
            _.each(this.points, (point) => {
                point.dot.fillColor = new Paper.Color("transparent")
            })
        },
        mouseClickEvent(e: MouseEvent) {
            console.log(this.mousePos)
        },
        mouseDownEvent(e:MouseEvent | TouchEvent) {
            e.stopPropagation() 

            this.mouseDown = true
            this.mousePos = mousePosition.xy(e)
            console.log(this.activePoint)
        },
        cancelMouseDown() {
            this.mouseDown = false
            this.mouseTarget = null
        },
        mouseMoveEvent(e:MouseEvent | TouchEvent) {
            // if (!this.mouseDown) {
            //     return
            // }
            this.mousePos = mousePosition.xy(e)
            
            _.each(this.points, point => {
                if ((point.dot.position.x > this.mousePos.x - 6 && point.dot.position.x < this.mousePos.x + 6) &&
                    (point.dot.position.y > this.mousePos.y - 6 && point.dot.position.y < this.mousePos.y + 6)) {
                    point.dot.fillColor = new Paper.Color("yellow")
                    this.activePoint = point
                } else {
                    if (this.displayPoints) {
                        point.dot.fillColor = new Paper.Color("#777")
                    } else {
                        point.dot.fillColor = new Paper.Color("transparent")
                    }
                }
            })
            

            if (this.mouseDown && this.activePoint) {
                if (!this.mouth) {
                    return
                }

                this.activePoint.dot.position.x = this.mousePos.x
                this.activePoint.dot.position.y = this.mousePos.y
                this.activePoint.parentDot.x = this.mousePos.x
                this.activePoint.parentDot.y = this.mousePos.y

                this.mouth.paper.smooth({ type: "continuous"})
                this.mouthData = {
                    bottomLip: {
                        left: {
                            x: this.mouth.bottomLip.left.x / this.mouth.scale,
                            y: this.mouth.bottomLip.left.y / this.mouth.scale,
                        },
                        center: {
                            x: this.mouth.bottomLip.center.x / this.mouth.scale,
                            y: this.mouth.bottomLip.center.y / this.mouth.scale,
                        },
                        right: {
                            x: this.mouth.bottomLip.right.x / this.mouth.scale,
                            y: this.mouth.bottomLip.right.y / this.mouth.scale,
                        }
                    },
                    topLip: {
                        left: {
                            x: this.mouth.topLip.left.x / this.mouth.scale,
                            y: this.mouth.topLip.left.y / this.mouth.scale,
                        },
                        center: {
                            x: this.mouth.topLip.center.x / this.mouth.scale,
                            y: this.mouth.topLip.center.y / this.mouth.scale,
                        },
                        right: {
                            x: this.mouth.topLip.right.x / this.mouth.scale,
                            y: this.mouth.topLip.right.y / this.mouth.scale,
                        }
                    }
                }
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
        displayFPS(targetEl: HTMLElement) {
            this.stats = new StatsJS()
            this.stats.showPanel( 0 ) // 0: fps, 1: ms, 2: mb, 3+: custom
            this.stats.update() // 0: fps, 1: ms, 2: mb, 3+: custom
            this.stats.dom.id = "fpsCanvas"
            targetEl.appendChild( this.stats.dom )
            requestAnimationFrame( this.updateFPS )      
        },
        switchState(state:  MouthState) {
            if (!this.mouth) {
                throw new Error("Missing mouth object")
            }
            let time = 0
            const step = 10
            this.mouth.switchState(state, .64)
            const interval = setInterval(() => {
                _.each(this.points, point => {
                    point.dot.position.x = point.parentDot.x
                    point.dot.position.y = point.parentDot.y
                })
                time += step / 1000

                if (time >= .64) {
                    clearInterval(interval)
                }
            }, step)
            

            this.mouthData = {
                bottomLip: {
                    left: {
                        x: this.mouth.bottomLip.left.x / this.mouth.scale,
                        y: this.mouth.bottomLip.left.y / this.mouth.scale,
                    },
                    center: {
                        x: this.mouth.bottomLip.center.x / this.mouth.scale,
                        y: this.mouth.bottomLip.center.y / this.mouth.scale,
                    },
                    right: {
                        x: this.mouth.bottomLip.right.x / this.mouth.scale,
                        y: this.mouth.bottomLip.right.y / this.mouth.scale,
                    }
                },
                topLip: {
                    left: {
                        x: this.mouth.topLip.left.x / this.mouth.scale,
                        y: this.mouth.topLip.left.y / this.mouth.scale,
                    },
                    center: {
                        x: this.mouth.topLip.center.x / this.mouth.scale,
                        y: this.mouth.topLip.center.y / this.mouth.scale,
                    },
                    right: {
                        x: this.mouth.topLip.right.x / this.mouth.scale,
                        y: this.mouth.topLip.right.y / this.mouth.scale,
                    }
                }
            }
        },
        updateFPS () {
            if (!this.stats) {
                return
            }

            this.stats.begin()
            this.stats.end()

            requestAnimationFrame( this.updateFPS )
        },
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
    .data-object {
        background-color: #fff;
        height: 200px;
        overflow-y: auto;
        color: #333;
        width: 100%;
        padding: 0 16px;
    }
</style>