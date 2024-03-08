<template>

    <div class="svg-foreign-object-container">
        <header class="title">
            <h1>SVG Foreign Object</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content">
                <svg width="100%" height="100%" class="svg-foreign-object">
                    <g :style="{
                            transform: `skewX(${skew}deg)`,
                            transformOrigin
                        }">
                        <switch>
                            <!-- select one child element  -->
                            <foreignObject x="0" y="0" requiredFeatures= "http://www.w3.org/TR/SVG11/feature#Extensibility"> 
                                <body xmlns="http://www.w3.org/1999/xhtml">
                                    <p>
                                        This is an XHTML paragraph embedded within an SVG! So this text will wrap nicely around multiple lines, but it will still be skewed from the SVG transform.
                                    </p>
                                </body>
                            </foreignObject>
                            <text x="1em" y="25%" dy="1em">
                                This SVG text won't wrap, so it will get cut off...
                            </text>
                        </switch>
                    </g>
                </svg>
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="Options">
                    <div class="option">
                        <label for="inputNumber">
                            Skew
                        </label>
                        <input type="number" id="inputNumber" v-model="skew" step="1" min="-90" max="90">
                    </div>
                    
                    <div class="option">
                        <label>Transform origin</label>
                        <select v-model="transformOrigin">
                            <option value="center top">Top</option>
                            <option value="center center">Center</option>
                            <option value="center bottom">Bottom</option>
                        </select>
                    </div>
                </div>
            </div>
        </aside>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue"
    
export default defineComponent ({ 
    props: [],
    data() {
        return {
            skew: 16,
            transformOrigin: "center center"
        }
    },
    mounted() {
    },
    methods: {
    }
})
</script>


<style lang="scss" scoped>

    @import './../assets/scss/variables.scss';

    .svg-foreign-object {
        color: #333;
        fill: #222;

        foreignObject {
            width: calc(100% - 40%);
            height: 100%;
        }

        p {
            padding: 16px;
        }
    }

</style>
