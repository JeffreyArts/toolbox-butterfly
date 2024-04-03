import _ from "lodash"
import Matter from "matter-js"

type CatterpillarOptions = {
    length: 8,
    size: 8,
    bodyPartStiffness: .16,
    bodyStiffness: .8, 
    bodyDamping: .2, 
    maxVelocity: 3,
    restitution: .8
} & { [key: string]: number }

const catterpillar = {
    create: (x:number,y:number, options: CatterpillarOptions) => {
        const defaultOptions = {
            length: 8,
            size: 8,
            bodyPartStiffness: .16,
            bodyStiffness: .8, 
            maxVelocity: 3,
            restitution: .8
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
    _createBodyParts: (options: CatterpillarOptions) => {
        const group = Matter.Body.nextGroup(true)

        const bodyParts = Matter.Composites.stack(0, 32, options.length, 1, options.size, 0, (x:number, y:number) => {
            return Matter.Bodies.rectangle(x, y, options.size, options.size * .5, { 
                collisionFilter: { group: group }, 
                restitution: options.restitution,
                label: "partBody"
            })
        })
        // Matter
        const composite = Matter.Composite.create({
            bodies: bodyParts.bodies,
            label:"catterpillar",
        })
        // Matter.Composite.add(composite, bodyParts)

        let prev = null as null | Matter.Body
        _.each(composite.bodies, bodyPart => {
            if (prev) {
                Matter.Composite.add(composite, [
                    Matter.Constraint.create({
                        bodyA: bodyPart,
                        bodyB: prev,
                        pointA: {x: -options.size*.5, y:0},
                        pointB: {x: options.size*.5, y:0},
                        length: 0,
                        // length: options.size*.5,
                        stiffness: options.bodyPartStiffness,
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
            length: (options.size*1.5) * options.length,
            stiffness: options.bodyStiffness,
            damping: options.bodyDamping,
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