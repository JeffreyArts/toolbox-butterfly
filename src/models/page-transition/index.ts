import _ from "lodash"
import domtoimage from "dom-to-image"
import effectSlideDownwards from "./effects/slide-downwards"
import effectFallDownwards from "./effects/fall-downwards"
import effectSplitInHalf from "./effects/split-in-half"
import effectShootingBubble from "./effects/shooting-bubble"
import effectBubbleFromClick from "./effects/bubble-from-click"
import effectSplitInMultipleParts from "./effects/split-in-multiple-parts"

export type Effect = "slide-downwards" | "fall-downwards" | "split-in-half" | "split-in-multiple-parts" | "shooting-bubble" | "bubble-from-click"

export interface PageTransitionEffectOptions {
    devMode: boolean
}

export interface PageTransitionEffect {
    canvas: HTMLCanvasElement,
    duration: number,
    scale: number,
    init:  () => void,
    start: (domElement?: HTMLElement) => Promise<true> | void
    draw:  () => void,
    loop:  () => void,
    finished: boolean,
    devMode: boolean,
    targetElement?: HTMLElement
}

interface PageTransition {
    duration: number
    effect: Effect
    effects: Array<Effect>,
    effectModel: any,
    scale: number,
    devMode: boolean,
    applyScaling: boolean,
    sourceElement: HTMLElement,
    targetElement: HTMLElement,
    canvas: HTMLCanvasElement,
    originalTargetOverflow: string
}

interface PageTransitionOptions {
    duration?: number,
    effect?: Effect,
    devMode?: boolean,
    sourceElement?: HTMLElement,
    targetElement?: HTMLElement
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
                        const parent = domElement.parentElement
                        const offsetY = parent ? parent.scrollTop : domElement.offsetTop
                        const offsetX = parent ? parent.scrollLeft : domElement.offsetLeft
                        
                        overlayContext.drawImage(image, -offsetX, -offsetY)
                    }
                    resolve(dataUrl)
                }
                image.src = dataUrl
            }).catch((err)=> {
                console.error(err)
                reject(err)
            })
        })
    }

    

    draw() {
        if (this.effectModel && typeof this.effectModel.draw === "function") {
            this.effectModel.draw()

            // Scale canvas
            if (this.applyScaling) {
                this.canvas.style.transformOrigin = "0 0"
                this.canvas.style.scale = `${this.scale}`
            }

            if (this.effectModel.finished) {
                this.targetElement.style.overflow = this.originalTargetOverflow
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
        const options = {
            devMode: this.devMode
        }
        switch (this.effect) {
        case "slide-downwards":
            this.effectModel = new effectSlideDownwards(this.canvas, this.duration, options)
            break
        case "fall-downwards":
            this.effectModel = new effectFallDownwards(this.canvas, this.duration, options)
            break
        case "split-in-half":
            this.effectModel = new effectSplitInHalf(this.canvas, this.duration, options)
            break
        case "split-in-multiple-parts":
            this.effectModel = new effectSplitInMultipleParts(this.canvas, this.duration, options)
            break
        case "shooting-bubble":
            this.effectModel = new effectShootingBubble(this.canvas, this.duration, options)
            break
        case "bubble-from-click":
            this.effectModel = new effectBubbleFromClick(this.canvas, this.duration, options)
            break
                            
        default:
            break
        }
    }

    start(startingTarget?: HTMLElement) {
        this.scale = this.targetElement.clientWidth / this.sourceElement.clientWidth 
        this.originalTargetOverflow = this.targetElement.style.overflow

        
        return this.createSnapshot(this.sourceElement).then(() => {
            this.targetElement.style.overflow = "hidden"
            this.createEffectModel()
            if (startingTarget) {
                this.effectModel.start(startingTarget)
            } else {
                this.effectModel.start()
            }
            this.draw()
            this.loop()
        })
    }

    constructor (options?: PageTransitionOptions) {
        
        this.effects = [
            "bubble-from-click",
            "fall-downwards",
            "shooting-bubble",
            "slide-downwards",
            "split-in-half",
            "split-in-multiple-parts",
        ] as Array<Effect>

        this.duration = options?.duration || 1
        this.effect = options?.effect || this.effects[0]
        this.sourceElement = options?.sourceElement || document.body
        this.targetElement = options?.targetElement || this.sourceElement.parentElement || this.sourceElement
        this.devMode = false

        let target = this.sourceElement
        if (options && options.targetElement) {
            target = options.targetElement
            this.applyScaling = true
        }
        if (options && !_.isUndefined(options.devMode)) {
            this.devMode = options.devMode
        }

        let position = "absolute"
        if (target.parentElement) {
            if (
                target.parentElement.nodeName.toLowerCase() === "body" ||
                target.parentElement.nodeName.toLowerCase() === "html"
            ) {
                position = "fixed"
            }
        }

        this.canvas = document.createElement("canvas")
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.canvas.classList.add("page-transition-canvas")
        this.canvas.style.position = position
        this.canvas.style.top = "0"
        this.canvas.style.left = "0"
        this.canvas.style.bottom = "0"
        this.canvas.style.right = "0"
        this.canvas.style.zIndex = "3141592653"
        this.canvas.style.pointerEvents = "none"
        
        const style = getComputedStyle(target)
        if (style) {
            if (style.position != "relative" && style.position != "absolute" && style.position != "fixed") {
                target.style.position = "relative"
            }
        }

        target.append(this.canvas)    
            
        return this
    }
}

export default PageTransition