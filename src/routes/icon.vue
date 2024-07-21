<template>

    <div class="options-overview">
        <header class="title">
            <h1>Site icons</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-container">
                <div class="viewport-content" ratio="1x1" 
                    @mousemove="mouseMoveEvent"
                    @mousedown="mouseDownEvent"
                    >
                    <site-icon :name="options.name" :size="options.size" :custom="customGrid" :transitEffect="options"/>
                </div>
                <ul class="icon-sizes">
                    <li class="extra-extra-large">
                        <site-icon :name="options.name" :transitEffect="options" :size="options.size" :custom="customGrid" activeColor="#fff" inactiveColor="rgba(0, 0, 0,.24)" />
                        65x65px
                    </li>
                    <li class="extra-large">
                        <site-icon :name="options.name" :transitEffect="options" :size="options.size" :custom="customGrid" activeColor="#fff" inactiveColor="rgba(0, 0, 0,.24)" />
                        52x52px
                    </li>
                    <li class="large">
                        <site-icon :name="options.name" :transitEffect="options" :size="options.size" :custom="customGrid" activeColor="#fff" inactiveColor="rgba(0, 0, 0,.24)" />
                        39x39px
                    </li>
                    <li class="medium">
                        <site-icon :name="options.name" :transitEffect="options" :size="options.size" :custom="customGrid" activeColor="#fff" inactiveColor="rgba(0, 0, 0,.24)" />
                        32x32px
                    </li>
                    <li class="small">
                        <site-icon :name="options.name" :transitEffect="options" :size="options.size" :custom="customGrid" activeColor="#fff" inactiveColor="rgba(0, 0, 0,.24)" />
                        26x26px
                    </li>
                    <li class="extra-small">
                        <site-icon :name="options.name" :transitEffect="options" :size="options.size" :custom="customGrid" activeColor="#fff" inactiveColor="rgba(0, 0, 0,.24)" />
                        13x13px
                    </li>
                </ul>
            </div>
            <button class="button" @click="copyCustomGrid()" v-if="customGrid.length > 0">
                <span v-if="copied">Copied!</span>
                <span v-if="!copied">Copy</span>
            </button>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Select icon" >
                    <div class="option">
                        <span>
                            <label for="size">Size</label>
                            <select name="size" id="size" v-model="options.size">
                                <option v-for="(c,k) in ['small', 'medium', 'large']" :key="k" :value="c" >{{sentenceCase(c)}}</option>
                            </select>
                        </span>
                    </div>
                    <div class="option" v-if="options.size === 'small'">
                        <label for="name">Name</label>
                        <select name="name" id="name" v-model="options.name">
                            <option v-for="(c,k) in smallNames" :key="k" :value="c">{{sentenceCase(c)}}</option>
                        </select>
                    </div>
                    <div class="option" v-if="options.size === 'medium'">
                        <label for="name">Name</label>
                        <select name="name" id="name" v-model="options.name">
                            <option v-for="(c,k) in mediumNames" :key="k" :value="c">{{sentenceCase(c)}}</option>
                        </select>
                    </div>
                </div>
                <div class="option-group" name="Transition" >
                    <div class="option">
                        <span>
                            <label for="ease">Ease</label>
                            <select name="ease" id="ease" v-model="options.ease">
                                <option v-for="(c,k) in eases" :key="k" :value="c" >{{c}}</option>
                            </select>
                        </span>
                    </div>
                    <div class="option">
                        <label for="duration">Duration</label>
                        <input type="number" id="duration" v-model="options.duration" step=".1">
                    </div>
                    <div class="option">
                        <label for="delay">Delay</label>
                        <input type="number" id="delay" v-model="options.delay" step=".001">
                    </div>
                    <div class="option">
                        <span>
                            <label for="effect">Effect</label>
                            <select name="effect" id="effect" v-model="options.effect">
                                <option v-for="(c,k) in effects" :key="k" :value="c" >{{sentenceCase(c)}}</option>
                            </select>
                        </span>
                    </div>
                </div>
                <div class="option-group" name="General" >
                    <div class="option">
                        <span>
                            <button class="button" @click="clearCanvas">Clear canvas</button>
                            <button class="button" @click="resetOptions">Reset options</button>
                        </span>
                    </div>
                    <div class="option">
                        <span>
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import _ from "lodash"
import siteIcon from "@/components/site-icon/site-icon.vue"
import {sentenceCase} from "change-case"
interface Options {
    size: "small" | "medium" | "large"
    name:  string
    duration: number
    delay: number
    ease:  string
    effect: "left-to-right" | "right-to-left" | "top-to-bottom" | "bottom-to-top" | "shuffle"

}
export default defineComponent ({ 
    components: {siteIcon},
    props: [],
    data() {
        return {
            copied: false,
            options: {
                size: "medium" as "small" | "medium" | "large",
                name: "empty" as string,
                duration: .48,
                delay: 0.0024,
                ease: "none" as string,
                effect: "left-to-right"  as "left-to-right" | "right-to-left" | "top-to-bottom" | "bottom-to-top" | "shuffle"
            } as Partial<Options>,
            ignoreOptionsUpdate: false,
            eases: ["none", "steps(2)", "steps(3)", "steps(4)","steps(6)", "steps(8)"],
            effects: ["left-to-right", "right-to-left", "top-to-bottom", "bottom-to-top", "shuffle"],
            activeRect: null as null | SVGRectElement,
            mouseDown: false,
            mouseDownStartingValue: false,
            smallNames: [
                "checkbox-checked",
                "checkbox-cross",
                "checkbox-empty",
                "christmas-tree",
                "circle",
                "cross",
                "expand-border",
                "expand",
                "eye",
                "on",
                "off",
                "heart",
                "heart-outline",
                "smileyFace",
                "terminal",
            ],
            mediumNames: [
                "empty",
                "cross",
                "circle",
                "hamburger",
                "leave",
                "speech-bubble",
                "wrench",
            ],
            customGrid: [] as Array<{x: number, y: number, value: boolean}>
        }
    },
    watch: {
        "options.name": {
            handler() {
                this.customGrid = []
            },
            immediate: false,
        },
        "options.size": {
            handler() {
                this.customGrid = []
                if (this.options.size === "small") {
                    this.options.name = this.smallNames[0]
                } else if (this.options.size === "medium") {
                    this.options.name = this.mediumNames[0]
                } else if (this.options.size === "large") {
                    this.customGrid = []
                    for (let y = 0; y < 21; y++) {
                        for (let x = 0; x < 21; x++) {
                            this.customGrid.push({x,y,value: false})
                        }
                    }
                }
            },
            immediate: false,
        },
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
    },
    mounted() {
        document.addEventListener("mouseup", this.mouseUpEvent)
        this.loadOptions()
    },
    unmounted() {
        document.removeEventListener("mouseup", this.mouseUpEvent)
        //
    },
    methods: {
        sentenceCase(v: string) {
            return sentenceCase(v)
        },
        loadOptions() {
            this.ignoreOptionsUpdate = true
            const optionsString = localStorage.getItem("options")
            if (optionsString) {
                const localOptions = JSON.parse(optionsString)
                _.forOwn(this.options, (value,key) => {
                    const typedKey = key as keyof Options
                    if (localOptions[typedKey]) {
                        this.options[typedKey] = localOptions[key]
                    }
                })
            }
            setTimeout(() => {
                this.ignoreOptionsUpdate = false
            })
        },
        resetOptions() {
            this.options = {
                size: "medium",
                name: "leave",
                duration: .48,
                delay: 0.0024,
                ease: "none",
                effect: "left-to-right"
            }
        },
        mouseDownEvent(e:Event) {
            this.mouseDown = true
            if (!e.target) {
                return
            }
            
            if (e.target instanceof SVGRectElement) {
                this.validateCustomGrid(e.target)

                const x = (parseInt(e.target.getAttribute("x") || "0", 10)-1) /10
                const y = (parseInt(e.target.getAttribute("y") || "0", 10)-1) /10
                const customPoint = _.find(this.customGrid, {x, y})
                if (customPoint) {
                    this.mouseDownStartingValue = !customPoint.value
                    customPoint.value = !customPoint.value
                }
            }     
        },
        mouseUpEvent(e:Event) {
            this.mouseDown = false
        },
        mouseMoveEvent(e: Event) {
            if (this.mouseDown === false) {
                return
            }

            if (e.target  instanceof SVGRectElement) {
                
                if (this.activeRect) {
                    return
                }
                this.validateCustomGrid(e.target)
                this.activeRect = e.target

                const x = (parseInt(e.target.getAttribute("x") || "0", 10)-1) /10
                const y = (parseInt(e.target.getAttribute("y") || "0", 10)-1) /10
                const customPoint = _.find(this.customGrid, {x, y})
                
                if (customPoint) {
                    customPoint.value = this.mouseDownStartingValue
                }

            } else {
                this.activeRect = null
            }

        },
        validateCustomGrid(rect: SVGRectElement) {
            if (this.customGrid.length === 0){ 
                let parent = rect.parentElement
                while (parent !== null && parent.nodeName !== "svg") {
                    if (parent === null) {
                        break
                    }
                    parent = parent.parentElement
                }

                if (!parent) {
                    return
                }

                this.createCustomGridFromIcon(parent)
            }
        },
        createCustomGridFromIcon(svg: SVGElement | HTMLElement) {
            const children = svg.querySelectorAll("rect")
            children.forEach(child => {
                if (!child) {
                    return
                }
                const x = child.getAttribute("x") || "0"
                const y = child.getAttribute("y") || "0"
                this.customGrid.push({
                    x: (parseInt(x, 10)-1) /10,
                    y: (parseInt(y, 10)-1) /10,
                    value: child.style.fill === "rgb(51, 51, 51)" ? true : false
                })
            })
        },
        clearCanvas() {
            const targetSVG = document.querySelector(".viewport-content svg") as SVGElement
            if (targetSVG) {
                const children = targetSVG.querySelectorAll("rect")
                children.forEach(child => {
                    if (!child) {
                        return
                    }
                    const x = child.getAttribute("x") || "0"
                    const y = child.getAttribute("y") || "0"
                    this.customGrid.push({
                        x: (parseInt(x, 10)-1) /10,
                        y: (parseInt(y, 10)-1) /10,
                        value: false
                    })
                })
            }
        },
        copyCustomGrid() {

            this.copied = true
            setTimeout(() => {
                this.copied = false
            }, 2000)
            let result = "[\r\n"
            let prevPoint = undefined as undefined | {x:number, y: number, value: boolean}
            const data = [] as Array<Array<0 | 1>>

            _.each(_.sortBy(this.customGrid, "y"), point => {
                if (prevPoint && prevPoint.y != point.y) {
                    result = result.slice(0,-1)
                    result +="],\r\n"
                }

                if (!data[point.y]) {
                    data.push([])
                    result += "\t["
                }
                data[point.y][point.x] = point.value ? 1 : 0
                result += point.value ? 1 : 0
                result += ","

                prevPoint = point
            })
            result = result.slice(0,-1)
            result += "]\r\n]"

            navigator.clipboard.writeText(result)
        }
    }
})
</script>


<style lang="scss" scoped>
    .icon-sizes {
        display: flex;
        margin: 0;
        padding: 0;
        width: 100%;
        justify-content: space-between;
        align-items: center;

        li {
            display: flex;
            margin: 0;
            padding: 0;
            font-size: 8px;
            flex-flow: column;
            width: 64px;
            align-items: center;
            
            svg {
                display: inline-block;
                padding-bottom: 8px;
                width: 100%;
            }

            &.extra-extra-large { width: 65px; }
            &.extra-large { width: 52px; }
            &.large { width: 39px; }
            &.medium { width: 32px; }
            &.small { width: 26px; }
            &.extra-small { width:13px; }
        }
    }
    .viewport-container {
        display: flex;
        width: 100%;
        max-width: 512px;
        flex-flow: column;
        gap: 16px;
        svg {
            display: inline-block;
            width: 100%;
        }
    }

</style>