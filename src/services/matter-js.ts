import Matter from "matter-js"

export default {
    init(canvasEl: HTMLElement) {
        if (!canvasEl) {
            throw new Error("renderCanvas ref can not be found")
        }

        if (canvasEl.children.length > 0) {
            for (let i=0; i < canvasEl.children.length; i++) {
                canvasEl.children[i].remove()
            }
        }

        // create an engine
        const engine = Matter.Engine.create({
            enableSleeping: true,
            gravity: {
                x: 0,
                y: 1
            }
        })

        // create runner
        const render = Matter.Render.create({
            element: canvasEl,
            engine: engine,
            options: {
                width: canvasEl.clientWidth,
                height: canvasEl.clientHeight,
                showAngleIndicator: true,
                showVelocity: true,
            }
        })

        const runner = Matter.Runner.create()
        
        Matter.Render.run(render)

        // run the engine
        Matter.Runner.run(runner, engine)
        return {
            world: engine.world,
            runner: runner,
            engine: engine,
        }
    },
    destroy(runner: Matter.Runner, engine: Matter.Engine) {
        Matter.Runner.stop(runner)
        Matter.Engine.clear(engine)
    },
}