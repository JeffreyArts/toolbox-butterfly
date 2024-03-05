<template>

    <div class="scroll-drop-container">
        <header class="title">
            <h1>Active surface</h1>
        </header>

        <hr>
        <section class="viewport">
            <div class="viewport-content" ref="scrollContainer">
                <div class="scroll-container">
                    <i class="subject" ref="subject"/>
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
                            Aantal blokken
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

    .scroll-drop-container {
        .viewport-content {
            display: flex;
            justify-content: center;
            align-items: center;
            color: $accentColor;
            font-size: 16vw;
            aspect-ratio: 1/1;
            overflow-y: auto;
            position: relative;
            background-color: #2a2a2a;
        }
    }

    .scroll-container {
        height: 100%;
        width: 100%;
        padding-top: 120px;
        padding-bottom: 120px;

        .block {
            width: 80%;
            height: 500px;
            display: block;
            position: relative;
            background-color: #fff;
            + .block {
                margin-top: 80px;
            }

            &.__isLeft {
                float: left;
            }
            &.__isRight {
                float: right;
            }
            &.__isActive {
                background-color: $accentColor;
                color: #fff;
            }
        }

        .block-index {
            position: absolute;
            left: 50%;
            top: 50%;
            translate: -50% -50%;
        }
    }
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
</style>
