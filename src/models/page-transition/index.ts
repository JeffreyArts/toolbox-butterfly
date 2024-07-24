import _ from "lodash"
import domtoimage from "dom-to-image"
import effectSlideDownwards from "./effects/slide-downwards"
import effectFallDownwards from "./effects/fall-downwards"

export type Effect = "slide-downwards" | "fall-downwards"

export interface PageTransitionEffect {
    canvas: HTMLCanvasElement,
    duration: number,
    init:  () => void,
    start: () => Promise<true> | void,
    draw:  () => void,
    loop:  () => void,
    finished: boolean
}

interface PageTransition {
    duration: number
    effect: Effect
    effects: Array<Effect>,
    effectModel: any,
    targetElement: HTMLElement,
    canvas: HTMLCanvasElement,
}

interface PageTransitionOptions {
    duration?: number,
    effect?: Effect,
    targetElement?: HTMLElement,
}

class PageTransition  {

    createSnapshot (domElement = document.body) {
        return new Promise<string>((resolve, reject) => {
            if (!domElement) {
                domElement = document.body
            }
            domtoimage.toPng(domElement).then( (dataUrl) => {
                const image = new Image()
                image.onload = () => {
                    const overlayContext = this.canvas.getContext("2d")
                    if  (overlayContext) {
                        overlayContext.drawImage(image, domElement.offsetTop, domElement.offsetLeft)
                    }
                }
                image.src = dataUrl
                resolve(dataUrl)
            }).catch((err)=> {
                console.error(err)
                reject(err)
            })
        })
    }

    

    draw() {
        if (this.effectModel && typeof this.effectModel.draw === "function") {
            this.effectModel.draw()

            if (this.effectModel.finished) {
                return
            }
        }
        requestAnimationFrame(() => this.draw())
    }
    
    
    loop(){
        if (this.effectModel && typeof this.effectModel.loop === "function") {
            this.effectModel.loop()

            if (this.effectModel.finished) {
                return
            }
        }
        requestAnimationFrame(() => this.loop())
    }
    

    createEffectModel() {
        switch (this.effect) {
        case "slide-downwards":
            this.effectModel = new effectSlideDownwards(this.canvas, this.duration)
            break
        case "fall-downwards":
            this.effectModel = new effectFallDownwards(this.canvas, this.duration)
            break
        
        default:
            break
        }
    }

    start() {
        return this.createSnapshot(this.targetElement).then(() => {
            this.createEffectModel()
            this.effectModel.start()
            this.draw()
            this.loop()
        })
    }


    constructor (options?: PageTransitionOptions) {
        
        this.effects = [
            "slide-downwards",
            "fall-downwards"
        ] as Array<Effect>

        this.duration = options?.duration || 1
        this.effect = options?.effect || this.effects[0]
        this.targetElement = options?.targetElement || document.body

        this.canvas = document.createElement("canvas")
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.canvas.classList.add("page-transition-canvas")
        this.canvas.style.position = "fixed"
        this.canvas.style.top = "0"
        this.canvas.style.left = "0"
        this.canvas.style.bottom = "0"
        this.canvas.style.right = "0"
        this.canvas.style.zIndex = "3141592653"
        this.canvas.style.pointerEvents = "none"
        const style = getComputedStyle(this.targetElement)
        if (style) {
            if (style.position != "relative" && style.position != "absolute" && style.position != "fixed") {
                this.targetElement.style.position = "relative"
            }
        }
        this.targetElement.append(this.canvas)    
            
        return this
    }
}

export default PageTransition