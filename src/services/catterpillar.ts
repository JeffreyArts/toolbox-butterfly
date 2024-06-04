import _ from "lodash"
import Matter from "matter-js"

export type CatterpillarOptions = {
    length: number,
    maxVelocity: number,
    stiffness?: number, 
    damping?: number, 
    restitution?: number,
    floppiness?: number,
    bodyPart: CatterpillarBodyPartOptions
} & { [key: string]: number }

export type CatterpillarBodyPartOptions = {
    size: number,
    stiffness?: number,
    damping?: number,
    slop?: number,
    points?: number,
    restitution?: number,
}

export type Catterpillar = {
    eyes: {
        blink: () => void,
        startBlinking: () => void,
        stopBlinking: () => void,
        blinkInterval?: number,
        autoBlink: boolean,
        left?: {
            width: number,
            height: number,
            lid: paper.Path,
            pupil: paper.Path,
            sclera: paper.Path,
            isOpen: boolean,
        },
        right?: {
            width: number,
            height: number,
            lid: paper.Path,
            pupil: paper.Path,
            sclera: paper.Path,
            isOpen: boolean,
        },
    },
    mouth: {
        move: (state: "😮" | "🙂" ) => void
    }
}

import Paper from "paper"
import gsap from "gsap"

class Eye  {
    lid: null | paper.Path
    x: number
    y: number
    width: number
    height: number
    pupil: null | paper.Path
    sclera: null | paper.Path
    isBlinking: boolean
    blinkInterval: number
    blinked: number
    autoBlink: undefined | number 

    startBlinking() {
        this.updateBlinkInterval()
    }
    
    stopBlinking() {
        this.autoBlink = undefined
    }

    updateBlinkInterval() {
        if (!this.autoBlink || this.autoBlink === undefined) {
            clearTimeout(this.autoBlink)
            return
        }
        this.autoBlink = setTimeout(() => {
            this.blink()
            setTimeout(() => {
                if (this.blinked % 3 == 0) {
                    this.blink()
                }
            }, 580) // Dunno what this timeout is for
            this.updateBlinkInterval()
        }, this.blinkInterval)
    }

    blink() {
        if (this.isBlinking) {
            return
        }
        this.isBlinking = true
        this.blinked ++

        if (!this.lid ) {
            return console.error("Lid is not defined")
        }

        const start = {
            perc: 0
        }
        const startPos = this.lid.position.y
        const startPosTop = this.lid.segments[1].point.y
        const startPosBottom = this.lid.segments[3].point.y
        
        gsap.to(start, {
            perc: 1,
            duration: .24,
            ease: "power3.in",
            onUpdate: () => {
                // Update Right eye
                if (this.lid && this.sclera) {
                    this.lid.segments[1].point.y = this.lid.position.y - (5 - start.perc * 5)
                    this.lid.segments[3].point.y = this.lid.position.y + (5 - start.perc * 5)
                    this.lid.smooth({ type: "continuous"})
                    
                    this.sclera.segments[1].point.y = this.lid.segments[1].point.y 
                    this.sclera.segments[3].point.y = this.lid.segments[3].point.y 
                    this.sclera.smooth({ type: "continuous"})
                }
            },
            onComplete: () => {
                if (!this.lid ) {
                    return console.error("Lid is not defined")
                }
                const end = {
                    perc: 0
                }

                gsap.to(end, {
                    perc: 1,
                    duration: .32,
                    ease: "power3.out",
                    onUpdate: () => {
                        // Update Right eye
                        if (this.lid && this.sclera) {
                            this.lid.segments[1].point.y = this.lid.position.y - (end.perc * 5)
                            this.lid.segments[3].point.y = this.lid.position.y + (end.perc * 5)
                            this.lid.smooth({ type: "continuous"})

                            this.sclera.segments[1].point.y = this.lid.segments[1].point.y 
                            this.sclera.segments[3].point.y = this.lid.segments[3].point.y 
                            this.sclera.smooth({ type: "continuous"})
                        }
                    },
                    onComplete: () => {
                        if (this.lid) {
                            this.lid.segments[0].point.y = startPos
                            this.lid.segments[1].point.y = startPosTop
                            this.lid.segments[2].point.y = startPos
                            this.lid.segments[3].point.y = startPosBottom
                            
                            _.each(this.lid.segments, (v,i) => {
                                if (!this.sclera || !this.lid) {
                                    return
                                }
                                this.sclera.segments[i].point.y = this.lid.segments[i].point.y  
                                this.sclera.smooth({ type: "continuous"})
                            })
                        }
                        this.isBlinking = false
                    },
                })
            },
        })
            
    }

