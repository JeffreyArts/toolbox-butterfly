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
                    <span class="texture-type-range" v-for="(textureType, textureName) in texture[options.textureType]" :key="textureName"> 
                        <canvas class="texture-index"
                                v-for="(t,k) in textureType"
                                :key="k"
                                :id="`textureIndex-${textureName}-${k}`"
                                :class="['texture-index']"
                                @mouseenter="updateMainImage(textureName, k)">
                                
                        </canvas>

                    </span>
                </div>
            </div>

        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="General">
                    <div class="option">
                        <div class="row">
                            <div>      
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

                            <div>
                                <label for="color2">
                                    Color 2
                                </label>
                                <label class="ignore-label-styling" for="customColor2">
                                    <div class="dot" :style="{ backgroundColor: options.color2 }"></div>
                                </label>
                                <input type="color" class="color-picker" id="customColor2" v-model="options.color2" @input="updateImage"/>
                            </div>

                            <details class="color-scheme">
                                <summary>Color scheme</summary>
                                <ul>
                                    <li v-for="(scheme, index) in colorschemes" :key="index" @click="selectColorScheme(scheme)">
                                        <div class="color-scheme-color" :style="{ backgroundColor: scheme[0] }"></div>
                                        <div class="color-scheme-color" :style="{ backgroundColor: scheme[1] }"></div>
                                    </li>
                                </ul>
                            </details>
                        </div>
                    </div>
                    <div class="option">
                        <button class="button" @click="addColorScheme()">Add color scheme</button>
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
import _, { set } from "lodash"
import Paper from "paper"
    
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
            colorschemes: JSON.parse(localStorage.getItem("colorschemes") || "[]") as Array<Array<string>>,
            options: {
                textureType: "top" as "360" | "top" | "bottom" | "vert",
                textureName: "t1",
                textureIndex: 0,
                color1: "#9f0",
                color2: "#f09"
            }
        }
    },
    computed: {
        currentTexture () {
            return this.texture[this.options.textureType]
        }
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
        },
        updateMainImage(textureName: string, textureIndex: number) {
            this.options.textureIndex = textureIndex
            this.options.textureName = textureName
            
            this.drawBodyPart("#paperCanvas", {
                textureName: textureName,
                textureIndex: textureIndex,
                color1: this.options.color1,
                color2: this.options.color2,
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
        updateImage() {
            if (!this.$el) {
                return
            }
            this.drawBodyPart("#paperCanvas")
            
            document.querySelectorAll(".texture-index").forEach((canvas, index) => {
                const canvasEl = canvas as HTMLCanvasElement
                const textureIndex = canvasEl.id.split("-")[2]
                const textureName = canvasEl.id.split("-")[1]
                this.drawBodyPart(canvasEl, {
                    textureName: textureName,
                    textureIndex: parseInt(textureIndex),
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
            const paperScope = new Paper.PaperScope()
            paperScope.setup(canvas)

            // Remove old paperScope
            this.paperScopes = this.paperScopes.filter(scope => {
                const match = scope.project.view._id === paperScope.project.view._id
                if (match) {
                    scope.remove()
                }
                return !match
            })

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
                        item.getItems({
                            class: paperScope.Path
                        }).forEach(p => {
                            p.fillColor = new paperScope.Color(options.color2)
                        })
                    }
                }
            )
            this.paperScopes.push(paperScope)
        },
        addColorScheme() {
            const newColorScheme = [this.options.color1, this.options.color2]
           
            this.colorschemes.push(newColorScheme)
            localStorage.setItem("colorschemes", JSON.stringify(this.colorschemes))
        },
        selectColorScheme(scheme: Array<string>) {
            this.options.color1 = scheme[0]
            this.options.color2 = scheme[1]
            this.updateImage()
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
        display: flex;
        justify-content: center;
        align-items: center;
        flex-flow: column;
        gap: 32px;
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
        grid-template-columns: 1fr;
        gap: 8px;
    }
    .texture-type-range {
        display: grid;
        gap: 8px;
        max-width: calc(8 * 32px);
        grid-template-columns: repeat(8, 1fr);
    }
    .texture-index {
        width: 100%;
        aspect-ratio: 1/1;
    }
    .option .row {
        display: flex;
        gap: 16px;
    }
    .color-scheme {
        width: 50%;
        position: relative;

        ul {
            border: 1px solid currentColor;
            margin: 8px 0 0 ;
            padding: 0;
            position: absolute;
            width: 100%;
            
            li {
                display: flex;
                padding: 4px;
                width: 100%;
                &:hover {
                    background-color: rgba(0,0,0,0.1);
                }
            }
        }
        .color-scheme-color {
            height: 16px;
            width: 100px;
        }
    }
</style>
