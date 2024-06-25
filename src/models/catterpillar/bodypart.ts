import Paper from "paper"
import Matter from "matter-js"

export type BodyPartOptions = {
    size: number,
    stiffness?: number,
    damping?: number,
    slop?: number,
    points?: number,
    restitution?: number,
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
    section: "bodyPart" | "head" | "butt"
    paper: paper.Path

}

class BodyPart {

    #generatePaperPath() {
        const newPath = new Paper.Path.Circle(new Paper.Point(this.x,this.y), this.radius) 
        newPath.fillColor = new Paper.Color("#58f208")
        newPath.fillColor = new Paper.Color("rgba(255,128,128,1)")
        newPath.strokeColor = new Paper.Color("#17381d")
        newPath.strokeColor.alpha = .2
        return newPath
    }

    #updatePosition() {
        this.paper.position.x = this.x
        this.paper.position.y = this.y
    }

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

        this.section = "bodyPart"
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

    remove() {
        this.paper.remove()
    }
}

export default BodyPart