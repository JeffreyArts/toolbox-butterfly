import _ from "lodash"
import Matter from "matter-js"
import Eye from "./eye"
import BodyPart from "./bodypart"

import { BodyPartOptions } from "./bodypart"
import { EyeOptions } from "./eye"

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

// export type Catterpillar = {
//     eyes: {
//         blink: () => void,
//         startBlinking: () => void,
//         stopBlinking: () => void,
//         blinkInterval?: number,
//         autoBlink: boolean,
//         left?: {
//             width: number,
//             height: number,
//             lid: paper.Path,
//             pupil: paper.Path,
//             sclera: paper.Path,
//             isOpen: boolean,
//         },
//         right?: {
//             width: number,
//             height: number,
//             lid: paper.Path,
//             pupil: paper.Path,
//             sclera: paper.Path,
//             isOpen: boolean,
//         },
//     },
//     mouth: {
//         move: (state: "😮" | "🙂" ) => void
//     }
// }

interface Catterpillar {
    eye: {
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
    bodyPart: BodyPartOptions
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
}

class Catterpillar  {

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

    #createBodyParts () : {
        composite: Matter.Composite,
        eye: {
            left: Eye,
            right: Eye
        },
        head: Matter.Body,
        butt: Matter.Body
        } {

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

        const eyeOptions = {
            x: this.x,
            y: this.y,
            width: 8,
            height: 8,
            autoBlink: true
        }
        
        this.eye = {
            left: new Eye(eyeOptions),
            right: new Eye(eyeOptions)
        }
        
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

    remove() {
        this.bodyLength = -1
        this.eye.left.remove()
        this.eye.right.remove()
        _.each(this.bodyParts, bodyPart => {
            bodyPart.remove()
        })
        this.isMoving = false
    }

}

export default Catterpillar