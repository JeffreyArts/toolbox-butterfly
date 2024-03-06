<template>

    <div class="active-surface-container">
        <header class="title">
            <h1>Active surface</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content">
                <div class="scroll-container" ref="scrollContainer">
                    <div 
                        class="block"
                        b-solid="true"
                        :class="[k%2 == 1 ? '__isLeft' : '__isRight',
                        activeBlock == k ? '__isActive' : ''
                    ]"
                        v-for="(number,k) in amountOfBlocks" :key="k">
                        <span class="block-index">
                            {{ number }}
                        </span>
                    </div>
                </div>
            </div>
        </section>

        <aside class="sidebar">
            <div class="options">

                <div class="option-group" name="Options">
                    <div class="option">
                        <label for="inputNumber">
                            # Blocks
                        </label>
                        <input type="number" id="inputNumber" v-model="amountOfBlocks" step="1" min="1" max="50">
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
            amountOfBlocks: 4,
            activeBlock: 0
        }
    },
    mounted() {
        window.dispatchEvent(new Event("resize"))
        const elScrollContainer = this.$refs["scrollContainer"] as HTMLElement

        if (elScrollContainer)  {
            elScrollContainer.addEventListener("scroll", this.onScroll)
        }

        this.setActiveBlock()
    },
    methods: {
        onScroll(e:Event) {
            const container = e.currentTarget as HTMLElement
            
            if (!container) {
                return
            }

            this.setActiveBlock()
            
        },
        setActiveBlock() {
            const offset = 120
            const elScrollContainer = this.$refs["scrollContainer"] as HTMLElement

            const blocks = elScrollContainer.querySelectorAll("[b-solid]") 
            const treshold = elScrollContainer.scrollTop + elScrollContainer.clientHeight - offset

            blocks.forEach((block,index) => {
                const el = block as HTMLElement

                if (el.offsetTop < treshold) {
                    this.activeBlock = index
                }
            })
        }
    }
})
</script>


<style lang="scss" scoped>

    @import './../assets/scss/variables.scss';

    .subject {
        position: absolute;
        left: 25%;
        display: block;
        width: 24px;
        height: 32px;
        border-radius: 20px 20px 0 0;
        background-color: $accentColor;
        top: 0;
        translate: 0 -32px;
        
        &:after {
            content: "";
            border-radius: 20px;
            width: 24px;
            height: 24px;
            position: absolute;
            top: -24px;
            background-color: $accentColor;
        }
    }

    .scroll-container {
        padding-top: 120px;
        padding-bottom: 120px;
        
        .block {
            color: $accentColor;
            font-size: 16vw;
        }
    }

</style>
