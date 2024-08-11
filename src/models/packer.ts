type Block = {
    width: number;
    height: number;
    id: string | number;
};

type Position = {
    x: number;
    y: number;
    width: number;
    height: number;
    id?: string | number;
};
import _ from "lodash"

type Algorithm = "FBL" | "NF" | "BF" | "JEF";

export default class Packer {
    private canvasWidth: number
    private canvasHeight: number
    private blocks: Block[]
    private output: Position[]
    private autoResize?: "width" | "height"
    private algorithm?: Algorithm

    constructor(canvasWidth: number, canvasHeight: number, options?: { autoResize?: "width" | "height", algorithm?: Algorithm}) {
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight
        this.blocks = []
        this.output = []
        this.algorithm = options?.algorithm || undefined
        this.autoResize = options?.autoResize
    }

    public setDimensions(width: number, height: number) {
        this.canvasWidth = width
        this.canvasHeight = height
        this.updateLayout()
    }

    public setBlocks(blocks: Block[]) {
        this.blocks = _.map(blocks, (block, index) => {
            if (!block.id) {
                block.id = index
            }
            return block
        })
        this.updateLayout()
    }

    public getOutput(): Position[] {
        return this.output
    }

    public addBlock(block: Block) {
        this.blocks.push(block)
        this.updateLayout()
    }

    public changeAlgorithm(algorithm: Algorithm) {
        this.algorithm = algorithm
        this.updateLayout()
    }

    private updateLayout() {
        this.output = []
        switch (this.algorithm) {
        case "JEF":
            this.jeffsAlgorithm()
            break
        case "NF":
            this.nextFitAlgorithm()
            break
        case "BF":
            this.bestFitAlgorithm()
            break
        default:
            throw new Error(`Algorithm ${this.algorithm} is not implemented.`)
        }
    }

