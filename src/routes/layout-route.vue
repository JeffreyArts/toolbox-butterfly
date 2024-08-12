<template>
    <div class="options-overview">
        <header class="title">
            <h1>Layout</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ratio="9x16" :layout-size="options.layoutSize" :layout-gap="options.layoutGap">
                <div class="block" :block-size="block.size" v-for="block,key in options.blocks" :key="key">
                    <div class="pattern" :style="`height:${block.height}px; background-image:url('${block.pattern}')`">{{key}}</div>
                </div>
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">
                <div class="option-group" name="Layout" >
                    <div class="option">
                        <label for="options-layoutSize">Layout size</label>
                        <input type="number" id="options-layoutSize" v-model="options.layoutSize" />
                    </div>
                    <div class="option">
                        <label for="options-layoutGap">Layout gap</label>
                        <input type="number" min="0" id="options-layoutGap" step="4" v-model="options.layoutGap" />
                    </div>
                </div>
                
                <div class="option-group" name="Blocks" >
                    <div class="option" :block-size="block.size" v-for="block,key in options.blocks" :key="key">
                        <div class="option __isRow">
                            <div class="pattern-thumbnail-wrapper">
                                <figure class="pattern-thumbnail" :style="`background-image:url('${block.pattern}')`">
                                    {{ key }}
                                </figure>
                            </div>
                            <div>
                                <label for="options-blockHeight">Height</label>
                                <input type="number" min="16" id="options-blockHeight" step="16" v-model="block.height" />
                            </div>
                            
                            <div>
                                <label for="options-blockSize">Size</label>
                                <input type="number" min="1" id="options-blockSize" step="1" :max="options.layoutSize" v-model="block.size" />
                            </div>
                            <div class="remove-block">
                                <site-icon name="cross" inactiveColor="#222" size="small" @click="removeBlock(block.id)"/>
                            </div>
                        </div>
                        <!-- <div class="pattern" :style="`height:${block.height}px; background-image:url('${block.pattern}')`">{{block.size}}</div> -->
                    </div>
                    <div class="option __isSubmit">
                        <button class="button" @click="addBlock()"><span>add block</span> <site-icon name="plus" inactiveColor="rgba(0,0,0,.6)" size="small"/></button>
                    </div>
                    <!-- <form class="option" @submit="resetOptions">
                        <label for="options-reset">Reset options</label>
                        <button class="button" id="options-reset">Reset</button>
                    </form> -->
                </div>

                <div class="option-group" name="Reset" >

                    <form class="option" @submit="resetOptions">
                        <button class="button" id="options-reset">Reset</button>
                    </form>
                </div>
            </div>
        </aside>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import Packer from "@/models/packer"
import _ from "lodash"
import gsap from "gsap"
import siteIcon from "@/components/site-icon/site-icon.vue"

interface Options {
    blocks: Array<{size: number, pattern: string, height: number, id: number}>
    layoutSize: number
    layoutGap: number
}
interface BlockDimension {
    el:HTMLElement
    top: number
    left: number
    width?: number
    height?: number
    included?:boolean
}

