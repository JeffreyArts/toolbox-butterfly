<template>

    <div class="options-overview">
        <header class="title">
            <h1>Bodypart texture</h1>
        </header>

        <div class="matter-canvas" ref="matterCanvas"/>
        <canvas id="catterpillar-canvas" ref="catterpillarCanvas"/>
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
                                        <span class="color-scheme-remove" @click="removeColorScheme(index)">remove</span>
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
import _ from "lodash"
import Paper from "paper"
import Matter from "matter-js"
import MatterService from "@/services/matter-js"
import Catterpillar from "@/models/catterpillar"
    
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
            movementTimer: 0,
            movementAction: 200,
            catterPillar: null as Catterpillar | null,
            catterPillarScope: null as paper.PaperScope | null,
            catterPillarShapes: [] as Array<{circle: paper.Path | paper.Item, texture: paper.Path | paper.Item}>,
            catterPillarEyes: [] as Array<paper.Path | paper.Item>,
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
    async mounted() {
        this.updateImage()
        this.initCatterPillar()
        this.catterPillarScope = new Paper.PaperScope()
        this.catterPillarScope.setup(this.$refs.catterpillarCanvas as HTMLCanvasElement)
        
        if (this.catterPillar) {
             
            const texture = await this.importSVGAsync( "/bodyparts/top/t1/3.svg", this.catterPillarScope) as paper.Path | paper.Item
            texture.fillColor = new this.catterPillarScope.Color("transparent")
            texture.scale(this.catterPillar.bodyPart.size / (texture.view.bounds.width / 2)*1.2)
            // reverse this.catterPillar.bodyParts
            this.catterPillar.bodyParts.forEach(bodyPart => {
                if (!this.catterPillarScope) {
                    return
                }
                const circle = new this.catterPillarScope.Path.Circle({
                    center: new this.catterPillarScope.Point(bodyPart.x, bodyPart.y),
                    radius: bodyPart.radius,
                    fillColor: new this.catterPillarScope.Color(this.options.color1),
                })
                const textureClone = texture.clone()
                // Zet de SVG boven de cirkel
                textureClone.insertAbove(circle)
                this.catterPillarShapes.push({circle: circle, texture: textureClone})
            })

            this.catterPillarEyes.push(new this.catterPillarScope.Path.Ellipse({
                ...this.catterPillar.eye.left
            }))
            this.catterPillarEyes.push(new this.catterPillarScope.Path.Ellipse({
                ...this.catterPillar.eye.right
            }))
            this.catterPillarEyes.push(new this.catterPillarScope.Path.Ellipse({
                ...this.catterPillar.eye.left.pupil
            }))
            this.catterPillarEyes.push(new this.catterPillarScope.Path.Ellipse({
                ...this.catterPillar.eye.right.pupil
            }))
        }
        
        this.catterPillarScope.view.onFrame = this.updateCatterpillar.bind(this)
        
        requestAnimationFrame(this.checkCatterpillarBounds.bind(this))
        window.addEventListener("resize", this.updateImage)
        
    },
    unmounted() {
        window.removeEventListener("resize", this.updateImage)
    },
    methods: {
        importSVGAsync(urlOrString: string, scope: paper.PaperScope) {
            return new Promise((resolve, reject) => {
                try {
                    scope.project.importSVG(urlOrString, function(item) {
                        resolve(item)
                    })
                } catch (error) {
                    reject(error)
                }
            })
        },
        updateCatterpillar() {
            
            if (!this.catterPillar) {
                return
            }
            

            this.catterPillar.bodyParts.reverse().forEach((bodyPart, i) => {
                if (!this.catterPillarScope) {
                    return
                }

                const shape = this.catterPillarShapes[i]

                // Update centrum
                shape.circle.position.x = bodyPart.x
                shape.circle.position.y = bodyPart.y
                shape.texture.position.x = bodyPart.x
                shape.texture.position.y = bodyPart.y

                // Als de radius dynamisch verandert → updaten:
                if (shape.circle.bounds.width / 2 !== bodyPart.radius) {
                    shape.circle.scale(bodyPart.radius / (shape.circle.bounds.width / 2))
                    shape.texture.scale(bodyPart.radius / (shape.texture.bounds.width / 2))
                }

                // Als kleur verandert:
                shape.circle.fillColor = new this.catterPillarScope.Color(this.options.color1)
                shape.circle.strokeColor = new this.catterPillarScope.Color(this.options.color2)
                
                shape.texture.fillColor = new this.catterPillarScope.Color(this.options.color2)
            })

            this.catterPillarEyes.forEach((eye, i) => {
                if (!this.catterPillarScope || !this.catterPillar) {
                    return
                }
                const catterPillarEye = this.catterPillar.eye[i%2 === 0 ? "left" : "right"]
                if (i < 2) {
                    eye.fillColor = new this.catterPillarScope.Color("white")
                    eye.strokeColor = new this.catterPillarScope.Color("black")
                    eye.position.x = catterPillarEye.x
                    eye.position.y = catterPillarEye.y
                    return
                }
                
                const pupil = this.catterPillar.eye[i%2 === 0 ? "left" : "right"].pupil
                pupil.fillColor = new this.catterPillarScope.Color("black")
                pupil.strokeColor = new this.catterPillarScope.Color("transparent")
                pupil.position.x = catterPillarEye.x + catterPillarEye.pupilOffset.x
                pupil.position.y = catterPillarEye.y + catterPillarEye.pupilOffset.y
            })
        },
        initCatterPillar() {

            // Create ground
            const el = this.$refs.matterCanvas as HTMLElement

            const mjs = MatterService.init(this.$refs.matterCanvas as HTMLElement)  
            this.catterPillar = new Catterpillar(mjs.world, {x:el.clientWidth / 2, y: 8, length: 8, bodyPart: { size: 8 }, autoBlink: true})

            Matter.Composite.add(mjs.world, [
                this.catterPillar.composite
            ])


            const ground = Matter.Bodies.rectangle(el.clientWidth/2, el.clientHeight+160, el.clientWidth, 348, {
                isStatic: true,
                label: "ground",
                friction: 1,
                collisionFilter: {
                    // category: 2,create
                    // mask: 1
                }
            })
            
            // add all of the bodies to the world
            Matter.Composite.add(mjs.world, [ground])
        },
        checkCatterpillarBounds() {
            if (!this.catterPillar) {
                return
            }
            
            if (this.movementTimer > this.movementAction) {
                const direction = Math.random() < .5 ? "left" : "right"
                
                this.catterPillar.move(direction)
                this.movementTimer = 0
                this.movementAction = 100 + Math.random() * 200   
            }

            const el = this.$refs.matterCanvas as HTMLElement
            if (this.catterPillar.y > el.clientHeight + 200) {
                const world = this.catterPillar.world
                this.catterPillar.remove()
                this.catterPillar = new Catterpillar(world, {x:el.clientWidth / 2, y: 8,length: 8, bodyPart: { size: 16 }, autoBlink: true})

                Matter.Composite.add(world, [
                    this.catterPillar.composite
                ])
            }

            this.movementTimer ++
            requestAnimationFrame(this.checkCatterpillarBounds.bind(this))
        },
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
        removeColorScheme(index: number) {
            this.colorschemes.splice(index, 1)
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
    .options-overview {
        &:before {
            content: "";
            position: absolute;
            inset: 0 0 0 0;
            z-index: -1;
            background-image: linear-gradient(0deg, #fff 16%, #222 20%);
        }
    }
    #paperCanvas {
        aspect-ratio: 1/1;
        // transition: .14s ease-in-out;
    }
    .scroll-container {
        background-color: #fafafa;
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
            max-height: 132px;
            overflow: auto;
            background-color: #222;
            
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
    #catterpillar-canvas,
    .matter-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
    }
    .matter-canvas {
        opacity: 0;
    }
    .color-scheme-remove {
        font-size: 10px;
        margin: 0 8px;
        font-family: "Fixedsys", monospace;
        line-height: 16px;
        cursor: pointer;

        &:hover {
            text-decoration: underline;
            color: tomato;
        }
    }
</style>