    private jeffsAlgorithm() {
        const result = [] as Position[]
        const inputBlocks = [...this.blocks] as Position[]
        let done = false
        
        while (!done) {

            if (result.length === 0) {
                const firstBlock = _.reverse(_.sortBy(inputBlocks, "width"))[0] // Get and remove the first block
                if (firstBlock) {
                    result.push({
                        width: firstBlock.width,
                        height: firstBlock.height,
                        x: 0,
                        y: 0,
                        id: firstBlock.id
                    })

                    _.remove(inputBlocks, {id: firstBlock.id})
                }
                continue // Restart loop to process the next block
            }

            const getOptions = (targetBlock: Position) => {
                // Check right 
                const optionsRight = _.without(_.map(inputBlocks, inputBlock => {
                    
                    // If it can't fit right to targetBlock escape immediately
                    if (targetBlock.x + targetBlock.width + inputBlock.width > this.canvasWidth) {
                        return
                    }

                    const possibleOptions = _.without(_.map(result, resBlock => {
                        if (resBlock.x <= targetBlock.x) {
                            return
                        }
                        
                        // Validate horizontal position
                        if (targetBlock.y < resBlock.y + resBlock.height) {
                            return
                        }

                        // Validate if inputBlock is within canvas
                        if (resBlock.x + resBlock.width + inputBlock.width > this.canvasWidth) {
                            return
                        }
                        
                        // Prevent overlap with other items
                        const a = _.without(_.map(result, b => {
                            return targetBlock.y + inputBlock.height < b.y + b.height
                        }), false)
                    
                        if (a.length > 0) {
                            return
                        }


                        return {
                            y: resBlock.y + resBlock.height,
                            x: resBlock.x + resBlock.width, 
                            width: inputBlock.width,
                            height: inputBlock.height,
                            position: "right",
                            sourceId: targetBlock.id,
                            id: inputBlock.id
                        }
                    }), undefined) as Position[]
    

                    if (possibleOptions.length > 0) {
                        return _.sortBy(possibleOptions, "y")[0]
                    }

                    if (targetBlock.x + targetBlock.width + inputBlock.width < this.canvasWidth ){
                        // return inputBlock
                        return {
                            x: targetBlock.x + targetBlock.width,
                            y: targetBlock.y,
                            width: inputBlock.width,
                            height: inputBlock.height,
                            position: "right",
                            sourceId: targetBlock.id,
                            id: inputBlock.id
                        }
                    }
                }), undefined) as Position[]


                // Check left 
                const optionsLeft = _.without(_.map(inputBlocks,inputBlock => {
                    const possibleOptions = _.without(_.map(result, resBlock => {
                        if (resBlock.x  > targetBlock.x) {
                            return
                        }
                        
                        // Validate if inputBlock is within canvas
                        if (targetBlock.x - resBlock.width < 0) {
                            return
                        }
                        
                        const a = _.without(_.map(result, b => {
                            return targetBlock.y + resBlock.height < b.y + b.height
                        }), false)
                        
                        if (a.length > 0) {
                            return
                        }
                        
                        return {
                            y: resBlock.y + resBlock.height,
                            x: resBlock.x,
                            width: inputBlock.width,
                            height: inputBlock.height,
                            position: "left",
                            sourceId: targetBlock.id,
                            id: inputBlock.id
                        }
                    }), undefined) as Position[]

                    if (possibleOptions.length > 0) {
                        return _.sortBy(possibleOptions, "y")[0]
                    }
                }), undefined) as Position[]

                // Check bottom 
                const optionsBottom = _.without(_.map(inputBlocks, inputBlock => {
                    if (inputBlock.width + targetBlock.x > this.canvasWidth) {
                        return
                    }

                    return {
                        x: targetBlock.x,
                        y: targetBlock.y + targetBlock.height,
                        width: inputBlock.width,
                        height: inputBlock.height,
                        position: "bottom",
                        sourceId: targetBlock.id,
                        id: inputBlock.id,
                    }
                }), undefined) as Position[]

                return {
                    id: targetBlock.id,
                    optionsRight,
                    optionsLeft,
                    optionsBottom
                }
            }

            // console.log("┌────────────────────────")
            // console.log("|",result.length-1)
            const positionOrder = {
                right: 1,
                bottom: 2,
                left: 3
            }
            function rectanglesOverlap(r1:Position, r2:Position) {
                return !(r2.x >= r1.x + r1.width ||
                         r2.x + r2.width <= r1.x ||
                         r2.y >= r1.y + r1.height ||
                         r2.y + r2.height <= r1.y)
            }
              
            const options = _.map(result, tb => {
                const data = getOptions(tb)
                
                // console.log("|","DATA",JSON.stringify([...data.optionsBottom, ...data.optionsLeft, ...data.optionsRight],null,2))
                const temp =  _.chain([...data.optionsBottom, ...data.optionsLeft, ...data.optionsRight])
                    .orderBy(
                        ["y", item => positionOrder[item.position]],
                        ["asc", "desc"]
                    )
                    .without(undefined)
                    .filter(dataRect =>
                        !_.some(result, resultRect => rectanglesOverlap(dataRect, resultRect))
                    )
                    .without(undefined)
                    .value()
                    
                // console.log("|", "data.optionsBottom", data)
                // console.log("|", "temp", temp)
                return temp
                //     _.map(getOptions(tb), data => {
                //         const dataRes = []
                //         _.each(data.optionsRight, right => {
                        
                //         })
                //     })
                //     console.log("|",{
                //         id: tb.id,
                //         left: res.optionsLeft,
                //         right: res.optionsRight,
                //         bottom: res.optionsBottom,
                //     })
                
                //     // res.optionsRight = res.optionsRight.filter(block1 => {
                //     //     return !_.find(result,(block2 => block1.x === block2.x && block1.y === block2.y))
                //     // })
                //     // res.optionsLeft = res.optionsLeft.filter(block1 => {
                //     //     return !_.find(result,(block2 => block1.x === block2.x && block1.y === block2.y))
                //     // })
                //     // res.optionsBottom = res.optionsBottom.filter(block1 => {
                //     //     return !_.find(result,(block2 => block1.x === block2.x && block1.y === block2.y))
                //     // })

            //     return {
            //         id: tb.id,
            //         left: res.optionsLeft,
            //         right: res.optionsRight,
            //         bottom: res.optionsBottom,
            //     }
            })

            const nextBlockOptions = _.chain(_.flatten(options))
                .orderBy(
                    ["y", item => positionOrder[item.position]],
                    ["asc", "desc"]
                )
                .without(undefined)
                .take(1)
                .value()
            const nextBlock = nextBlockOptions[0]
            // Not using random allows this method to be used to genereate reproducable results, which is desired for using it as some sort of templating system
            // const nextBlock = nextBlockOptions[Math.floor(Math.random() * nextBlockOptions.length)]
            // console.log("|", "nextBlock", nextBlock)
            // console.log("└────────────────────────")
            if (!nextBlock) {
                console.log("Y",_.reverse(_.sortBy(result, "y"))[0].y)

                const lastBlock = _.reverse(_.sortBy(result, "y"))[0]
                if (lastBlock) {
                    result.push({
                        width: lastBlock.width,
                        height: lastBlock.height,
                        x: 0,
                        y: lastBlock.y,
                        id: lastBlock.id
                    })

                    _.remove(inputBlocks, {id: lastBlock.id})
                } else {
                    done = true
                }
                
                // result.push({
                //     x: 0,
                //     y: _.sortBy(result, "y")[0].y,
                //     width: nextBlock.width,
                //     height: nextBlock.height,
                //     id: nextBlock.id
                // })
                done = true
                continue
            }
            result.push({
                x: nextBlock.x,
                y: nextBlock.y,
                width: nextBlock.width,
                height: nextBlock.height,
                id: nextBlock.id
            })
            _.remove(inputBlocks, {id: nextBlock.id})
            continue
        }
        console.log("|", "completed", result.length, this.blocks.length)
        this.output = result
        return result
    }
    