    updatePosition() {
        if (!this.pupil) {
            return console.error("Missing pupil")
        }
        if (!this.lid) {
            return console.error("Missing lid")
        }
        if (!this.sclera) {
            return console.error("Missing sclera")
        }

        this.lid.position.y = this.y
        this.lid.position.x = this.x 

        this.pupil.position.y = this.y
        this.pupil.position.x = this.x 

        this.sclera.position.y = this.y
        this.sclera.position.x = this.x 
    }

    movePupil(pupil:{x: number, y: number}) {
        if (!this.pupil) {
            return console.error("Missing pupil")
        }

        this.pupil.position.x = pupil.x
        this.pupil.position.y = pupil.y
    }
    
    constructor (
        x = 0 as number,
        y = 0 as number,width = 8 as number,
        height = 10 as number,
        options = {
            blinkInterval: 3200 
        }
    ) {
        this.blinked = 0
        this.isBlinking = false
        this.blinkInterval = options.blinkInterval
        this.x = x
        this.y = y
        this.width = width
        this.height = height

        this.lid = new Paper.Path([
            new Paper.Point(width * 0,   height * 0.5),
            new Paper.Point(width * 0.5, height * 0),
            new Paper.Point(width * 1,   height * 0.5),
            new Paper.Point(width * 0.5, height * 1),
        ])
        this.sclera = this.lid.clone()
        this.pupil = new Paper.Path.Ellipse({x: 0, y:0, width: Math.min(width,height)/2, height: Math.min(width,height)/2})

        //// Set colors
        this.pupil.fillColor    = new Paper.Color("#222")
        this.sclera.fillColor   = new Paper.Color("#fff")
        this.sclera.strokeColor = new Paper.Color("#222")

        //// Set lid mask
        const lidGroup = new Paper.Group([this.lid, this.pupil])
        lidGroup.clipped = true

        this.updatePosition()

        return new Proxy(this, {
            set: function (target, key, value) {
                console.log(`${key} set to ${value}`)
                if (key === "x" || key === "y") {
                    target.updatePosition()
                }
                if (key === "autoBlink") {
                    if (value) {
                        target.startBlinking()
                    } else {
                        target.stopBlinking()
                    }
                }
                return true
            }
        })
    }
}

class catterpillar  {
    eye = {
        left: null as any,
        right: null as any,
    }
    x: number
    y: number
    bodyPart: CatterpillarBodyPartOptions
    stiffness: number
    bodyLength: number
    damping: number
    maxVelocity: number
    restitution: number
    floppiness: number
    composite: Matter.Composite
    constraint: Matter.Constraint

