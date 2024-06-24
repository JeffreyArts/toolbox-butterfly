import _ from "lodash"
import Matter from "matter-js"

export type CatterpillarOptions = {
    x?: number
    y?: number
    length?: number
    stiffness?: number 
    damping?: number
    maxVelocity?: number
    floppiness?: number 
    restitution?: number 
    autoBlink?: boolean
    bodyPart?: {
        slop?: number
        size?: number
        stiffness?: number 
        damping?: number 
        restitution?: number 
    }
} 

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
    x: number
    y: number
    offset: {
        x: number
        y: number
    }
    width: number
    height: number
    sclera: paper.Path
    pupil: paper.Path
    pupilOffset: {x: number, y:number}
    lid: paper.Path
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

    updatePosition(x?:number,y?:number) {
        if (!this.pupil) {
            return console.error("Missing pupil")
        }
        if (!this.lid) {
            return console.error("Missing lid")
        }
        if (!this.sclera) {
            return console.error("Missing sclera")
        }
        
        this.lid.position.y = this.y + this.offset.y
        this.lid.position.x = this.x + this.offset.x

        this.pupil.position.y = this.y + this.pupilOffset.y + this.offset.y
        this.pupil.position.x = this.x + this.pupilOffset.x + this.offset.x

        this.sclera.position.y = this.y + this.offset.y
        this.sclera.position.x = this.x + this.offset.x
    }

    movePupil(offset:{x: number, y: number}) {
        if (!offset || !offset.x) {
            return console.error("Invalid value for movePupil")
        }

        this.pupilOffset.x = offset.x + this.offset.x
        this.pupilOffset.y = offset.y + this.offset.y
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
        this.pupilOffset = {x: 0, y:0}
        this.offset = {x: 0,y: 0}

        this.lid = new Paper.Path([
            new Paper.Point(width * 0,   height * 0.5),
            new Paper.Point(width * 0.5, height * 0),
            new Paper.Point(width * 1,   height * 0.5),
            new Paper.Point(width * 0.5, height * 1),
        ])

        this.lid.closePath()
        this.lid.smooth({ type: "continuous"})
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
                // console.log(`${String(key)} set to ${value}`)
                if (key === "x" || key === "y") {
                    target[key] = value
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

interface BodyPart {
    x: number
    y: number
    radius: number
    body: Matter.Body
    options: {
        restitution: number
        slop: number
    }
    section: "default" | "head" | "butt"
    paper: paper.Path

}

class BodyPart  {
    constructor (
        options: {
            radius: number,
            x?: number,
            y?: number,
            restitution?: number,
            slop?: number,
            section?: string
        }
    ) {
        this.options = {
            restitution: 1,
            slop: 1,
        }

        this.section = "default"
        this.x = options?.x ? options.x : 0
        this.y = options?.y ? options.y : 0
        this.radius = options?.radius ? options.radius : 8

        if (options?.restitution) {
            this.options.restitution = options.restitution
        }

        if (options?.slop) {
            this.options.slop = options.slop
        }
        
        this.body = Matter.Bodies.circle(this.x, this.y, this.radius/2, { 
            collisionFilter: { group: 1 }, 
            restitution: this.options.restitution,
            slop: this.options.slop ? this.options.slop : this.radius/5,
            label: this.section
        })

        this.paper = this.#generatePaperPath()

        return new Proxy(this, {
            set: function (target, key, value) {
                // console.log(`${String(key)} set to ${value}`)
                if (key === "x" || key === "y") {
                    target[key] = value
                    target.#updatePosition()
                }
                return true
            }
        }) as BodyPart
    }

    #generatePaperPath() {
        const newPath = new Paper.Path.Circle(new Paper.Point(this.x,this.y), this.radius) 
        newPath.fillColor = new Paper.Color("#58f208")
        newPath.strokeColor = new Paper.Color("#17381d")
        newPath.strokeColor.alpha = .2
        return newPath
    }

    #updatePosition() {
        this.paper.position.x = this.x
        this.paper.position.y = this.y
    }
}

class catterpillar  {
    eye = {
        left: Eye,
        right: Eye,
    }
    // startBlinking: () => void
    // stopBlinking: () => void
    blinkInterval?: number
    autoBlink: boolean
    x: number
    y: number
    head: Matter.Body
    butt: Matter.Body
    body: Array<Matter.Body>
    bodyPart: CatterpillarBodyPartOptions
    bodyParts: Array<BodyPart>
    stiffness: number
    bodyLength: number
    damping: number
    maxVelocity: number
    restitution: number
    floppiness: number
    composite: Matter.Composite
    constraint: Matter.Constraint
    isMoving: boolean