    // Generated by ChatGPT
    private bestFitAlgorithm() {
        const rows: { remainingWidth: number; y: number; maxHeight: number }[] = []

        for (const block of this.blocks) {
            // Find the best row that can fit this block
            let bestRow = null
            let minRemainingWidth = this.canvasWidth + 1

            for (const row of rows) {
                if (row.remainingWidth >= block.width && row.remainingWidth - block.width < minRemainingWidth) {
                    bestRow = row
                    minRemainingWidth = row.remainingWidth - block.width
                }
            }

            if (bestRow === null) {
                // No suitable row found, create a new one
                const newRowY = rows.length > 0 ? rows[rows.length - 1].y + rows[rows.length - 1].maxHeight : 0
                
                if (newRowY + block.height > this.canvasHeight) {
                    // If the block doesn't fit on the canvas, resize if autoResize is enabled
                    if (this.autoResize === "height") {
                        this.canvasHeight = newRowY + block.height
                    } else {
                        // No resizing allowed and no space left, stop placing more blocks
                        break
                    }
                }

                bestRow = {
                    remainingWidth: this.canvasWidth - block.width,
                    y: newRowY,
                    maxHeight: block.height,
                }
                rows.push(bestRow)
            } else {
                // Update the row to account for the placed block
                bestRow.remainingWidth -= block.width
                bestRow.maxHeight = Math.max(bestRow.maxHeight, block.height)
            }

            // Place the block in the best row
            this.output.push({
                x: this.canvasWidth - bestRow.remainingWidth - block.width,
                y: bestRow.y,
                width: block.width,
                height: block.height,
                id: block.id,
            })
        }
    }

    private nextFitAlgorithm() {
        let currentX = 0
        let currentY = 0
        let maxHeightInRow = 0

        for (const block of this.blocks) {
            if (currentX + block.width > this.canvasWidth) {
                // Start a new row if the current block doesn't fit in the current row
                currentX = 0
                currentY += maxHeightInRow
                maxHeightInRow = 0
            }

            if (currentY + block.height > this.canvasHeight) {
                // If the block doesn't fit on the canvas, resize if autoResize is enabled
                if (this.autoResize === "height") {
                    this.canvasHeight = currentY + block.height
                } else {
                    // No resizing allowed and no space left, stop placing more blocks
                    break
                }
            }

            this.output.push({
                x: currentX,
                y: currentY,
                width: block.width,
                height: block.height,
                id: block.id,
            })

            currentX += block.width
            maxHeightInRow = Math.max(maxHeightInRow, block.height)
        }
    }

}