export default defineComponent ({ 
    components: {siteIcon},
    props: [],
    data() {
        return {
            patterns: [
                "patterns/pattern1-black.png",
                "patterns/pattern1-white.png",
                "patterns/pattern3-black.png",
                "patterns/pattern3-white.png",
                "patterns/pattern4-black.png",
                "patterns/pattern4-white.png",
                "patterns/pattern6-black.png",
                "patterns/pattern6-white.png",
                "patterns/pattern7-black.png",
                "patterns/pattern7-white.png",
                "patterns/pattern8-black.png",
                "patterns/pattern8-white.png",
                "patterns/pattern9-black.png",
                "patterns/pattern9-white.png",
            ],
            options: {
                blocks: [],
                layoutSize: 4,
                layoutGap: 40,
            } as Partial<Options>,
            ignoreOptionsUpdate: true,
        }
    },
    watch: {
        "options.layoutGap": {
            handler: "updateLayout",
            immediate: true
        },
        "options.layoutSize": {
            handler() {
                //
                this.options.blocks?.forEach(block => {
                    if (!this.options.layoutSize) {
                        return
                    }
                    if (block.size  > this.options.layoutSize) {
                        block.size = this.options.layoutSize
                    }
                })
                this.updateLayout()   
            },
            immediate: true
        },
        "options.blocks": {
            handler: "updateLayout",
            immediate: true,
            deep: true
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
                    if (_.isArray(value)) {
                        // If the value is an array, copy it directly
                        newOptions[key] = [...value]
                    } else if (_.isObject(value)) {
                        if (!_.isObject(newOptions[key])) {
                            newOptions[key] = {}
                        }
                        // Recursively copy the object properties
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
        if (this.options.blocks && this.options.blocks.length < 1) {
            for (let i=0; i<8; i++) {
                this.addBlock()
            }
        }
        window.addEventListener("resize", this.updateLayout)
    },
    unmounted() {
        window.removeEventListener("resize", this.updateLayout)
        //
    },
    methods: {
        updateLayout() {
            setTimeout(() => {
                const layouts = document.querySelectorAll("[layout-size]")
                layouts.forEach(layout => this.generateLayout(layout))
            })
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
        resetOptions(e:Event) {
            e.preventDefault()
            this.options = {
                blocks: [{
                    size: 2,
                    pattern: this.patterns[0],
                    height: 200,
                    id: 1,
                }],
                layoutGap: 40,
                layoutSize: 4
            }
        },
        generateLayout(layout: Element) {
            if (!layout) {
                throw new Error("Invalid layout")
            }

            const images = layout.querySelectorAll("image, img") 
            const imageLoadedPromises = [] as Array<Promise<void>>
            if (images) {
                images.forEach((image) => {
                    const img = image as HTMLImageElement
                    imageLoadedPromises.push(
                        new Promise<void>((resolve) => {
                            if (img.complete) {
                                resolve()
                            } else {
                                img.addEventListener("load", () => resolve())
                            }
                        })
                    )
                })
            }

            // Set gap
            const gap = layout.getAttribute("layout-gap") ? parseInt(layout.getAttribute("layout-gap") || "40") : 40
            
            // Get all 
            const maxSize = Number(layout.getAttribute("layout-size"))
            // const nodes = layout.querySelectorAll("[block-size]")
            const nodes = layout.querySelectorAll(".block")
            
            if (nodes.length <= 0) {
                console.warn("No nodes found, does layout contain elements with [block-size] property?")
                return
            }
                
            nodes.forEach(node => {
                const block = node as HTMLElement
                block.style.opacity = "0"
            })

            const layoutDimensions = window.getComputedStyle(layout)
        
            Promise.all(imageLoadedPromises).then(() => {
                this.calculateBlocks(nodes, {
                    maxSize,
                    gap: gap,
                    parentWidth:  Math.ceil(parseFloat(layoutDimensions.width))
                    // parentWidth:  Math.round((parseInt(layoutDimensions.width) - gap) / 8) * 8
                })
            })

            
        },
        calculateBlocks(nodes: NodeList, opts: {
            maxSize: number,
            gap: number,
            parentWidth: number
        }) {
            if (!nodes) {
                throw new Error("Missing nodes")
            }

            if (!opts) {
                const opts = {}
            }
            
            if (!opts.maxSize) {
                opts.maxSize = 6
            }

            if (typeof opts.gap === "undefined") {
                opts.gap = 40
            }
            
            const layout = new Packer(opts.parentWidth, 0, {algorithm: "JEF"})
            const layoutRatio = (opts.parentWidth - opts.gap)/opts.maxSize
            const blocks = _.map(nodes, (node, index) => {
                const block = node as HTMLElement

                gsap.to(block, {
                    opacity: 1,
                    ease: "power4.inOut",
                    duration: .32
                })
                const size = Number(block.getAttribute("block-size"))
                
                
                let newWidth = size * layoutRatio
                newWidth = newWidth
                // newWidth = Math.round((newWidth) / 8) * 8
                // newWidth -= opts.gap
                block.style.width = `${newWidth - opts.gap}px`
                const updatedBlock = window.getComputedStyle(block)
                const newHeight = parseInt(updatedBlock.height) + opts.gap
                const newBlock = {width: newWidth, height: newHeight, id: index}
                
                // For dev:
                block.style.display = "none"

                return newBlock
            })
            
            layout.setBlocks(blocks)
        

            // return
            const result = _.map(layout.getOutput(), block => {
                if (!block || typeof block.id === "undefined") {
                    return
                }
                const blockId = Number(block.id)
                return {
                    el: nodes[blockId],
                    top: block.y,
                    left: block.x
                    // width: bix.
                    // height: number
                }
            }) as Array<BlockDimension>
            this.updateBlockPositions(result, {gap: opts.gap})
        },
        updateBlockPositions(blocks: Array<BlockDimension>, opts?: {
            gap?: number
        }) {
            if (!opts) {
                let opts = {}
            }
            let gap = 40
            
            if (opts && typeof opts.gap !== "undefined") {
                gap = opts.gap
            }
            _.each(blocks, block => {
                if (!block) {
                    return
                }
                
                
                block.el.style.position = "absolute"
                block.el.style.display = "block"
                block.el.style.left = `${block.left + gap}px`
                block.el.style.top = `${block.top + gap}px`
                block.el.style.paddingBottom = ""
            })
            
            const lastBlock = _.reverse(_.sortBy(blocks, block => {
                const style = window.getComputedStyle(block.el)
                return parseFloat(style.top) + parseFloat(style.height)
            }))[0]
            lastBlock.el.style.paddingBottom = `${gap}px`
        },
        removeBlock(id: number) {
            if (this.options.blocks) {
                console.log(this.options.blocks)
                const tmp = _.remove(this.options.blocks, {id})
                console.log(tmp)
            }
        },
        addBlock() {

            if (!this.options.blocks) {
                this.options.blocks = []
            }
            const layoutSize = this.options.layoutSize || 6
            const pattern = this.patterns[Math.floor(Math.random() * this.patterns.length)]
            const size = Math.ceil(Math.random() * layoutSize)
            const height = 16 +  Math.round((Math.random() *320) / 8) * 8
            this.options.blocks.push({
                pattern,
                size,
                height,
                id: this.options.blocks.length-1
            })
        }
            
    }
})
</script>


<style lang="scss" scoped>
.viewport .viewport-content {
    background-image: url("/layout-bg.png");
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 40px 0 40px 40px;
    overflow-y: auto;
}

.block {
    display: flex;
    .pattern {
        width: 100%;
        display: flex;
        font-size: 18px;
        font-family: "FixedSys";
        color: #fff;
        text-shadow: -1px -1px 2px #000,  1px -1px 2px #000, -1px 1px 2px #000,  1px 1px 2px #000;
        align-items: center;
        justify-content: center;
        background-repeat: repeat;
        background-size: 16px auto;
    }
}

.option {
    &.__isRow {
        display: flex;
        flex-flow: row;   
        gap: 8px;
    }
}
.pattern-thumbnail-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: end;
    margin-right: 16px;
    width: 40px;
}

.pattern-thumbnail {
    width: 100%;
    aspect-ratio: 1/1;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    font-family: "FixedSys";
    color: #fff;
    background-size: 16px auto;
    text-shadow: -1px -1px 2px #000,  1px -1px 2px #000, -1px 1px 2px #000,  1px 1px 2px #000;
}
.remove-block {
    width: 13px;
    display: flex;
    align-items: flex-end;
    color: #ddd;
    transition: ease all .24s;
    cursor: pointer;

    &:hover {
        color: tomato;
    }

    svg {
        max-width: 100%;
        margin-bottom: 6px;
    }
}
.option.__isSubmit {
    display: flex;
    justify-content: flex-end;

    .button {
        display: flex;
        flex-flow: row;
        justify-content: center;
        align-items: center;
        gap: 8px;
        padding-right: 8px;
        transition: .24s all ease;
        cursor: pointer;

        &:hover {
            scale: 1.1;
        }

        svg {
            height: 13px;
            width: 13px;
            display: flex;
        }
    }
}
</style>