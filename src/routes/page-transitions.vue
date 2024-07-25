<template>
    <div class="options-overview">
        <header class="title">
            <h1>Page transitions</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="page-transition-previewer" :style="{backgroundColor: viewportColor}">
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Options" >
                    <div class="option">
                        <label for="options-duration">Duration</label>
                        <input type="number" id="options-duration" step="0.05" v-model="options.duration" />
                    </div>
                    <div class="option" v-if="transition">
                        <label for="options-effect">Select effect</label>
                        <select v-model="options.effect" :selected="options.effect" id="options-effect">
                            <option v-for="(effect, k) in transition.effects" :key="k" :value="effect">
                                {{ effect }}
                            </option>
                        </select>
                    </div>
                    

                    <div class="option">
                        <label>Fullscreen</label>
                        <span>
                            <input type="radio" id="options-fullscreen-true" :checked="options.fullscreen" v-on:input="options.fullscreen = true">
                            <label for="options-fullscreen-true">
                                Yes
                            </label>
                        </span>
                        <span>
                            <input type="radio" id="options-fullscreen-false" :checked="!options.fullscreen" v-on:input="options.fullscreen = false">
                            <label for="options-fullscreen-false">
                                No
                            </label>
                        </span>
                    </div>

                    <div class="option">
                        <label>Dev mode</label>
                        <span>
                            <input type="radio" id="options-devmode-true" :checked="options.devMode" v-on:input="options.devMode = true">
                            <label for="options-devmode-true">
                                Yes
                            </label>
                        </span>
                        <span>
                            <input type="radio" id="options-devmode-false" :checked="!options.devMode" v-on:input="options.devMode = false">
                            <label for="options-devmode-false">
                                No
                            </label>
                        </span>
                    </div>
                    <div class="option" v-if="options.devMode">
                        <label>Only show MatterJS</label>
                        <span>
                            <input type="radio" id="options-showMatterJS-true" :checked="options.showMatterJS" v-on:input="options.showMatterJS = true">
                            <label for="options-showMatterJS-true">
                                Yes
                            </label>
                        </span>
                        <span>
                            <input type="radio" id="options-showMatterJS-false" :checked="!options.showMatterJS" v-on:input="options.showMatterJS = false">
                            <label for="options-showMatterJS-false">
                                No
                            </label>
                        </span>
                    </div>
                    
                    <form class="option" @submit="startTransition">
                        <label for="options-reset">Start transition</label>
                        <button class="button" id="options-reset">Start</button>
                    </form>
                    <form class="option" @submit="resetOptions">
                        <label for="options-reset">Reset options</label>
                        <button class="button" id="options-reset">Reset</button>
                    </form>
                </div>
            </div>
        </aside>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import _ from "lodash"
import Color from "color"
import PageTransition, {Effect} from "@/models/page-transition"

interface Options {
    duration: number
    effect: Effect
    fullscreen: boolean
    showMatterJS: boolean
    devMode: boolean
}

export default defineComponent ({ 
    components: {},
    props: [],
    data() {
        return {
            transition: undefined as PageTransition | undefined,
            viewportColor: "#fff",
            effects: [] as Array<Effect>,
            options: {
                duration: 1,
                showMatterJS: true,
                fullscreen: false,
                devMode: false,
                effect: "slide-downwards",
            } as Partial<Options>,
            ignoreOptionsUpdate: true,
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
        "options.showMatterJS": {
            handler() {
                let el = document.getElementById("pageTransitionMatterJS")
                if (!el) {
                    el = document.createElement("style")
                    el.id = "pageTransitionMatterJS"
                    document.head.appendChild(el)
                }

                el.innerText = `.page-transition-domElement-matter-js { opacity:${this.options.showMatterJS ? "1" : ".5"} !important;}`
            },
            immediate: true
        }
    },
    mounted() {
        this.loadOptions()
        this.updatePageTransition()
        this.resizePageTransitionPreviewer()
        window.addEventListener("resize", this.resizePageTransitionPreviewer)
    },
    unmounted() {

        const el = document.getElementById("app")
        if (!el) {
            throw new Error("Can't find #app")
        }
        el.style.backgroundColor = ""
        window.removeEventListener("resize", this.resizePageTransitionPreviewer)
    },
    methods: {
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
        resetOptions(e:Event) {
            e.preventDefault()
            this.options = {
                duration: .48,
                effect: "slide-downwards"
            }
        },
        resizePageTransitionPreviewer() {
            const ratio = window.innerHeight / window.innerWidth
            const domElement = this.$el.querySelector(".page-transition-previewer") 
            domElement.style.width = "100%"
            domElement.style.height = `${domElement.clientWidth * ratio}px`

        },
        updatePageTransition() {
            this.transition = new PageTransition({
                duration: this.options.duration,
                targetElement: this.options.fullscreen ? undefined :  this.$el.querySelector(".page-transition-previewer") ,
                devMode: this.options.devMode,
                effect: this.options.effect
            })
        },
        startTransition(e:Event) {
            e.preventDefault()
            const oldCanvasses = document.querySelectorAll(".page-transition-canvas")
            if (oldCanvasses.length > 1) {
                _.each(oldCanvasses, canvas => {canvas.remove() })
            }
            if (oldCanvasses.length === 0) {
                this.updatePageTransition()
            }

            if (this.transition) {  
                this.transition.start().then(() => {
                    setTimeout(() => {
                        const el = document.getElementById("app")
                        if (!el) {
                            throw new Error("Can't find #app")
                        }
                        if (this.options.fullscreen) {
                            el.style.backgroundColor = Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).hex()
                        }
                    })
                })
            }
        }
    }
})
</script>


<style lang="scss" scoped>
.page-transition-previewer {
    overflow: hidden;
    @media all and (min-width: 640px) {
        margin-top: 32px;
    }
}
</style>