import _ from "lodash"
import Paper from "paper"
import gsap from "gsap"

export type MouthOptions = {
    size?: number,
}

type MouthPoints = {
    topLip: {
        left: {
            x: number,
            y: number
        },
        center: {
            x: number,
            y: number
        },
        right: {
            x: number,
            y: number
        },
    },
    bottomLip: {
        left: {
            x: number,
            y: number
        },
        center: {
            x: number,
            y: number
        },
        right: {
            x: number,
            y: number
        },
    }
}

interface Mouth {
    x: number
    y: number
    offset: {
        x: number
        y: number
    }
    paper: paper.Path
    topLip: {
        left: paper.Point,
        center: paper.Point,
        right: paper.Point,
    }
    bottomLip: {
        left: paper.Point,
        center: paper.Point,
        right: paper.Point,
    }
    inTransition: boolean
    size: number
    state: "😮" | "🙂" | "😐"
}

class Mouth  {
    constructor (
        options: MouthOptions
    ) {
        this.x = 0
        this.y = 0
        this.size = options.size ? options.size : 16
        this.inTransition = false

        this.state = "🙂"

        this.paper = new Paper.Path([
            new Paper.Point(this.size / 2,  0),
            new Paper.Point(0 ,  0),
            new Paper.Point(-this.size / 2,  0),
            new Paper.Point(-this.size / 2,  0),
            new Paper.Point(0,  0),
            new Paper.Point(this.size / 2,  0),
            new Paper.Point(this.size / 2,  0),// This is going to be removed by calling the closePath method
        ])
        this.paper.closePath()

        this.bottomLip = {
            left:  this.paper.segments[0].point,
            center:  this.paper.segments[1].point,
            right:  this.paper.segments[2].point,
        }
        this.topLip = {
            left:  this.paper.segments[5].point,
            center:  this.paper.segments[4].point,
            right:  this.paper.segments[3].point,
        }


        this.paper.fillColor = new Paper.Color("#222")
        // this.paper.fillColor = new Paper.Color("#f00")
        // this.paper.smooth({ type: "continuous"})

        return new Proxy(this, {
            set: function (target, key, value) {
                // console.log(`${String(key)} set to ${value}`)
                if (key === "x" || key === "y") {
                    target[key] = value
                    target.updatePosition()
                }
                
                if (typeof target[key] !== "undefined") {
                    target[key] = value
                }
                return true
            }
        })
    }

    updatePosition() {
        if (this.inTransition) {
            return
        }

        const startPos = {
            topLip: {
                left: this.paper.segments[0].point,
                center: this.paper.segments[1].point,
                right: this.paper.segments[2].point,
            },
            bottomLip: {
                left: this.paper.segments[5].point,
                center: this.paper.segments[4].point,
                right: this.paper.segments[3].point,
            },
        }

        if (this.state === "🙂") {
            this.updateState(this.getSmilePosition())
        }
        
        if (this.state === "😮") {
            this.updateState(this.getOpenPosition())
        }

        if (this.state === "😐") {
            this.updateState(this.getShockedPosition())
        }

        this.paper.smooth({ type: "continuous"})
    }

    updateState(newState: {
        topLip: {
            left: {x: number, y: number},
            center: {x: number, y: number},
            right: {x: number, y: number}
        },
        bottomLip: {
            left: {x: number, y: number},
            center: {x: number, y: number},
            right: {x: number, y: number}
        }
    }) {
        // Top lip
        this.topLip.left.x = newState.topLip.left.x
        this.topLip.left.y = newState.topLip.left.y

        this.topLip.center.x = newState.topLip.center.x
        this.topLip.center.y = newState.topLip.center.y
        
        this.topLip.right.x = newState.topLip.right.x
        this.topLip.right.y = newState.topLip.right.y

        // Bottom lip
        this.bottomLip.left.x = newState.bottomLip.left.x
        this.bottomLip.left.y = newState.bottomLip.left.y

        this.bottomLip.center.x = newState.bottomLip.center.x
        this.bottomLip.center.y = newState.bottomLip.center.y
        
        this.bottomLip.right.x = newState.bottomLip.right.x
        this.bottomLip.right.y = newState.bottomLip.right.y
        
        this.paper.smooth({ type: "continuous"})
    }

