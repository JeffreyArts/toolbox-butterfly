<template>

    <div class="options-overview">
        <header class="title">
            <h1>Bodypart texture</h1>
        </header>

        <hr>
        <section class="viewport bodypart-texture">
            <div class="scroll-container" ref="scroll-container" ratio="1x1">
                <canvas id="paperCanvas" />
                <div class="texture-indexes">
                    <canvas v-for="(t,k) in currentTexture[options.textureName]" 
                            :key="k"
                            :id="`textureIndex-${k}`"
                            :class="['texture-index']"
                            >
                    </canvas>
                </div>
            </div>

        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="General">
                    <div class="option">
                        <label for="color1">
                            Color 1
                        </label>

                        <label class="ignore-label-styling" for="customColor1">
                            <div class="dot" :style="{ backgroundColor: options.color1 }"></div>
                        </label>
                        <!-- <select name="color1" id="color1" v-model="options.color1" @change="updateImage">
                            <option v-for="(c,k) in colors" :key="k" :value="c" :style="{ backgroundColor: c }">
                                {{c}}
                            </option>
                        </select> -->
                        <input type="color" class="color-picker" id="customColor1" v-model="options.color1" @input="updateImage"/>
                    </div>
                    <div class="option">
                        <label for="color2">
                            Color 2
                        </label>
                        <label class="ignore-label-styling" for="customColor2">
                            <div class="dot" :style="{ backgroundColor: options.color2 }"></div>
                        </label>
                        <!-- <select name="color2" id="color2" v-model="options.color2" @change="updateImage">
                            <option v-for="(c,k) in colors" :key="k" :value="c">
                                {{c}}
                            </option>
                        </select> -->
                        <input type="color" class="color-picker" id="customColor2" v-model="options.color2" @input="updateImage"/>
                    </div>
                    
                    <div class="option">
                        <label for="textureType">
                            Texture Type
                        </label>
                        <select name="textureType" id="textureType" v-model="options.textureType" @change="textureTypeChange">
                            <option v-for="(t,k) in texture" :key="k" :value="k">
                                {{k}}
                            </option>
                        </select>
                    </div>

                    <div class="option">
                        <label for="textureName">
                            Texture Name
                        </label>
                        <select name="textureName" id="textureName" v-model="options.textureName" @change="updateImage">
                            <option v-for="(t,k) in texture[options.textureType]" :key="k" :value="k">
                                {{k}}
                            </option>
                        </select>
                    </div>

                    <div class="option" v-if="texture[options.textureType]">
                        <label for="textureIndex">
                            Texture Index
                        </label>
                        <input type="number" 
                                min="0" :max="texture[options.textureType][options.textureName]?.length -1" 
                                v-model="options.textureIndex" 
                                @change="updateImage"/>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import axios from "axios"
import _, { set } from "lodash"
import Paper from "paper"
import paperService from "@/services/paper-js"
    
