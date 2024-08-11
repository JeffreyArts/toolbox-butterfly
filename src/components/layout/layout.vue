<template>
    <svg class="site-icon" version="1.1" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" xmlns="http://www.w3.org/2000/svg">
        <g v-if="displayGrid.length > 0">
            <rect class="site-icon-cell" v-for="(cell,x) in displayGrid" :key="x"
                :x="1 + cell.x * 10" 
                :y="1+ cell.y * 10" 
                width="8" 
                height="8"
                :style="`fill:${cell.color};`"
                />
        </g>
    </svg>
</template>

<script lang="ts">
import {defineComponent, PropType} from "vue"
import _ from "lodash"

export default defineComponent ({
    name: "LayoutComponent", 
    props: {
    },
    data() {
        return {
        }
    },
    computed: {
    },
    watch:{
    },
    mounted() {
        //
    },
    unmounted() {
        //
    },
    methods: {
        
    }
})

</script>

<style lang="scss">
@import './../../assets/scss/variables.scss';


</style>