    switchState(state:  "😮" | "🙂" | "😐", duration = .64 as number) {
        // duration = amount of seconds that the switch take
        // Don't switch state if it is the same state
        if (state == this.state || this.inTransition) {
            return
        }
        console.log("Switch state to:" , state)
        
        this.inTransition = true
        const progress = { perc: 0 }
        let ease = "sine.inOut"
        if (state === "😮") {
            ease = "elastic.out(1,0.5)"
        }
        const startPos = {
            topLip: {
                left: this.paper.segments[0].point,
                center: this.paper.segments[1].point,
                right: this.paper.segments[2].point,
            },
            bottomLip: {
                left: this.paper.segments[5].point,
                center: this.paper.segments[4].point,
                right: this.paper.segments[3].point,
            },
        }

        gsap.to(progress, {
            perc: 1,
            duration,
            ease,
            onUpdate: () => { 
                switch (state) {
                case  "😮":
                    this.animateState(this.getOpenPosition(), progress.perc) 
                    break
                case  "🙂":
                    this.animateState(this.getSmilePosition(), progress.perc) 
                    break
                case  "😐":
                    this.animateState(this.getShockedPosition(), progress.perc) 
                    break
                default:
                    break
                }
            },
            onComplete: () => {
                console.log("Complete!")
                this.state = state
                this.inTransition = false
            }
        })
    }

    animateState(
        finalState: MouthPoints, 
        perc: number
    ) {
        if (!this.inTransition) {
            return
        }

        const bottomLipLeft = this.paper.segments[0].point
        const bottomLipCenter = this.paper.segments[1].point
        const bottomLipRight = this.paper.segments[2].point
            
        const topLipRight = this.paper.segments[3].point
        const topLipCenter = this.paper.segments[4].point
        const topLipLeft = this.paper.segments[5].point

        const newState = {
            topLip: {
                left: {
                    x: bottomLipLeft.x + (finalState.topLip.left.x - topLipLeft.x) * perc,
                    y: bottomLipLeft.y + (finalState.topLip.left.y - topLipLeft.y) * perc,
                },
                center: {
                    x: topLipCenter.x + (finalState.topLip.center.x - topLipCenter.x) * perc,
                    y: topLipCenter.y + (finalState.topLip.center.y - topLipCenter.y) * perc,
                },
                right: {
                    x: topLipRight.x + (finalState.topLip.right.x - topLipRight.x) * perc,
                    y: topLipRight.y + (finalState.topLip.right.y - topLipRight.y) * perc,
                }
            },
            bottomLip: {
                left: {
                    x: bottomLipLeft.x + (finalState.bottomLip.left.x - bottomLipLeft.x) * perc,
                    y: bottomLipLeft.y + (finalState.bottomLip.left.y - bottomLipLeft.y) * perc,
                },
                center: {
                    x: bottomLipCenter.x + (finalState.bottomLip.center.x - bottomLipCenter.x) * perc,
                    y: bottomLipCenter.y + (finalState.bottomLip.center.y - bottomLipCenter.y) * perc,
                },
                right: {
                    x: bottomLipRight.x + (finalState.bottomLip.right.x - bottomLipRight.x) * perc,
                    y: bottomLipRight.y + (finalState.bottomLip.right.y - bottomLipRight.y) * perc,
                }
            },
        }
        this.updateState(newState)
    }
    
    getOpenPosition() {
        return {
            topLip: {
                left: {
                    x: this.x - this.size/2 * .88,
                    y: (this.y + this.size *.2) - (this.size * .2) 
                },
                center: {
                    x: this.x,
                    y: (this.y + this.size *.2) - (this.size * .4)
                },
                right: {
                    x: this.x + this.size/2 * .88, 
                    y: (this.y + this.size *.2) - (this.size * .2)
                }
            },
            bottomLip: {
                left: {
                    x: this.x - this.size/2,
                    y: (this.y + this.size *.2) + (this.size * .2)
                },
                center: {
                    x: this.x,
                    y: (this.y + this.size *.2) + (this.size * .4)
                },
                right: {
                    x: this.x + this.size/2, 
                    y: (this.y + this.size *.2) + (this.size * .2)
                }
            }
        }
    }

    getSmilePosition() {
        return {
            topLip: {
                left: {
                    x: this.x - (this.size/2),
                    y: this.y - .5
                },
                center: {
                    x: this.x,
                    y: this.y + 2
                },
                right: {
                    x: this.x + (this.size/2),
                    y: this.y - .5
                }
            },
            bottomLip: {
                left: {
                    x: this.x - (this.size/2),
                    y: this.y
                },
                center: {
                    x: this.x, 
                    y: this.y + 4
                },
                right: {
                    x: this.x + (this.size/2),
                    y: this.y
                }
            }
        }
    }

    getShockedPosition() {
        return {
            topLip: {
                left: {
                    x: this.x - (this.size/2),
                    y: this.y + 1
                },
                center: {
                    x: this.x,
                    y: this.y + 1
                },
                right: {
                    x: this.x + (this.size/2),
                    y: this.y + 1
                }
            },
            bottomLip: {
                left: {
                    x: this.x - (this.size/2),
                    y: this.y + 3
                },
                center: {
                    x: this.x, 
                    y: this.y + 3
                },
                right: {
                    x: this.x + (this.size/2),
                    y: this.y + 3
                }
            }
        }
    }
}

export default Mouth