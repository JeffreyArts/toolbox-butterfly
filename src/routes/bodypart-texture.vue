<template>

    <div class="options-overview">
        <header class="title">
            <h1>Bodypart texture</h1>
        </header>

        <hr>
        <section class="viewport bodypart-texture">
            <div class="scroll-container" ref="scroll-container" ratio="1x1">
                <canvas id="paperCanvas" />
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="General">
                    <div class="option">
                        <label for="color1">
                            Color 1
                        </label>
                        <div class="dot" :style="{ backgroundColor: options.color1 }"></div>
                        <select name="color1" id="color1" v-model="options.color1" @change="updateImage">
                            <option v-for="(c,k) in colors" :key="k" :value="c" :style="{ backgroundColor: c }">
                                {{c}}
                            </option>

                        </select>
                        <input type="color" v-model="options.color1" @input="updateImage"/>
                    </div>
                    <div class="option">
                        <label for="color2">
                            Color 2
                        </label>
                        <div class="dot" :style="{ backgroundColor: options.color2 }"></div>
                        <select name="color2" id="color2" v-model="options.color2" @change="updateImage">
                            <option v-for="(c,k) in colors" :key="k" :value="c">
                                {{c}}
                            </option>
                        </select>
                        <input type="color" v-model="options.color2" @input="updateImage"/>
                    </div>
                    
                    <div class="option">
                        <label for="textureType">
                            Texture Type
                        </label>
                        <select name="textureType" id="textureType" v-model="options.textureType" @change="updateImage">
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

                    <div class="option">
                        <label for="textureIndex">
                            Texture Index
                        </label>
                        <input type="number" min="0" :max="texture[options.textureType][options.textureName].length -1" v-model="options.textureIndex" @change="updateImage"/>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import axios from "axios"
import _ from "lodash"
import Paper from "paper"
import paperService from "@/services/paper-js"
    
export default defineComponent ({ 
    props: [],
    data() {
        return {
            ignoreOptionsUpdate: true,
            painting: [] as Array<paper.Path>,
            texture: {
                "360": [],
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

                    ]
                },
                "bottom": [],
                "vert": []
            },
            colors: ["#f09","#9f0","#09f","#f90","#90f"],
            options: {
                textureType: "top",
                textureName: "t1",
                textureIndex: 0,
                color1: "#9f0",
                color2: "#f09",
                strokeWidth: 1,
                strokeColor: "#f90",
            } as any
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
        this.updateCanvas()
        window.addEventListener("resize", this.updateCanvas)
        this.setCountryFromIP()
    },
    unmounted() {
        window.removeEventListener("resize", this.updateCanvas)
    },
    methods: {
        setCountryFromIP() {
            axios.get("http://ip-api.com/json/").then(res => {
                if (res.data.countryCode) {
                    this.options.selectedCountry = res.data.countryCode
                } else {
                    // If it can't be retrieved, just set a random one
                    this.options.selectedCountry = _.shuffle(this.countryList)[0].code
                }
            }).catch(err => {
                // If it can't be retrieved, just set a random one
                this.options.selectedCountry = _.shuffle(this.countryList)[0].code
            })
        },
        updateCanvas() {
            const canvas = this.$el.querySelector("#paperCanvas")
            const el = this.$el.querySelector(".scroll-container")
            
            if (!canvas) {
                console.error("Can't find canvas")
                return
            }

            if (!el) {
                console.error("Can't find element")
                return
            }
            canvas.width = el.clientWidth
            canvas.height = el.clientHeight
            
            paperService.destroy()
            Paper.setup(canvas)
            
            if (Paper.view.viewSize.width != el.clientWidth) {
                Paper.view.viewSize.width = el.clientWidth
            }
            if (Paper.view.viewSize.height != el.clientWidth) {
                Paper.view.viewSize.height = el.clientWidth
            }
            if (this.options.selectedCountry) {
                console.log(Paper,el.clientWidth, el.clientHeight)
                setTimeout(this.updateImage)
                // ()
            }
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
        async updateImage() {
            if (!Paper || !this.$el) {
                return
            }
            console.log("asdf")

            if (this.painting.length > 0) {
                _.each(this.painting, p => {
                    p.remove()
                })
                this.painting.length = 0
            }
            const canvas = this.$el.querySelector("#paperCanvas")
            if (!canvas) {
                console.error("Can't find canvas")
                return
            }
            // const selectedCountry = _.find(this.countryList, country => {
            //     return country.code === this.options.selectedCountry
            // })
            // if (!selectedCountry) {
            //     console.error("No valid country selected")
            //     return
            // }
            
            const width = canvas.getBoundingClientRect().width
            const height = canvas.getBoundingClientRect().height
            
            // draw circle
            const circle = new Paper.Path.Circle({
                center: new Paper.Point(width/2, height/2),
                radius: Math.min(width, height)/2,
                fillColor: new Paper.Color(this.options.color1),
            })
            this.painting.push(circle)


            const svgString = this.texture[this.options.textureType][this.options.textureName][this.options.textureIndex] 

            if (!svgString) {
                throw new Error("No valid texture found")
                return
            }

            Paper.project.importSVG(svgString,
                {
                    onLoad: (item) => {
                        // 1. Eerst SVG resetten naar positie 0,0 zodat bounds correct zijn
                        item.position = new Paper.Point(0, 0)

                        // 2. Verkrijg originele bounding box
                        const svgBounds = item.bounds
                        const viewBounds = Paper.view.bounds

                        // 3. Schaalfactor berekenen (maximale die in canvas past)
                        const scale = Math.min(
                            viewBounds.width / svgBounds.width,
                            viewBounds.height / svgBounds.height
                        )

                        // 4. Schaal toepassen
                        item.scale(scale)

                        // 5. Nu centreren in view
                        item.position = Paper.view.center

                        // 6. Eventueel kleuren aanpassen
                        item.getItems({ class: Paper.Path }).forEach(p => {
                            p.fillColor = this.options.color2
                        })

                        this.painting.push(item)
                    }
                }
            )

            
            // this.painting.push(texture as paper.Item)

            // let prev = null as null | paper.Path
            // _.each(selectedCountry.colors, (color, index) => {
            //     let posTL = {x: 0, y: 0}
            //     let posBL = {x: 0, y: 0}

            //     if (prev) {
            //         posTL.x = prev.segments[1].point.x
            //         posBL.x = prev.segments[2].point.x
            //     }

            //     const topLeft = new Paper.Point(posTL.x,posTL.y)
                
            //     let topRight = new Paper.Point(posTL.x + 100/selectedCountry?.colors.length * width/100, 0) 
            //     if (color.percent) {
            //         topRight = new Paper.Point(posTL.x + color.percent * width/100,0)
            //     } 

            //     const bottomLeft = new Paper.Point(posBL.x,height)
                
            //     let bottomRight = new Paper.Point(posBL.x + 100/selectedCountry?.colors.length * width/100, 0) 
            //     if (color.percent) {
            //         bottomRight = new Paper.Point(posBL.x + color.percent * width/100, height)
            //     } 
            //     const path = new Paper.Path([
            //         topLeft, topRight, bottomRight, bottomLeft
            //     ])
            //     path.fillColor = new Paper.Color(color.hex)
            //     path.closed = true
            //     prev = path
            //     this.painting.push(path) 
            // })
            
        }
    }
})
</script>


<style lang="scss" scoped>

    @import '../assets/scss/variables.scss';
    #paperCanvas {
        aspect-ratio: 1/1;
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
    }
</style>
