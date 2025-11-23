<template>
    <div class="options-overview">
        <header class="title">
            <h1>Color sampler</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ratio="1x1" :style="{backgroundColor: mainColor}">
            </div>
            <footer class="viewport-content-strip" :style="imageGradient" @click="setMainColor"></footer>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Options" >
                    <div v-if="options.colors.length > 0">
                        <div class="option" v-for="(color, key) in options.colors" :key="key">
                            <input type="text" v-model="options.colors[key]" :id="color"/>
                            <label class="option-color-window" :style="{backgroundColor: color}" :for="color"></label>
                        </div>
                    </div>
                    <div class="option" >
                        <label for="options-color">color</label>
                        <input type="text" id="options-color" v-model="options.newColor" v-on:blur="addColor"  v-on:keydown="enterKey"/>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import chroma from "chroma-js"

interface Options {
    newColor: string
    colors: string[]
}

export default defineComponent ({ 
    components: {},
    props: [],
    data() {
        return {
            mainColor: "",
            options: {
                newColor: "",
                colors: []
            } as Options,
            ignoreOptionsUpdate: true,
        }
    },
    computed: {
        imageGradient() {
            return `background: linear-gradient(to right, ${this.options.colors.join(", ")})`
        }
    },
    methods: {
        enterKey(e:KeyboardEvent) {
            if (e.key === "Enter") {
                this.addColor()
            }
        },
        addColor() {
            if (!this.options.newColor) {
                return
            }

            if (!this.options.colors) {
                this.options.colors = []
            }

            
            this.options.colors.push(this.options.newColor.toString())
            this.options.newColor = ""
        },
        setMainColor(e: MouseEvent) {
            const rect = (e.target as HTMLElement).getBoundingClientRect()
            const x = e.clientX - rect.left
            const perc = x / rect.width
            this.mainColor = chroma.scale(this.options.colors)(perc).hex()
        }
    }
})
</script>


<style lang="scss" scoped>

.viewport-content-strip {
    width: 100%;
    background-color: #fff;
    height: 48px;
    border-radius: 8px;
}

.option-color-window {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: inline-block;
    translate: 10px 7px;
}
</style>