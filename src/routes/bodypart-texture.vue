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

                <div class="option-group" name="Identity bitmap">
                    <div class="option">
                        <details class="color-scheme" ref="colorSchemeDropdown">
                            <summary>Color scheme  ( {{ enabledColorSchemes.length }} )</summary>
                            <ul class="color-scheme-list">
                                <li 
                                    v-for="(scheme, index) in enabledColorSchemes" 
                                    :key="scheme.id" 
                                    @click="selectColorScheme(scheme)" 
                                    draggable="true"
                                    @dragstart="onDragStart(scheme)"
                                    @dragover.prevent
                                    @drop="onDrop(scheme)"
                                    class="color-scheme-color-container">
                                    <div class="color-scheme-color">
                                        <span :style="{ backgroundColor: scheme.colors[0] }"></span>
                                        <span :style="{ backgroundColor: scheme.colors[1] }"></span>
                                    </div>
                                    <span class="color-scheme-item-disable" @click="toggleDisabled(scheme, $event)">{{ scheme.disabled ? 'enable' : 'disable' }}</span>
                                </li>

                                <hr style="grid-column: span 5;" v-if="disabledColorSchemes.length > 0">

                                <li v-for="(scheme, index) in disabledColorSchemes" 
                                    :key="index" 
                                    @click="selectColorScheme(scheme)" 
                                    class="color-scheme-color-container __isDisabled">
                                    <div class="color-scheme-color">
                                        <span :style="{ backgroundColor: scheme.colors[0] }"></span>
                                        <span :style="{ backgroundColor: scheme.colors[1] }"></span>
                                    </div>
                                    <span class="color-scheme-item-disable" @click="toggleDisabled(scheme, $event)">{{ scheme.disabled ? 'enable' : 'disable' }}</span>
                                    <span class="color-scheme-item-remove" @click="removeColorScheme(scheme, $event)">❌</span>
                                </li>
                            </ul>
                        </details>
                    </div>

                    <div class="option">
                        <details class="texture-list-container" ref="textureListDropdown">
                            <summary>Texture combinations ( {{ enabledTextureCombinations }} )</summary>
                            <div class="texture-combination-list">
                                <header class="texture-combination-list-header">
                                    <span>Texture name(s)</span>
                                    <span>Stroke</span>
                                    <span>Disabled</span>
                                </header>
                                <li 
                                    v-for="(combination, index) in textureCombinations" 
                                    :key="index" 
                                    :class="['texture-combination-list-item', { __isDisabled: combination.disabled }]">
                                    <span class="texture-combination-description" @click="selectTextureCombination(combination)" >
                                        <span v-if="combination['360']">
                                            {{ combination["360"] }}
                                        </span>
                                        <span v-if="combination.top">
                                            {{ combination.top }}
                                        </span>
                                        <span v-if="combination.bottom">
                                            {{ combination.bottom }}
                                        </span>
                                        <span v-if="combination.vert">
                                            {{ combination.vert }}
                                        </span>
                                    </span>
                                    <span v-text="combination['stroke'] ? '✅' : '❌'" @click="selectTextureCombination(combination)" ></span>
                                    <span>
                                        <input type="checkbox" :id="'disabled-' + index" v-model="combination.disabled" @change="storeTextureCombinations()"><label :for="'disabled-' + index">&nbsp;</label>
                                    </span>
                                </li>
                            </div>
                        </details>
                    </div>
                    <div class="option">
                        <button class="button" @click="exportJSON()">Export JSON</button>
                    </div>
                </div>  
                <div class="option-group" name="Custom">
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


                            <div>
                                <button class="button __isSmall" @click="addColorScheme()">Add color scheme</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="option">
                        <div class="row">
                            <div>
                                <label for="textureType">
                                    Texture 1
                                </label>
                                <select name="textureType" id="textureType" v-model="options.textureType" @change="texture1TypeChange">
                                    <option v-for="(t,k) in texture" :key="k" :value="k">
                                        {{k}}
                                    </option>
                                </select>
                            </div>


                            <div v-if="options.textureType == 'top' || options.textureType == 'bottom'">
                                <label for="texture2Type">
                                    Texture 2
                                </label>
                                <select name="texture2Type"
                                        id="texture2Type"
                                        v-model="options.texture2Name" 
                                        v-if="options.textureType == 'top'"
                                        @change="texture2TypeChange"><br>
                                    <option value="">
                                        None
                                    </option>
                                    <option v-for="(t,k) in texture['bottom']" :key="k" :value="k">
                                        {{k}}
                                    </option>
                                </select>

                                <select name="texture2Type"
                                        id="texture2Type"
                                        v-model="options.texture2Name" 
                                        v-if="options.textureType == 'bottom'"
                                        @change="texture2TypeChange"><br>
                                    <option value="">
                                        None
                                    </option>
                                    <option v-for="(t,k) in texture['top']" :key="k" :value="k">
                                        {{k}}
                                    </option>
                                </select>
                            </div>

                            <div>
                                <input type="checkbox" id="stroke" v-model="options.stroke" @change="updateMainImage(options.textureName, options.textureIndex)"/>
                                <label for="stroke">
                                    Stroke
                                </label>
                            </div>
                        </div>
                    </div>    

                    <!-- <div class="option">
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
                    </div> -->
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
    
