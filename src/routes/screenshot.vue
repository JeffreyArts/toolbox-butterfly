<template>

    <div class="options-overview">
        <header class="title">
            <h1>Screenshot</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ref="viewport-content" ratio="1x1">
                <canvas id="main-canvas" />
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="General">
                    <div class="option">
                        <span>
                            <button class="button __is" for="displayMatterJS" @click="updateCanvas">
                                Snap screenshot
                            </button>
                        </span>
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
import domtoimage from "dom-to-image"
    
export default defineComponent ({ 
    props: [],
    data() {
        return {
           
        }
    },
    methods: {
        createScreenshot(domElement:HTMLElement) {
            return new Promise<HTMLImageElement>((resolve, reject) => {

                domtoimage.toPng(domElement).then( (dataUrl) => {
                    var img = new Image()
                    img.src = dataUrl
                    resolve(img)
                }).catch(reject)
            })
        },
        updateCanvas() {
            const canvas = this.$el.querySelector("#main-canvas")
            const ctx = canvas.getContext("2d")
            const el = window.document.body
            
            if (!canvas) {
                console.error("Can't find canvas")
                return
            }

            if (!el) {
                console.error("Can't find element")
                return
            }
            this.createScreenshot(el).then(img => {
                canvas.width = el.clientWidth
                canvas.height = el.clientHeight
                img.onload = function() {
                    ctx.drawImage(img,0,0)
                }
            })
        },
    }
})
</script>


<style lang="scss" scoped>

    @import '../assets/scss/variables.scss';
    #main-canvas {
        max-width: 100%;
    }
</style>
