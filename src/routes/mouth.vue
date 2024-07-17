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
            <button class="button default" @click="addCustomState">Add custom state</button>
            <br>
            <div class="data-object">
                <pre>{{ JSON.stringify(mouthData, null, 2) }}</pre>
            </div>
            <button class="button" @click="copyMouthData(true)">
                <span v-if="copied">Copied!</span>
                <span v-if="!copied">Copy</span>
            </button>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Options" v-if="mouth">
                    <div class="option">
                        <span>
                            <strong>Current state: {{ mouth.state }}</strong>
                            <br>
                            <br>
                            <button class="button __is" @click="switchState('🙂')" :class="[mouth.inTransition || mouth.state === '🙂' ? '__isDisabled' : '',]">
                                🙂
                            </button>
                            <button class="button __is" @click="switchState('😮')" :class="[mouth.inTransition || mouth.state === '😮' ? '__isDisabled' : '',]">
                                😮
                            </button>
                            <button class="button __is" @click="switchState('😐')" :class="[mouth.inTransition || mouth.state === '😐' ? '__isDisabled' : '',]">
                                😐
                            </button>
                            <button class="button __is" @click="switchState('🙁')" :class="[mouth.inTransition || mouth.state === '🙁' ? '__isDisabled' : '',]">
                                🙁
                            </button>
                            <button class="button __is" @click="switchState('😚')" :class="[mouth.inTransition || mouth.state === '😚' ? '__isDisabled' : '',]">
                                😚
                            </button>
                        </span>
                    </div>
                    <div class="option" v-if="customStates.length > 0">
                        <span>
                            <strong>Custom states</strong>
                            <br>
                            <br>
                            <span v-for="(state, i) in customStates" :key="i">
                                <button class="button __is" @click="switchState(state)" :class="[mouth.inTransition || customState === i ? '__isDisabled' : '',]">
                                    {{ parseInt(i.toString(), 10) + 1 }}
                                </button>
                                &nbsp;
                            </span>
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
import MatterService from "@/services/matter-js"
import paperService from "@/services/paper-js"
import _ from "lodash"
import StatsJS from "stats.js"
import Paper from "paper"
import Mouth, { MouthState, MouthPoints } from "@/models/catterpillar/mouth"
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
            copied: false,
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
            } as MouthPoints,
            customStates: [] as Array<MouthPoints>,
            customState: undefined as number | undefined,
            activePoint: undefined as {dot:paper.Path, parentDot: paper.Point} | undefined,
            points: [] as Array<{dot:paper.Path, parentDot: paper.Point}>,
            displayPoints: true,
            ignoreOptionsUpdate: false,
        }
    },
    mounted() {
        const el = this.$el.querySelector("#paperCanvas")
        
        this.initView()
        this.displayFPS(el)

        window.addEventListener("resize", this.resetView)
        window.addEventListener("mouseup", this.cancelMouseDown)
    },
    unmounted() {
        this.active = false
        this.stats = null
        this.removePaperJS()

        window.removeEventListener("resize", this.resetView)
        window.removeEventListener("mouseup", this.cancelMouseDown)
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
        initView() {
            this.initPaperJS()

            const el = this.$el.querySelector("#paperCanvas")
            const head = new Paper.Path.Circle({x: el.width/4, y: el.height/4}, el.width/4)
            head.fillColor = new Paper.Color("rgb(88, 242, 8)")
            this.mouth = new Mouth({size: 10, scale: 14})

            this.mouth.x = el.width/4
            this.mouth.y = el.height/10 + el.height/4
            this.createPoints()
            this.updateMouthData()
        },
        removePaperJS() {
            paperService.destroy()
        },
        resetView() {
            this.removePaperJS()

            setTimeout(this.initView)
        },

        mouseClickEvent(e: MouseEvent) {
            console.log(this.mousePos)
        },
        mouseDownEvent(e:MouseEvent | TouchEvent) {
            e.stopPropagation() 

            this.mouseDown = true
            this.mousePos = mousePosition.xy(e)
        },
        cancelMouseDown() {
            this.mouseDown = false
            this.mouseTarget = null
        },
        mouseMoveEvent(e:MouseEvent | TouchEvent) {
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
                this.updateMouthData()
            }
        },

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
        copyMouthData(toggleCopy?: boolean) {
            if (toggleCopy) {
                this.copied = true
                setTimeout(() => {
                    this.copied = false
                }, 2000)
            }
            navigator.clipboard.writeText(`
        return {
            topLip: {
                left: {
                    x: ${this.mouthData.topLip.left.x},
                    y: ${this.mouthData.topLip.left.y}
                },
                center: {
                    x: ${this.mouthData.topLip.center.x},
                    y: ${this.mouthData.topLip.center.y}
                },
                right: {
                    x: ${this.mouthData.topLip.right.x},
                    y: ${this.mouthData.topLip.right.y}
                }
            },
            bottomLip: {
                left: {
                    x: ${this.mouthData.bottomLip.left.x},
                    y: ${this.mouthData.bottomLip.left.y}
                },
                center: {
                    x: ${this.mouthData.bottomLip.center.x},
                    y: ${this.mouthData.bottomLip.center.y}
                },
                right: {
                    x: ${this.mouthData.bottomLip.right.x},
                    y: ${this.mouthData.bottomLip.right.y}
                }
            },
        }`)
        },
        updateMouthData() {
            if (!this.mouth) {
                throw new Error("Can't call updateMouthData when mouse is undefined")
            }
            this.mouthData = {
                bottomLip: {
                    left: {
                        x: parseFloat(((this.mouth.bottomLip.left.x - this.mouth.x) / this.mouth.scale).toFixed(2)),
                        y: parseFloat(((this.mouth.bottomLip.left.y - this.mouth.y) / this.mouth.scale).toFixed(2)),
                    },
                    center: {
                        x: parseFloat(((this.mouth.bottomLip.center.x - this.mouth.x) / this.mouth.scale).toFixed(2)),
                        y: parseFloat(((this.mouth.bottomLip.center.y - this.mouth.y) / this.mouth.scale).toFixed(2)),
                    },
                    right: {
                        x: parseFloat(((this.mouth.bottomLip.right.x - this.mouth.x) / this.mouth.scale).toFixed(2)),
                        y: parseFloat(((this.mouth.bottomLip.right.y - this.mouth.y) / this.mouth.scale).toFixed(2)),
                    }
                },
                topLip: {
                    left: {
                        x: parseFloat(((this.mouth.topLip.left.x - this.mouth.x) / this.mouth.scale).toFixed(2)),
                        y: parseFloat(((this.mouth.topLip.left.y - this.mouth.y) / this.mouth.scale).toFixed(2)),
                    },
                    center: {
                        x: parseFloat(((this.mouth.topLip.center.x - this.mouth.x) / this.mouth.scale).toFixed(2)),
                        y: parseFloat(((this.mouth.topLip.center.y - this.mouth.y) / this.mouth.scale).toFixed(2)),
                    },
                    right: {
                        x: parseFloat(((this.mouth.topLip.right.x - this.mouth.x) / this.mouth.scale).toFixed(2)),
                        y: parseFloat(((this.mouth.topLip.right.y - this.mouth.y) / this.mouth.scale).toFixed(2)),
                    }
                }
            }

        },
        addCustomState() {
            this.customStates.push(this.mouthData)
        },
        switchState(state:  MouthState | MouthPoints) {
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
                this.updateMouthData()
                if (time >= .64) {
                    clearInterval(interval)
                }
            }, step)
            

            this.updateMouthData()
        },
        displayFPS(targetEl: HTMLElement) {
            this.stats = new StatsJS()
            this.stats.showPanel( 0 ) // 0: fps, 1: ms, 2: mb, 3+: custom
            this.stats.update() // 0: fps, 1: ms, 2: mb, 3+: custom
            this.stats.dom.id = "fpsCanvas"
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
    .button {
        transition: all ease .4s;

        &.__isDisabled {
            cursor: not-allowed;
            filter: grayscale(100%);
        }
    }
</style>