// import _            from "lodash"
// import shuffleSeed  from "@sjeffff/shuffle-seed"
// import seedrandom   from "seedrandom"

// import Grid         from "./../models/grid.js"
// import Polyline     from "./../models/polyline.js"




// // Helper function to run generateModel iterively
// const generateModelLoop = (res, startCords, symbols, canvasGrid, opts) => {
//     if (!opts) {
//         console.error("Missing at least the seed property")
//         return
//     }
//     if (!opts.index) {
//         opts.index = 0
//     }
//     if (_.isArray(startCords) && startCords.length > 0) {
//         for (let i = 0; i < startCords.length; i++) {
//             const generatedModel = generateModel(startCords[i], symbols, canvasGrid, opts)
//             if (generatedModel) {
//                 if (generatedModel.polylines) {
//                     _.each(generatedModel.polylines, polyline => {
//                         res.polylines.push(polyline)
//                     })
//                 }
//                 opts.index++
//                 generateModelLoop(res, shuffleSeed.shuffle(generatedModel.newStartCords, numerizeSeed(opts.seed) + opts.index), symbols, canvasGrid, opts)
//             }
//         }
//     }
// }


// // This function checks if all grid positions fit on an empty cell
// const symbolFits = (startCord, symbol, connectCordIndex, canvasGrid) => {
//     var xi = 0
//     var yi = 0
//     let fit = true
//     const symbolStartCord = {
//         x: startCord.x + symbol.connectCords[connectCordIndex].x - (symbol.width - 1),
//         y: startCord.y + symbol.connectCords[connectCordIndex].y - (symbol.height - 1)
//     }
//     for (var yi = 0; yi < symbol.height; yi++) {
//         for (var xi = 0; xi < symbol.width; xi++) {
//             if (Grid.getPointValue(symbolStartCord.x + xi, symbolStartCord.y + yi, canvasGrid) != 0) {
//                 fit = false
//             }
//         }
//     }

//     if (fit) {
//         return symbolStartCord
//     } else {
//         return null
//     }
// }

// // This function loops through the last added connectCords & returns an array
// // with possible start positions
// const possibleStartCords = (result, symbol, startingEndCord, canvasGrid) => {
//     if (Grid.getPointValue(startingEndCord.x, startingEndCord.y, canvasGrid) == 0) {
//         _.each(symbol.connectCords, (connectCord, connectCordIndex) => {
//             const symbolStartCord = symbolFits(startingEndCord, symbol, connectCordIndex, canvasGrid)
//             if (!_.isNull(symbolStartCord)) {
//                 result.push({
//                     symbol: symbol,
//                     startCord: symbolStartCord,
//                     startingEndCord: startingEndCord,
//                     newStartCords: _.map(symbol.connectCords, connectCord => {
//                         return {
//                             x: connectCord.x + symbolStartCord.x,
//                             y: connectCord.y + symbolStartCord.y
//                         }
//                     }),
//                     polylines: _.map(symbol.polylines, polyline => {
//                         return _.map(polyline, cord => {
//                             return {
//                                 x: symbolStartCord.x + cord.x,
//                                 y: symbolStartCord.y + cord.y
//                             }
//                         })
//                     })
//                 })
//             }

//         })
//     }
// }

// // Creates an array with possible starting points
// const getPositions = (symbol, startCord, canvasGrid) => {
//     const possiblePositions = []

//     // Left free
//     var startingEndCord = {x: startCord.x -1, y: startCord.y}
//     possibleStartCords(possiblePositions, symbol, startingEndCord, canvasGrid)

//     // Right free
//     var startingEndCord = {x: startCord.x + 1, y: startCord.y}
//     possibleStartCords(possiblePositions, symbol, startingEndCord, canvasGrid)

