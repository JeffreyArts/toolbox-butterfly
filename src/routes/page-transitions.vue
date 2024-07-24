<template>
    <div class="options-overview">
        <header class="title">
            <h1>Page transitions</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ratio="1x1" :style="{backgroundColor: viewportColor}">
                {{ options.test }}
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
    },
    mounted() {
        this.loadOptions()
        this.updatePageTransition()
    },
    unmounted() {
        //
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
        updatePageTransition() {
            this.transition = new PageTransition({duration: this.options.duration, effect: this.options.effect})
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
                        this.viewportColor = Color.rgb(Math.random() * 255, Math.random() * 255, Math.random() * 255).hex()
                    })
                })
            }
        }
    }
})
</script>


<style lang="scss" scoped>
</style>