interface ColorScheme {
    id: number;
    colors: Array<string>;
    disabled?: boolean;
}

export default defineComponent ({ 
    props: [],
    data() {
        return {
            ignoreOptionsUpdate: true,
            paperScopes: [] as Array<paper.PaperScope>,
            texture: {
                "360": {
                    worms: [
                        "/bodyparts/360/worms/1.svg",
                        "/bodyparts/360/worms/2.svg",
                        "/bodyparts/360/worms/3.svg",
                        "/bodyparts/360/worms/4.svg",
                        "/bodyparts/360/worms/5.svg",
                        "/bodyparts/360/worms/6.svg",
                        "/bodyparts/360/worms/7.svg",
                        "/bodyparts/360/worms/8.svg",
                    ],
                    polkadots: [
                        "/bodyparts/360/polkadots/1.svg",
                        "/bodyparts/360/polkadots/2.svg",
                        "/bodyparts/360/polkadots/3.svg",
                        "/bodyparts/360/polkadots/4.svg",
                        "/bodyparts/360/polkadots/5.svg",
                        "/bodyparts/360/polkadots/6.svg",
                        "/bodyparts/360/polkadots/7.svg",
                        "/bodyparts/360/polkadots/8.svg",
                    ],
                    paths: [
                        "/bodyparts/360/paths/1.svg",
                        "/bodyparts/360/paths/2.svg",
                        "/bodyparts/360/paths/3.svg",
                        "/bodyparts/360/paths/4.svg",
                        "/bodyparts/360/paths/5.svg",
                        "/bodyparts/360/paths/6.svg",
                        "/bodyparts/360/paths/7.svg",
                        "/bodyparts/360/paths/8.svg",
                    ],
                    panter: [
                        "/bodyparts/360/panter/1.svg",
                        "/bodyparts/360/panter/2.svg",
                        "/bodyparts/360/panter/3.svg",
                        "/bodyparts/360/panter/4.svg",
                        "/bodyparts/360/panter/5.svg",
                        "/bodyparts/360/panter/6.svg",
                        "/bodyparts/360/panter/7.svg",
                        "/bodyparts/360/panter/8.svg",
                    ],
                    leafs: [
                        "/bodyparts/360/leafs/1.svg",
                        "/bodyparts/360/leafs/2.svg",
                        "/bodyparts/360/leafs/3.svg",
                        "/bodyparts/360/leafs/4.svg",
                        "/bodyparts/360/leafs/5.svg",
                        "/bodyparts/360/leafs/6.svg",
                        "/bodyparts/360/leafs/7.svg",
                        "/bodyparts/360/leafs/8.svg",
                    ],
                    giraffe: [
                        "/bodyparts/360/giraffe/1.svg",
                        "/bodyparts/360/giraffe/2.svg",
                        "/bodyparts/360/giraffe/3.svg",
                        "/bodyparts/360/giraffe/4.svg",
                        "/bodyparts/360/giraffe/5.svg",
                        "/bodyparts/360/giraffe/6.svg",
                        "/bodyparts/360/giraffe/7.svg",
                        "/bodyparts/360/giraffe/8.svg",
                    ],
                    dots: [
                        "/bodyparts/360/dots/1.svg",
                        "/bodyparts/360/dots/2.svg",
                        "/bodyparts/360/dots/3.svg",
                        "/bodyparts/360/dots/4.svg",
                        "/bodyparts/360/dots/5.svg",
                        "/bodyparts/360/dots/6.svg",
                        "/bodyparts/360/dots/7.svg",
                        "/bodyparts/360/dots/8.svg",
                    ],
                    cow: [
                        "/bodyparts/360/cow/1.svg",
                        "/bodyparts/360/cow/2.svg",
                        "/bodyparts/360/cow/3.svg",
                        "/bodyparts/360/cow/4.svg",
                        "/bodyparts/360/cow/5.svg",
                        "/bodyparts/360/cow/6.svg",
                        "/bodyparts/360/cow/7.svg",
                        "/bodyparts/360/cow/8.svg",
                    ],
                    camo: [
                        "/bodyparts/360/camo/1.svg",
                        "/bodyparts/360/camo/2.svg",
                        "/bodyparts/360/camo/3.svg",
                        "/bodyparts/360/camo/4.svg",
                        "/bodyparts/360/camo/5.svg",
                        "/bodyparts/360/camo/6.svg",
                        "/bodyparts/360/camo/7.svg",
                        "/bodyparts/360/camo/8.svg",
                    ],

                } as Record<string, string[]>,
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
                    t5: [
                        "/bodyparts/top/t5/1.svg",
                        "/bodyparts/top/t5/2.svg",
                        "/bodyparts/top/t5/3.svg",
                        "/bodyparts/top/t5/4.svg",
                        "/bodyparts/top/t5/5.svg",
                        "/bodyparts/top/t5/6.svg",
                        "/bodyparts/top/t5/7.svg",
                        "/bodyparts/top/t5/8.svg",
                    ],
                    t6: [
                        "/bodyparts/top/t6/1.svg",
                        "/bodyparts/top/t6/2.svg",
                        "/bodyparts/top/t6/3.svg",
                        "/bodyparts/top/t6/4.svg",
                        "/bodyparts/top/t6/5.svg",
                        "/bodyparts/top/t6/6.svg",
                        "/bodyparts/top/t6/7.svg",
                        "/bodyparts/top/t6/8.svg",
                    ],
                    t7: [
                        "/bodyparts/top/t7/1.svg",
                        "/bodyparts/top/t7/2.svg",
                        "/bodyparts/top/t7/3.svg",
                        "/bodyparts/top/t7/4.svg",
                        "/bodyparts/top/t7/5.svg",
                        "/bodyparts/top/t7/6.svg",
                        "/bodyparts/top/t7/7.svg",
                        "/bodyparts/top/t7/8.svg",
                    ],
                    t8: [
                        "/bodyparts/top/t8/1.svg",
                        "/bodyparts/top/t8/2.svg",
                        "/bodyparts/top/t8/3.svg",
                        "/bodyparts/top/t8/4.svg",
                        "/bodyparts/top/t8/5.svg",
                        "/bodyparts/top/t8/6.svg",
                        "/bodyparts/top/t8/7.svg",
                        "/bodyparts/top/t8/8.svg",
                    ],
                    t9: [
                        "/bodyparts/top/t9/1.svg",
                        "/bodyparts/top/t9/2.svg",
                        "/bodyparts/top/t9/3.svg",
                        "/bodyparts/top/t9/4.svg",
                        "/bodyparts/top/t9/5.svg",
                        "/bodyparts/top/t9/6.svg",
                        "/bodyparts/top/t9/7.svg",
                        "/bodyparts/top/t9/8.svg",
                    ],
                    t10: [
                        "/bodyparts/top/t10/1.svg",
                        "/bodyparts/top/t10/2.svg",
                        "/bodyparts/top/t10/3.svg",
                        "/bodyparts/top/t10/4.svg",
                        "/bodyparts/top/t10/5.svg",
                        "/bodyparts/top/t10/6.svg",
                        "/bodyparts/top/t10/7.svg",
                        "/bodyparts/top/t10/8.svg",
                    ]
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
                    ],
                    b3: [
                        "/bodyparts/bottom/b3/1.svg",
                        "/bodyparts/bottom/b3/2.svg",
                        "/bodyparts/bottom/b3/3.svg",
                        "/bodyparts/bottom/b3/4.svg",
                        "/bodyparts/bottom/b3/5.svg",
                        "/bodyparts/bottom/b3/6.svg",
                        "/bodyparts/bottom/b3/7.svg",
                        "/bodyparts/bottom/b3/8.svg",
                    ],
                    b4: [
                        "/bodyparts/bottom/b4/1.svg",
                        "/bodyparts/bottom/b4/2.svg",
                        "/bodyparts/bottom/b4/3.svg",
                        "/bodyparts/bottom/b4/4.svg",
                        "/bodyparts/bottom/b4/5.svg",
                        "/bodyparts/bottom/b4/6.svg",
                        "/bodyparts/bottom/b4/7.svg",
                        "/bodyparts/bottom/b4/8.svg",
                    ],
                    b5: [
                        "/bodyparts/bottom/b5/1.svg",
                        "/bodyparts/bottom/b5/2.svg",
                        "/bodyparts/bottom/b5/3.svg",
                        "/bodyparts/bottom/b5/4.svg",
                        "/bodyparts/bottom/b5/5.svg",
                        "/bodyparts/bottom/b5/6.svg",
                        "/bodyparts/bottom/b5/7.svg",
                        "/bodyparts/bottom/b5/8.svg",
                    ],
                    b6: [
                        "/bodyparts/bottom/b6/1.svg",
                        "/bodyparts/bottom/b6/2.svg",
                        "/bodyparts/bottom/b6/3.svg",
                        "/bodyparts/bottom/b6/4.svg",
                        "/bodyparts/bottom/b6/5.svg",
                        "/bodyparts/bottom/b6/6.svg",
                        "/bodyparts/bottom/b6/7.svg",
                        "/bodyparts/bottom/b6/8.svg",
                    ],
                    b7: [
                        "/bodyparts/bottom/b7/1.svg",
                        "/bodyparts/bottom/b7/2.svg",
                        "/bodyparts/bottom/b7/3.svg",
                        "/bodyparts/bottom/b7/4.svg",
                        "/bodyparts/bottom/b7/5.svg",
                        "/bodyparts/bottom/b7/6.svg",
                        "/bodyparts/bottom/b7/7.svg",
                        "/bodyparts/bottom/b7/8.svg",
                    ],
                    b8: [
                        "/bodyparts/bottom/b8/1.svg",
                        "/bodyparts/bottom/b8/2.svg",
                        "/bodyparts/bottom/b8/3.svg",
                        "/bodyparts/bottom/b8/4.svg",
                        "/bodyparts/bottom/b8/5.svg",
                        "/bodyparts/bottom/b8/6.svg",
                        "/bodyparts/bottom/b8/7.svg",
                        "/bodyparts/bottom/b8/8.svg",
                    ]
                } as Record<string, string[]>,
                "vert": {
                    v1: [
                        "/bodyparts/vert/v1/1.svg",
                        "/bodyparts/vert/v1/2.svg",
                        "/bodyparts/vert/v1/3.svg",
                        "/bodyparts/vert/v1/4.svg",
                        "/bodyparts/vert/v1/5.svg",
                        "/bodyparts/vert/v1/6.svg",
                        "/bodyparts/vert/v1/7.svg",
                        "/bodyparts/vert/v1/8.svg",
                    ],
                    v2: [
                        "/bodyparts/vert/v2/1.svg",
                        "/bodyparts/vert/v2/2.svg",
                        "/bodyparts/vert/v2/3.svg",
                        "/bodyparts/vert/v2/4.svg",
                        "/bodyparts/vert/v2/5.svg",
                        "/bodyparts/vert/v2/6.svg",
                        "/bodyparts/vert/v2/7.svg",
                        "/bodyparts/vert/v2/8.svg",
                    ],
                    v3: [
                        "/bodyparts/vert/v3/1.svg",
                        "/bodyparts/vert/v3/2.svg",
                        "/bodyparts/vert/v3/3.svg",
                        "/bodyparts/vert/v3/4.svg",
                        "/bodyparts/vert/v3/5.svg",
                        "/bodyparts/vert/v3/6.svg",
                        "/bodyparts/vert/v3/7.svg",
                        "/bodyparts/vert/v3/8.svg",
                    ],
                    v4: [
                        "/bodyparts/vert/v4/1.svg",
                        "/bodyparts/vert/v4/2.svg",
                        "/bodyparts/vert/v4/3.svg",
                        "/bodyparts/vert/v4/4.svg",
                        "/bodyparts/vert/v4/5.svg",
                        "/bodyparts/vert/v4/6.svg",
                        "/bodyparts/vert/v4/7.svg",
                        "/bodyparts/vert/v4/8.svg",
                    ],
                    v5: [
                        "/bodyparts/vert/v5/1.svg",
                        "/bodyparts/vert/v5/2.svg",
                        "/bodyparts/vert/v5/3.svg",
                        "/bodyparts/vert/v5/4.svg",
                        "/bodyparts/vert/v5/5.svg",
                        "/bodyparts/vert/v5/6.svg",
                        "/bodyparts/vert/v5/7.svg",
                        "/bodyparts/vert/v5/8.svg",
                    ],
                    v6: [
                        "/bodyparts/vert/v6/1.svg",
                        "/bodyparts/vert/v6/2.svg",
                        "/bodyparts/vert/v6/3.svg",
                        "/bodyparts/vert/v6/4.svg",
                        "/bodyparts/vert/v6/5.svg",
                        "/bodyparts/vert/v6/6.svg",
                        "/bodyparts/vert/v6/7.svg",
                        "/bodyparts/vert/v6/8.svg",
                    ],
                    
                } as Record<string, string[]>
            },
            dragData: null as null | { index: number, list: "enabled" | "disabled" },
            movementTimer: 0,
            movementAction: 200,
            catterPillar: null as Catterpillar | null,
            catterPillarScope: null as paper.PaperScope | null,
            catterPillarShapes: [] as Array<{circle: paper.Path | paper.Item, texture?: paper.Path | paper.Item, texture2?: paper.Path | paper.Item}>,
            catterPillarEyes: [] as Array<paper.Path | paper.Item>,
            colorschemes: JSON.parse(localStorage.getItem("colorschemes") || "[]") as Array<ColorScheme>,
            textureCombinations: [] as Array<{top?: string, bottom?: string, vert?: string, "360"?: string, stroke?: boolean, disabled?: boolean}>,
            options: {
                textureType: "top" as "360" | "top" | "bottom" | "vert",
                textureName: "t1",
                textureIndex: 0,
                color1: "#9f0",
                color2: "#f09",
                stroke: false,
                texture2Type: null as "top" | "bottom" | null,
                texture2Name: "b1",
            }
        }
    },
    computed: {
        enabledTextureCombinations() {
            return this.textureCombinations.filter(combination => !combination.disabled).length
        },
        currentTexture () {
            return this.texture[this.options.textureType]
        },
        enabledColorSchemes() {
            return this.colorschemes.filter(scheme => !scheme.disabled)
        },
        disabledColorSchemes() {
            return this.colorschemes.filter(scheme => scheme.disabled)
        }
    },
    async mounted() {
        this.updateImage()
        this.initCatterPillar()
        this.catterPillarScope = new Paper.PaperScope()
        this.catterPillarScope.setup(this.$refs.catterpillarCanvas as HTMLCanvasElement)
        await this.updateMainImage(this.options.textureName, this.options.textureIndex)
        
        
        this.catterPillarScope.view.onFrame = this.updateCatterpillar.bind(this)
        
        requestAnimationFrame(this.checkCatterpillarBounds.bind(this))

        
        const colorSchemeDropdown = this.$refs.colorSchemeDropdown as HTMLElement
        this.addCloseDetailsListener(colorSchemeDropdown)

        const textureListDropdown = this.$refs.textureListDropdown as HTMLElement
        this.addCloseDetailsListener(textureListDropdown)


        // Set texture combinations
        this.textureCombinations = this.generateAllPossibleTextureCombinations()
        const storedCombinations = JSON.parse(localStorage.getItem("textureCombinations") || "[]") as Array<{top?: string, bottom?: string, vert?: string, "360"?: string, stroke?: boolean, disabled?: boolean}>
        
        
        this.textureCombinations.forEach(combination => {
            // Find if this combination is in the stored combinations
            const storedCombination = storedCombinations.find(stored => {
                if (stored["360"] && combination["360"]) {
                    return stored["360"] === combination["360"] && stored.stroke === combination.stroke
                } else if (stored.top && combination.top) {
                    return stored.top === combination.top && stored.bottom === combination.bottom && stored.stroke === combination.stroke
                } else if (stored.bottom && combination.bottom) {
                    return stored.bottom === combination.bottom && stored.top === combination.top && stored.stroke === combination.stroke
                } else if (stored.vert && combination.vert) {
                    return stored.vert === combination.vert && stored.stroke === combination.stroke
                }
            })
            
            combination.disabled = !storedCombination ? true : false
        })

        window.addEventListener("resize", this.updateImage)
        
    },
    unmounted() {
        window.removeEventListener("resize", this.updateImage)
    },
    methods: {
        

        onDragStart(scheme: ColorScheme) {
            this.dragData = { id: scheme.id }
        },

        onDrop(target: ColorScheme) {
            console.log("drop", target, this.dragData)
            if (!this.dragData) return

            const draggedIndex = this.colorschemes.findIndex(
                s => s.id === this.dragData!.id
            )
            const targetIndex = this.colorschemes.findIndex(
                s => s.id === target.id
            )

            const dragged = this.colorschemes[draggedIndex]

            // Verwijderen uit originele positie
            this.colorschemes.splice(draggedIndex, 1)

            // Toevoegen op nieuwe positie
            this.colorschemes.splice(targetIndex, 0, dragged)

            // Opslaan
            localStorage.setItem("colorschemes", JSON.stringify(this.colorschemes))

            this.dragData = null
        },
        exportJSON() {
            const textureCombinations = this.textureCombinations.filter(combination => !combination.disabled).map(combination => {
                return {
                    top: combination.top,
                    bottom: combination.bottom,
                    vert: combination.vert,
                    "360": combination["360"],
                    stroke: combination.stroke
                }
            })

            const colorSchemes = this.colorschemes.filter(scheme => !scheme.disabled).map(scheme => {
                return scheme.colors
            })

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
                colorSchemes,
                textureCombinations
            }))
            const downloadAnchorNode = document.createElement("a")
            downloadAnchorNode.setAttribute("href",     dataStr)
            downloadAnchorNode.setAttribute("download", "bodypart-texture-settings.json")
            document.body.appendChild(downloadAnchorNode) // required for firefox
            downloadAnchorNode.click()
            downloadAnchorNode.remove()
        },
        toggleDisabled(scheme: {colors:Array<string>, disabled?: boolean}, event: Event) {
            event.stopPropagation()
            scheme.disabled = !scheme.disabled
            localStorage.setItem("colorschemes", JSON.stringify(this.colorschemes))
        },
        storeTextureCombinations() {
            // filter out disabled combinations before storing
            const enabledCombinations = this.textureCombinations.filter(combination => !combination.disabled)
            localStorage.setItem("textureCombinations", JSON.stringify(enabledCombinations))
        },
        generateAllPossibleTextureCombinations() {
            const combinations = []  as Array<{top?: string, bottom?: string, vert?: string, "360"?: string, stroke?: boolean}>

            // Add all 360 textures
            Object.keys(this.texture["360"]).forEach(textureName => {
                combinations.push({
                    "360": textureName,
                    stroke: false
                })
                combinations.push({
                    "360": textureName,
                    stroke: true
                })
            })

            // Add all top + bottom combinations
            Object.keys(this.texture["top"]).forEach(topTextureName => {
                Object.keys(this.texture["bottom"]).forEach(bottomTextureName => {
                    combinations.push({
                        top: topTextureName,
                        bottom: bottomTextureName,
                        stroke: false
                    })
                    combinations.push({
                        top: topTextureName,
                        bottom: bottomTextureName,
                        stroke: true
                    })
                })

                // Add top only
                combinations.push({
                    top: topTextureName,
                    stroke: false
                })
                combinations.push({
                    top: topTextureName,
                    stroke: true
                })
            })

            // Add all bottom only combinations
            Object.keys(this.texture["bottom"]).forEach(bottomTextureName => {
                combinations.push({
                    bottom: bottomTextureName,
                    stroke: false
                })
                combinations.push({
                    bottom: bottomTextureName,
                    stroke: true
                })
            })

            // Add all vert only combinations
            Object.keys(this.texture["vert"]).forEach(vertTextureName => {
                combinations.push({
                    vert: vertTextureName,
                    stroke: false
                })
                combinations.push({
                    vert: vertTextureName,
                    stroke: true
                })
            })

            return combinations

        },
        addCloseDetailsListener(htmlElement: HTMLElement) {
            document.addEventListener("click", (event) => {
                const target = event.target as HTMLElement
                if (!target)  {
                    return
                }
                if (!htmlElement.contains(target)) {
                    htmlElement.removeAttribute("open")
                }
            })
        },
        selectTextureCombination(combination: {top?: string, bottom?: string, vert?: string, "360"?: string, stroke?: boolean}) {
            if (combination["360"]) {
                this.options.textureType = "360"
                this.options.textureName = combination["360"]
            } else if (combination.top) {
                this.options.textureType = "top"
                this.options.textureName = combination.top
                this.options.texture2Name = combination.bottom || ""
            } else if (combination.bottom) {
                this.options.textureType = "bottom"
                this.options.textureName = combination.bottom
                this.options.texture2Name = combination.top || ""
            } else if (combination.vert) {
                this.options.textureType = "vert"
                this.options.textureName = combination.vert
            }
            this.options.stroke = !!combination.stroke
            this.updateMainImage(this.options.textureName, this.options.textureIndex)
            this.updateImage()
        },
        importSVGAsync(urlOrString: string, scope: paper.PaperScope) {
            return new Promise((resolve, reject) => {
                try {
                    scope.project.importSVG(urlOrString, (item) => {
                        // if (this.options.textureType == "360") {
                        //     item.rotate(Math.random() * 360)
                        // }
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
            

            this.catterPillar.bodyParts.forEach((bodyPart, i) => {
                if (!this.catterPillarScope) {
                    return
                }
                if (this.catterPillarShapes.length <= i) {
                    return
                }

                const shape = this.catterPillarShapes[i]

                // Update circle
                if (shape.circle) {
                    shape.circle.position.x = bodyPart.x
                    shape.circle.position.y = bodyPart.y
                    shape.circle.fillColor = new this.catterPillarScope.Color(this.options.color1)
                    if (this.options.stroke) {
                        shape.circle.strokeColor = new this.catterPillarScope.Color(this.options.color2)
                        shape.circle.strokeWidth = 1
                    } else {
                        shape.circle.strokeColor = new this.catterPillarScope.Color("transparent")
                    }

                    if (shape.circle.bounds.width / 2 !== bodyPart.radius) {
                        shape.circle.scale(bodyPart.radius / (shape.circle.bounds.width / 2))
                    }
                }

                // Update texture
                if (shape.texture) {
                    shape.texture.position.x = bodyPart.x
                    shape.texture.position.y = bodyPart.y
                    shape.texture.fillColor = new this.catterPillarScope.Color(this.options.color2)

                    if (shape.texture.bounds.width / 2 !== bodyPart.radius) {
                        shape.texture.scale(bodyPart.radius / (shape.texture.bounds.width / 2))
                    }
                }

                // Update texture 2
                if (shape.texture2) {
                    shape.texture2.position.x = bodyPart.x
                    shape.texture2.position.y = bodyPart.y
                    shape.texture2.fillColor = new this.catterPillarScope.Color(this.options.color2)

                    if (shape.texture2.bounds.width / 2 !== bodyPart.radius) {
                        shape.texture2.scale(bodyPart.radius / (shape.texture2.bounds.width / 2))
                    }
                }
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
        async texture1TypeChange() {
            this.options.textureIndex = 0
            this.options.textureName = Object.keys(this.texture[this.options.textureType])[0]
            this.options.texture2Name = ""
            await this.updateMainImage(this.options.textureName, this.options.textureIndex)
            this.updateImage()
        },
        async texture2TypeChange() {
            
            // this.options.textureName = Object.keys(this.texture[this.options.textureType])[0]
            await this.updateMainImage(this.options.textureName, this.options.textureIndex)
            this.updateImage()
        },
        async updateMainImage(textureName: string, textureIndex: number) {
            this.options.textureIndex = textureIndex
            this.options.textureName = textureName
            
            if (this.catterPillar && this.catterPillarScope) {
                // Clear old shapes
                if (this.catterPillarShapes.length > 0) {
                    this.catterPillarShapes.forEach(shape => {
                        shape.circle.remove()
                        if (shape.texture) {
                            shape.texture.remove()
                        }
                        if (shape.texture2) {
                            shape.texture2.remove()
                        }
                    })
                    this.catterPillarShapes = []
                }


                const texture = await this.importSVGAsync(this.currentTexture[this.options.textureName][this.options.textureIndex] , this.catterPillarScope) as paper.Path | paper.Item
                texture.fillColor = new this.catterPillarScope.Color("transparent")
                texture.scale(this.catterPillar.bodyPart.size / (texture.bounds.width/2) )

                let texture2: paper.Path | paper.Item | null = null
                if (["bottom", "top"].includes(this.options.textureType)) {
                    if (this.options.textureType == "top") {
                        this.options.texture2Type = "bottom"
                    } else if (this.options.textureType == "bottom") {
                        this.options.texture2Type = "top"
                    }

                    if (this.options.texture2Type && this.options.texture2Name !== "") {
                        texture2 = await this.importSVGAsync(this.texture[this.options.texture2Type][this.options.texture2Name][this.options.textureIndex] , this.catterPillarScope) as paper.Path | paper.Item
                        texture2.fillColor = new this.catterPillarScope.Color("transparent")
                        texture2.scale(this.catterPillar.bodyPart.size / (texture2.bounds.width/2) )
                    }
                }

                
                
        
                this.catterPillar.bodyParts.forEach((bodyPart, index) => {
                    if (!this.catterPillarScope) {
                        return
                    }
                    const circle = new this.catterPillarScope.Path.Circle({
                        center: new this.catterPillarScope.Point(bodyPart.x, bodyPart.y),
                        radius: bodyPart.radius,
                        fillColor: new this.catterPillarScope.Color(this.options.color1),
                    })
                    const newShapeObject = {circle: circle} as {circle: paper.Path | paper.Item, texture?: paper.Path | paper.Item, texture2?: paper.Path | paper.Item}


                    if (texture) {
                        const textureClone = texture.clone()
                        // Zet de SVG boven de cirkel
                        textureClone.insertAbove(circle)

                        if (index!=0) {
                            newShapeObject.texture = textureClone
                        }
                    }

                    if (texture2) {
                        const texture2Clone = texture2.clone()
                        // Zet de SVG boven de cirkel
                        texture2Clone.insertAbove(circle)

                        newShapeObject.texture2 = texture2Clone
                    }

                    this.catterPillarShapes.push(newShapeObject)

                })

                if (this.catterPillarEyes.length > 0) {
                    this.catterPillarEyes.forEach(eye => {
                        eye.remove()
                    })
                    this.catterPillarEyes = []
                }

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

            const bodyPartOptions = {
                texture: this.currentTexture[textureName][textureIndex],
                color1: this.options.color1,
                color2: this.options.color2,
            } as {
                texture: string,
                texture2?: string,
                color1: string,
                color2: string,
            }

            if (this.options.texture2Type && this.options.texture2Name) {
                bodyPartOptions["texture2"] = this.texture[this.options.texture2Type!][this.options.texture2Name][textureIndex]
            }

            this.drawBodyPart("#paperCanvas")
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

                const bodyPart = {
                    texture: this.currentTexture[textureName][parseInt(textureIndex)],
                    // texture2: this.currentTexture[textureName][parseInt(textureIndex)],
                    color1: this.options.color1,
                    color2: this.options.color2,
                } as {
                    texture: string,
                    texture2?: string,
                    color1: string,
                    color2: string,
                }

                if (this.options.texture2Type && this.options.texture2Name) {
                    bodyPart.texture2 = this.texture[this.options.texture2Type][this.options.texture2Name][0]
                }

                this.drawBodyPart(canvasEl, bodyPart)
            })
        },
        drawBodyPart(target: string | HTMLCanvasElement, options? : {
            texture: string,
            texture2?: string,
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
                options = {
                    color1: this.options.color1,
                    color2: this.options.color2,
                    texture: this.currentTexture[this.options.textureName][this.options.textureIndex],
                }
            }
            
            // draw circle
            new paperScope.Path.Circle({
                center: new paperScope.Point(width/2, height/2),
                radius: Math.min(width, height)/2,
                fillColor: new paperScope.Color(options.color1),
            })


            const svgString = options.texture

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

            // unix timestamp as id
            const id = Date.now()
            const newColorScheme = {id, colors: [this.options.color1, this.options.color2], disabled: false}
           
            this.colorschemes.push(newColorScheme)
            localStorage.setItem("colorschemes", JSON.stringify(this.colorschemes))
        },
        removeColorScheme(scheme: {colors: Array<string>, disabled?: boolean}, event: Event) {
            event.stopPropagation()
            this.colorschemes = this.colorschemes.filter(s => s !== scheme)
            localStorage.setItem("colorschemes", JSON.stringify(this.colorschemes))
        },
        selectColorScheme(scheme: {colors: Array<string>, disabled?: boolean}) {
            this.options.color1 = scheme.colors[0]
            this.options.color2 = scheme.colors[1]
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
        align-items: flex-end;
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
    
    
    .color-scheme {
        width: 100%;
        position: relative;
        z-index: 100;
    }
    
    .color-scheme-list {
        display:grid;
        grid-template-columns: repeat(5, 1fr);
        width: 100%;
        padding: 8px;
        gap: 16px;
        border: 1px solid currentColor;
        margin: 8px 0 0 ;
        position: absolute;
        max-height: 256px;
        overflow: auto;
        background-color: #222;
    }

    .color-scheme-color-container {
        display: flex;
        flex-flow: column;
        align-items: center;
        transition:.2s all ease-in-out;

        &:hover {
            background-color: rgba(0,0,0,0.1);
        }

        &.__isDisabled {
            filter: grayscale(80%);
            &:hover {
                filter: grayscale(0%);
            }
            
            .color-scheme-color:hover {
                scale: 1;
                
            }
        }
    }

    .color-scheme-color {
        aspect-ratio: 1/1;
        display: flex;
        width: 100%;
        overflow: hidden;
        border-radius: 100%;
        rotate: 45deg;
        text-align: center;
        transition: .2s all ease-in-out;
        cursor: pointer;

        &:hover {
            box-shadow: rgba(255, 255, 255, 0.15) 0 0 8px;
            // outline: 1px solid currentColor;
            scale: 1.2;
        }

        span {
            display: block;
            width: 100%;
            height: 100%;
        }
    }

    .color-scheme-item-disable {
        font-size: 10px;
        margin: 0 8px;
        font-family: "Fixedsys", monospace;
        line-height: 16px;
        cursor: pointer;
        display: inline-block;

        &:hover {
            text-decoration: underline;
            color: tomato;
        }
    }

    .texture-combination-list {
        display:grid;
        grid-template-columns: repeat(1, 1fr);
        width: 100%;
        // padding: 8px;
        // gap: 16px;
        border: 1px solid currentColor;
        margin: 8px 0 0 ;
        position: absolute;
        max-height: 256px;
        overflow: auto;
        background-color: #222;
        z-index: 100;
    }

    .texture-combination-list-header {
        background-color: #fff;
        color: #222;
        padding: 8px;
        font-weight: bold;
        width: 100%;
        position: sticky;
        top: 0;
        display: grid;
        z-index: 1;
        grid-template-columns: repeat(8, 1fr);

        > span {
            grid-column: span 2;
            
            &:first-child {
                grid-column: span 4;
            }
            &:last-child {
                grid-column: span 2;
            }
        }
    }


    .texture-combination-list-item {
        padding-top: 4px;
        padding-bottom: 4px;
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        align-items: center;
        transition: .2s all ease-in-out;
        cursor: pointer;
        
        &:hover {
            background-color: rgba(255,255,255,0.1);
        }

        &.__isDisabled {
            opacity: 0.4;
            filter: grayscale(100%);
        }

        > span {
            display: flex;
            grid-column: span 2;

            &:first-child {
                grid-column: span 4;
                padding-left: 8px;
                text-transform: capitalize;
            }
            &:last-child {
                grid-column: span 2;
                label {
                    top: 2px;
                }
            }
        }
    }

    .texture-combination-description {
        span + span {
            &:before {
                margin-left: .25em;
                content: " + ";
            }
        }
    }

    .color-scheme-item-remove {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 12px;
        cursor: pointer;
    }
</style>