//     // Top free
//     var startingEndCord = {x: startCord.x, y: startCord.y - 1}
//     possibleStartCords(possiblePositions, symbol, startingEndCord, canvasGrid)

//     // Bottom free
//     var startingEndCord = {x: startCord.x, y: startCord.y + 1}
//     possibleStartCords(possiblePositions, symbol, startingEndCord, canvasGrid)

//     _.each(possiblePositions, obj => {
//         obj.prevCord = startCord
//     })

//     return possiblePositions
// }

// // Translate symbol & connectline to different arrays of points
// const generateModel = (startCord, symbols, canvasGrid, opts) => {
//     if (!_.isArray(symbols)) {
//         symbols = [symbols]
//     }

//     let nextSymbol = null

//     _.each(symbols, symbol => {
//         const symbolPositions = getPositions(symbol, startCord, canvasGrid)

//         if (symbolPositions.length > 0) {
//             nextSymbol = symbolPositions[numerizeSeed(opts.seed) % symbolPositions.length]
//         }
//     })


//     if (nextSymbol) {
//         if (opts.drawConnectLines) {
//             nextSymbol.polylines.push([{x: nextSymbol.prevCord.x, y: nextSymbol.prevCord.y}, {x: nextSymbol.startingEndCord.x, y: nextSymbol.startingEndCord.y}])
//         }

//         _.each(nextSymbol.polylines, polyline => {
//             _.each(polyline, cord => {
//                 canvasGrid[cord.y][cord.x] = 1
//             })
//         })

//         return nextSymbol
//     } else {
//         return null
//     }
// }
// const a = (input) => {

//     const width = input.width
//     const height = input.height
//     const symbols = input.symbols
//     const seed = input.seed.toString()

//     const startPoint        = input.algorithm.startPoint || {x:0, y:0}
//     const mirrorX           = input.algorithm.mirrorX || 0
//     const mirrorY           = input.algorithm.mirrorY || 0
//     const drawConnectLines  = input.algorithm.drawConnectLines || true

//     if (!input.algorithm.startPoint) {
//         startPoint.x = mirrorX != 0 ? Math.floor(width/4) : Math.floor(width/2)
//         startPoint.y = mirrorY != 0 ? Math.floor(height/4) : Math.floor(height/2)
//     }

//     let mask                = null
//     let canvasGrid          = Grid.init(width, height)
//     if (input.algorithm.mask) {
//         mask = _.merge([],input.algorithm.mask)
//     }

//     if (!_.isNull(mask)) {
//         const newCanvas = _.merge([],mask)
//         if (canvasGrid[0].length == Math.floor(mask[0].length/2) && mirrorX) {
//             _.each(newCanvas, posY => {
//                 _.remove(posY, (valueX, indexX) => {
//                     return indexX > canvasGrid[0].length
//                 })
//             })
//         }

//         if (canvasGrid.length == Math.floor(mask.length/2) && mirrorY) {
//             _.remove(newCanvas, (valueY, indexY) => {
//                 return indexY > canvasGrid.length
//             })
//         }

//         if (
//             (canvasGrid.length == Math.floor(mask.length/2) && !mirrorY) &&
//             (canvasGrid[0].length == Math.floor(mask[0].length/2) && !mirrorX) &&
//             (canvasGrid.length != mask.length && canvasGrid[0].length != mask[0].length)
//         ) {
//             console.warn("Mask size does not equal canvas grid size", `width: ${canvasGrid[0].length}, height: ${canvasGrid.length}`)
//         }

//         canvasGrid = newCanvas
//     }


//     const result = {
//         polylines: [],
//     }


//     generateModelLoop(result, [startPoint],
//         symbols,
//         canvasGrid,
//         {
//             seed: seed,
//             drawConnectLines: drawConnectLines,
//         }
//     )


//     if (!_.isNull(mask)) {
//         result.polylines = applyMask(mask, result.polylines)
//     }
//     result.polylines = Polyline.removeDuplicates(result.polylines)

//     return result
// }