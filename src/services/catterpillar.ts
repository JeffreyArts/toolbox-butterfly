import _ from "lodash"
import Matter from "matter-js"

export type CatterpillarOptions = {
    length: number,
    maxVelocity: number,
    stiffness?: number, 
    damping?: number, 
    restitution?: number,
    bodyPart: CatterpillarBodyPartOptions
} & { [key: string]: number }

export type CatterpillarBodyPartOptions = {
    size: number,
    stiffness?: number,
    damping?: number,
    points?: number,
    restitution?: number,
}
const catterpillar = {
    create: (x:number,y:number, options: CatterpillarOptions) => {
        const defaultOptions = {
            length: 8,
            stiffness: .8, 
            maxVelocity: 3,
            restitution: .8,
            bodyPart: {
                size: 8,
                stiffness: .16,
                damping: .2,
                restitution: .8
            }
        } as CatterpillarOptions

        if (!options) {
            options = _.clone(defaultOptions)
        }

        _.forOwn(defaultOptions, (value: number, key) => {
            if (!options[key]) {
                options[key] = value
            }
        })

        // All options set, now call the helper functions to create the catterpillar
        const composite = catterpillar._createBodyParts(options)
        const constraint = catterpillar._createBodyConstraint(composite, options)
        
        return { composite, constraint }
    },
    _createBodyPart: (x:number, y:number, options: CatterpillarBodyPartOptions) : Matter.Body => {
        
        return Matter.Bodies.circle(x, y, options.size/2, { 
            collisionFilter: { group: 1 }, 
            restitution: options.restitution,
            slop: options.size/5,
            label: "partBody"
        })
        // return Matter.Bodies.circle(x, y, options.size, { 
        //     collisionFilter: { group: group }, 
        //     restitution: options.restitution,
        //     slop: options.size/3,
        //     label: "partBody"
        // })
        // return Matter.Bodies.rectangle(x, y, options.size, options.size * .5, { 
        //     collisionFilter: { group: group }, 
        //     restitution: options.restitution,
        //     label: "partBody"
        // })
    },
    _createBodyParts: (options: CatterpillarOptions) => {
        const bodyParts = Matter.Composites.stack(0, 32, options.length, 1, options.bodyPart.size*1.2, 0, (x:number, y:number) => {
            return catterpillar._createBodyPart(x,y, options.bodyPart)
        })
        
        // Matter
        const composite = Matter.Composite.create({
            bodies: bodyParts.bodies,
            label:"catterpillar",
        })
        _.each(bodyParts)
        // Matter.Composite.add(composite, bodyParts)

        let prev = null as null | Matter.Body
        _.each(composite.bodies, bodyPart => {
            if (prev) {
                Matter.Composite.add(composite, [
                    Matter.Constraint.create({
                        bodyA: bodyPart,
                        bodyB: prev,
                        pointA: {x: 0, y:0},
                        pointB: {x: 0, y:0},
                        // pointA: {x: -options.bodyPart.size*.5, y:0},
                        // pointB: {x: options.bodyPart.size*.5, y:0},
                        length: options.bodyPart.size,
                        // length: options.size*.5,
                        stiffness: options.bodyPart.stiffness,
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
    },
    _createBodyConstraint: (catterpillarBody: Matter.Composite, options: CatterpillarOptions) => {
        const head = catterpillarBody.bodies[0]
        const butt = catterpillarBody.bodies[catterpillarBody.bodies.length-1]
        return Matter.Constraint.create({
            bodyA: head,
            bodyB: butt,
            length: (options.bodyPart.size) * options.length,
            stiffness: options.stiffness,
            damping: options.damping,
            label: "catterpillarConstraint",
            render: {
                visible: true,
                strokeStyle: "#4f0944",
                type: "spring",
            }
        })
    },
}

export default catterpillar