    #createBodyPart () {
        let section = "default"
        if (this.bodyParts.length == 0) {
            section = "head"
        }

        if (this.bodyParts.length === this.bodyLength) {
            section = "butt"
        }

        return new BodyPart({
            x: -128,
            y: -128,
            radius: this.bodyPart.size,
            restitution: this.bodyPart.restitution,
            slop: this.bodyPart.slop ? this.bodyPart.slop : this.bodyPart.size/5,
            section: section
        })
    }

    #createBodyParts () : {composite: Matter.Composite, head: Matter.Body, butt: Matter.Body} {
        const bodyParts = Matter.Composites.stack(this.x, this.y, this.bodyLength, 1, this.bodyPart.size + 1, 0, (x:number, y:number) => {
            const bodyPart = this.#createBodyPart()
            this.bodyParts.push(bodyPart)
            return bodyPart.body
        })

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
        return {
            composite,
            eye: this.eye,
            head: composite.bodies[0], 
            butt: composite.bodies[composite.bodies.length-1]
        }
    }
    
    #createBodyConstraint() : Matter.Constraint {
        // console.log("stiffness", this.stiffness, "damping", this.damping, "length", (this.bodyPart.size) * this.bodyLength, "catterpillarBody.bodies", this.composite.bodies)
        return Matter.Constraint.create({
            bodyA: this.head,
            bodyB: this.butt,
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

    constructor (options = {
        x: 0,
        y: 0,
        length: 8,
        stiffness: .8, 
        damping: .8, 
        maxVelocity: 3,
        floppiness: .5,
        restitution: .8,
        autoBlink: true,
        bodyPart: {
            slop: 2,
            size: 8,
            stiffness: .16,
            damping: .2,
            restitution: .8
        }
    } as CatterpillarOptions) {
        this.bodyPart = {
            size: 8,
            stiffness: .16,
            damping: .2,
            restitution: .8
        }
        
        this.bodyParts = []
        this.isMoving = false
        this.x              = options.x             ? options.x : 0
        this.y              = options.y             ? options.y : 0
        this.autoBlink      = options.autoBlink     ? options.autoBlink : true
        this.bodyLength     = options.length        ? options.length : 8
        this.stiffness      = options.stiffness     ? options.stiffness : .8
        this.maxVelocity    = options.maxVelocity   ? options.maxVelocity : 3
        this.floppiness     = options.floppiness    ? options.floppiness : .5
        this.damping        = options.damping       ? options.damping : .8
        this.restitution    = options.restitution   ? options.restitution : .8

        this.bodyPart.size          = options.bodyPart?.size ? options.bodyPart?.size : 8
        this.bodyPart.slop          = options.bodyPart?.slop
        this.bodyPart.stiffness     = options.bodyPart?.stiffness
        this.bodyPart.damping       = options.bodyPart?.damping
        this.bodyPart.restitution   = options.bodyPart?.restitution
        
        // All options set, now call the helper functions to create the catterpillar
        const t = this.#createBodyParts()
        this.composite = t.composite
        this.head = t.head
        this.butt = t.butt

        this.body = []
        for (let index = 1; index < this.composite.bodies.length-1; index++) {
            this.body.push(this.composite.bodies[index])
        }

        this.constraint = this.#createBodyConstraint()

        this.eye.left = new Eye(this.x,this.y)
        this.eye.right = new Eye(this.x,this.y)
        
        const draw = () => {
            if (this.bodyLength < 0) {
                return
            }

            _.each(this.composite.bodies, (body, i) => {
                this.bodyParts[i].x = body.position.x
                this.bodyParts[i].y = body.position.y      
            })

            this.eye.left.x = this.head.position.x - this.eye["left"].width/2
            this.eye.left.y = this.head.position.y - this.eye["left"].height/2
            
            this.eye.right.x = this.head.position.x + this.eye["right"].width/2
            this.eye.right.y = this.head.position.y - this.eye["right"].height/2
            
            requestAnimationFrame(draw)
        }
        requestAnimationFrame(draw)
    }

    blink() {
        this.eye.left.blink()
        this.eye.right.blink()
    }

}

export default catterpillar