    constructor (x:number,y:number, options?: CatterpillarOptions) {
        this.bodyPart = {
            size: 8,
            stiffness: .16,
            damping: .2,
            restitution: .8
        }
        
        this.x = x
        this.y = y

        // Complete options with default values
        if (!options) {
            options = {
                length: 8,
                stiffness: .8, 
                damping: .8, 
                maxVelocity: 3,
                floppiness: .5,
                restitution: .8,
            } as CatterpillarOptions
        }

        this.bodyLength     = options.length        ? options.length        : 8
        this.stiffness      = options.stiffness     ? options.stiffness     : 0.8
        this.maxVelocity    = options.maxVelocity   ? options.maxVelocity   : 3
        this.floppiness     = options.floppiness    ? options.floppiness    : .5
        this.damping        = options.damping       ? options.damping       : .1
        this.restitution    = options.restitution   ? options.restitution   : 0.8
        
        if (options.bodyPart) {
            if (options.bodyPart.slop)        { this.bodyPart.slop          = options.bodyPart.size }
            if (options.bodyPart.size)        { this.bodyPart.size          = options.bodyPart.size }
            if (options.bodyPart.stiffness)   { this.bodyPart.stiffness     = options.bodyPart.stiffness } 
            if (options.bodyPart.damping)     { this.bodyPart.damping       = options.bodyPart.damping } 
            if (options.bodyPart.restitution) { this.bodyPart.restitution   = options.bodyPart.restitution } 
        }
        
        // All options set, now call the helper functions to create the catterpillar
        this.composite = this.#createBodyParts()
        this.constraint = this.#createBodyConstraint(this.composite)

        this.eye.left = new Eye(x,y)
        this.eye.right = new Eye(x,y)
        
        // return { composite, constraint }
    }
    #createBodyPart () {
        return Matter.Bodies.circle(0, 0, this.bodyPart.size/2, { 
            collisionFilter: { group: 1 }, 
            restitution: this.bodyPart.restitution,
            slop: this.bodyPart.slop ? this.bodyPart.slop : this.bodyPart.size/5,
            label: "partBody"
        })
    }
    #createBodyParts () : Matter.Composite {
        const bodyParts = Matter.Composites.stack(this.x, this.y, this.bodyLength, 1, this.bodyPart.size + 1, 0, (x:number, y:number) => {
            return this.#createBodyPart()
        })
        console.log("X", this.x)

        _.each(bodyParts.bodies, (body,i) => {
            const x =  this.x + (this.bodyPart.size * i) + this.bodyPart.size/2
            const y =  0.05 + (Math.abs(i - this.bodyLength/2) + (Math.abs(i - this.bodyLength/2)) / 2) *1
            Matter.Body.set(body, "position", {x, y})
        })
        
        // Matter
        const composite = Matter.Composite.create({
            bodies: bodyParts.bodies,
            label: "catterpillar",
        })
        
        let prev = null as null | Matter.Body
        _.each(composite.bodies, bodyPart => {
            if (prev) {
                Matter.Composite.add(composite, [
                    Matter.Constraint.create({
                        bodyA: bodyPart,
                        bodyB: prev,
                        pointA: {x: this.bodyPart.size/2, y:0},
                        pointB: {x: 0, y:0},
                        length: this.bodyPart.size * this.floppiness,
                        stiffness: this.bodyPart.stiffness,
                        label: "bodyPartConnection",
                        render: {
                            strokeStyle: "#444",
                            type:"line",
                        }
                    }),
                ])
            }
            prev = bodyPart
        })

        composite.label = "catterpillar"
        return composite
    }
    #createBodyConstraint(catterpillarBody: Matter.Composite) : Matter.Constraint {
        const head = catterpillarBody.bodies[0]
        const butt = catterpillarBody.bodies[catterpillarBody.bodies.length-1]

        console.log("stiffness", this.stiffness, "damping", this.damping, "length", (this.bodyPart.size) * this.bodyLength, "catterpillarBody.bodies", catterpillarBody.bodies)
        return Matter.Constraint.create({
            bodyA: head,
            bodyB: butt,
            length: (this.bodyPart.size) * this.bodyLength,
            stiffness: this.stiffness,
            damping: this.damping,
            label: "catterpillarConstraint",
            render: {
                visible: true,
                strokeStyle: "#4f0944",
                type: "spring",
            }
        })
    }
}

export default catterpillar