export default defineComponent ({ 
    props: [],
    data() {
        return {
            ignoreOptionsUpdate: true,
            paperScopes: [] as Array<paper.PaperScope>,
            painting: [] as Array<paper.Path | paper.Item>,
            texture: {
                "360": {} as Record<string, string[]>,
                "top": {
                    t1: [
                        "/bodyparts/top/t1/1.svg",
                        "/bodyparts/top/t1/2.svg",
                        "/bodyparts/top/t1/3.svg",
                        "/bodyparts/top/t1/4.svg",
                        "/bodyparts/top/t1/5.svg",
                        "/bodyparts/top/t1/6.svg",
                        "/bodyparts/top/t1/7.svg",
                        "/bodyparts/top/t1/8.svg",
                    ],
                    t2: [
                        "/bodyparts/top/t2/1.svg",
                        "/bodyparts/top/t2/2.svg",
                        "/bodyparts/top/t2/3.svg",
                        "/bodyparts/top/t2/4.svg",
                        "/bodyparts/top/t2/5.svg",
                        "/bodyparts/top/t2/6.svg",
                        "/bodyparts/top/t2/7.svg",
                        "/bodyparts/top/t2/8.svg",
                    ],
                    t3: [
                        "/bodyparts/top/t3/1.svg",
                        "/bodyparts/top/t3/2.svg",
                        "/bodyparts/top/t3/3.svg",
                        "/bodyparts/top/t3/4.svg",
                        "/bodyparts/top/t3/5.svg",
                        "/bodyparts/top/t3/6.svg",
                        "/bodyparts/top/t3/7.svg",
                        "/bodyparts/top/t3/8.svg",
                    ],
                    t4: [
                        "/bodyparts/top/t4/1.svg",
                        "/bodyparts/top/t4/2.svg",
                        "/bodyparts/top/t4/3.svg",
                        "/bodyparts/top/t4/4.svg",
                        "/bodyparts/top/t4/5.svg",
                        "/bodyparts/top/t4/6.svg",
                        "/bodyparts/top/t4/7.svg",
                        "/bodyparts/top/t4/8.svg",
                    ],
                } as Record<string, string[]>,
                "bottom": {
                    b1: [
                        "/bodyparts/bottom/b1/1.svg",
                        "/bodyparts/bottom/b1/2.svg",
                        "/bodyparts/bottom/b1/3.svg",
                        "/bodyparts/bottom/b1/4.svg",
                        "/bodyparts/bottom/b1/5.svg",
                        "/bodyparts/bottom/b1/6.svg",
                        "/bodyparts/bottom/b1/7.svg",
                        "/bodyparts/bottom/b1/8.svg",
                    ],
                    b2: [
                        "/bodyparts/bottom/b2/1.svg",
                        "/bodyparts/bottom/b2/2.svg",
                        "/bodyparts/bottom/b2/3.svg",
                        "/bodyparts/bottom/b2/4.svg",
                        "/bodyparts/bottom/b2/5.svg",
                        "/bodyparts/bottom/b2/6.svg",
                        "/bodyparts/bottom/b2/7.svg",
                        "/bodyparts/bottom/b2/8.svg",
                    ]
                } as Record<string, string[]>,
                "vert": {} as Record<string, string[]>
            },
            colors: ["#f09","#9f0","#09f","#f90","#90f"],
            options: {
                textureType: "top" as "360" | "top" | "bottom" | "vert",
                textureName: "t1",
                textureIndex: 0,
                color1: "#9f0",
                color2: "#f09",
                strokeWidth: 1,
                strokeColor: "#f90",
            }
        }
    },
    computed: {
        currentTexture () {
            return this.texture[this.options.textureType]
        }
    },
    watch: {
        "options.selectedCountry": {
            handler(){
                this.updateImage()
            },
            immediate: true
        },
    },
    mounted() {
        this.updateImage()
        window.addEventListener("resize", this.updateImage)
        
    },
    unmounted() {
        window.removeEventListener("resize", this.updateImage)
    },
    methods: {
        textureTypeChange() {
            this.options.textureIndex = 0
            this.options.textureName = Object.keys(this.texture[this.options.textureType])[0]
            setTimeout(() => {
                this.updateImage()
            })
            // this.updateImage()
        },
        // updateCanvas() {
        //     const canvas = this.$el.querySelector("#paperCanvas")
        //     const el = this.$el.querySelector(".scroll-container")
            
        //     if (!canvas) {
        //         console.error("Can't find canvas")
        //         return
        //     }

        //     if (!el) {
        //         console.error("Can't find element")
        //         return
        //     }
        //     canvas.width = el.clientWidth
        //     canvas.height = el.clientHeight
            
        //     paperService.destroy()
        //     Paper.setup(canvas)
            
        //     if (Paper.view.viewSize.width != el.clientWidth) {
        //         Paper.view.viewSize.width = el.clientWidth
        //     }
        //     if (Paper.view.viewSize.height != el.clientWidth) {
        //         Paper.view.viewSize.height = el.clientWidth
        //     }
        //     this.updateImage()
        // },
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
        updateImage() {
            // Verwijder de oude paper scopes
            if (this.paperScopes.length > 0) {
                _.each(this.paperScopes, scope => {
                    scope.remove()
                })
                this.paperScopes.length = 0
            }

            if (!this.$el) {
                return
            }
            this.drawBodyPart("#paperCanvas")
            
            document.querySelectorAll(".texture-index").forEach((canvas, index) => {
                const canvasEl = canvas as HTMLCanvasElement
                this.drawBodyPart(canvasEl, {
                    textureName: this.options.textureName,
                    textureIndex: index,
                    color1: this.options.color1,
                    color2: this.options.color2,
                })
            })
        },
        drawBodyPart(target: string | HTMLCanvasElement, options? : {
            textureName: string,
            textureIndex: number,
            color1: string,
            color2: string,
        }) {

            const paperScope = new Paper.PaperScope()
            
            let canvas: HTMLCanvasElement | null = null
            if (typeof target === "string") {
                canvas = this.$el.querySelector(target)
            } else {
                canvas = target
            }
            if (!canvas) {
                console.error("Can't find canvas")
                return
            }
            paperScope.setup(canvas)

            const width = paperScope.view.bounds.width
            const height = paperScope.view.bounds.height


            if (!options) {
                options = this.options
            }
            
            // draw circle
            new paperScope.Path.Circle({
                center: new paperScope.Point(width/2, height/2),
                radius: Math.min(width, height)/2,
                fillColor: new paperScope.Color(options.color1),
            })
            // this.painting.push(circle)


            const svgString = this.currentTexture[options.textureName][options.textureIndex] 

            if (!svgString) {
                throw new Error("No valid texture found")
                return
            }

            paperScope.project.importSVG(svgString,
                {
                    onLoad: (item: paper.Item) => {
                        // 1. Eerst SVG resetten naar positie 0,0 zodat bounds correct zijn
                        item.position = new paperScope.Point(0, 0)

                        // 2. Verkrijg originele bounding box
                        const svgBounds = item.bounds
                        const viewBounds = paperScope.view.bounds

                        // 3. Schaalfactor berekenen (maximale die in canvas past)
                        const scale = Math.min(
                            viewBounds.width / svgBounds.width,
                            viewBounds.height / svgBounds.height
                        )

                        // 4. Schaal toepassen
                        item.scale(scale)

                        // 5. Nu centreren in view
                        item.position = paperScope.view.center

                        // 6. Eventueel kleuren aanpassen
                        item.getItems({ class: paperScope.Path }).forEach(p => {
                            p.fillColor = new paperScope.Color(options.color2)
                        })

                        // this.painting.push(item)
                    }
                }
            )
            this.paperScopes.push(paperScope)
        }
    }
})
</script>


<style lang="scss" scoped>

    @import '../assets/scss/variables.scss';
    #paperCanvas {
        aspect-ratio: 1/1;
        // transition: .14s ease-in-out;
    }
    .scroll-container {
        overflow: hidden;
    }
    .dot {
        width: 1em;
        aspect-ratio: 1/1;
        border-radius: 100%;
        display: inline-block;
        margin-right: 12px;
        translate: 0px 4px;
        border: 0 none transparent;
    }
    .ignore-label-styling {
        width: auto;
    }
    .color-picker {
        margin-left: 8px;
    }
    .texture-indexes {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 4px;
    }
    .texture-index {
        width: 100%;
        aspect-ratio: 1/1;
    }
</style>
