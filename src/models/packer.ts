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
    sourceId?: string | number;
    position?: "right" | "left" | "bottom"
    id?: string | number;
};
import _ from "lodash"

type Algorithm = "FBL" | "NF" | "BF" | "JEF";

export default class Packer {
    private layoutWidth: number
    private layoutHeight: number
    private blocks: Block[]
    private output: Position[]
    private autoResize?: "width" | "height"
    private algorithm?: Algorithm
    
    constructor(layoutWidth: number, layoutHeight: number, options?: { autoResize?: "width" | "height", algorithm?: Algorithm}) {
        this.layoutWidth = layoutWidth
        this.layoutHeight = layoutHeight
        this.blocks = []
        this.output = []
        this.algorithm = options?.algorithm || "JEF"
        this.autoResize = options?.autoResize
    }

    public setDimensions(width: number, height: number) {
        this.layoutWidth = width
        this.layoutHeight = height
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
                // const firstBlock = _.reverse(_.sortBy(inputBlocks, "width"))[0] // Get and remove the first block
                const firstBlock = inputBlocks[0] // Get and remove the first block
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
                    if (targetBlock.x + targetBlock.width + inputBlock.width > this.layoutWidth) {
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
                        if (resBlock.x + resBlock.width + inputBlock.width > this.layoutWidth) {
                            return
                        }
                        if (targetBlock.x + targetBlock.width + inputBlock.width > this.layoutWidth) {
                            return
                        }
                        
                        if (targetBlock.y  + inputBlock.height  < resBlock.y + resBlock.height) {
                            return
                        }
                        
                        // // Prevent overlap with other items
                        // const a = _.without(_.map(result, b => {
                        //     return targetBlock.y + inputBlock.height < b.y + b.height
                        // }), false)
                    
                        // if (a.length > 0) {
                        //     return
                        // }


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

                    if (targetBlock.x + targetBlock.width + inputBlock.width < this.layoutWidth ){
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
                        
                        if (targetBlock.y  < resBlock.y + resBlock.height) {
                            return
                        }
                        
                        
                        return {
                            y: resBlock.y,
                            x: resBlock.x ,
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
                    const possibleOptions = _.without(_.map(result, resBlock => {
                        // Check if block fits within layout width
                        if (inputBlock.width + resBlock.x > this.layoutWidth) {
                            return
                        }
                        if (targetBlock.y >= resBlock.y + resBlock.height) {
                            return
                        }
                        
                        return {
                            x: resBlock.x,
                            y: resBlock.y + resBlock.height,
                            width: inputBlock.width,
                            height: inputBlock.height,
                            position: "bottom",
                            sourceId: resBlock.id,
                            id: inputBlock.id,
                        }
                    }), undefined) as Position[]

                    if (possibleOptions.length > 0) {
                        return _.sortBy(possibleOptions, "y")[0]
                    }
                }), undefined) as Position[]

                return {
                    id: targetBlock.id,
                    optionsRight,
                    optionsLeft,
                    optionsBottom
                }
            }

            const positionOrder = {
                right: 1,
                bottom: 2,
                left: 3
            }

            function rectanglesOverlap(r1:Position | undefined, r2:Position | undefined) {
                if (!r1 || !r2) {
                    return undefined
                }
                return !(r2.x >= r1.x + r1.width ||
                         r2.x + r2.width <= r1.x ||
                         r2.y >= r1.y + r1.height ||
                         r2.y + r2.height <= r1.y)
            }
              
            const options = _.map(result, tb => {
                const data = getOptions(tb)
                const temp  =  _.chain([...data.optionsBottom, ...data.optionsLeft, ...data.optionsRight] as Array<Position | undefined>)
                    .orderBy(
                        ["y", item => positionOrder[item?.position || "right"]],
                        ["asc", "desc"]
                    )
                    .without(undefined)
                    .filter(dataRect =>
                        !_.some(result, resultRect => rectanglesOverlap(dataRect, resultRect))
                    )
                    .without(undefined)
                    .value()
                    
                return temp
                
            })

            const nextBlockOptions = _.chain(_.flatten(options))
                .orderBy(
                    ["y", item => positionOrder[item?.position || "right"]],
                    ["asc", "desc"]
                )
                .without(undefined)
                .take(1)
                .value() as  Array<Position>
                
            let nextBlock = nextBlockOptions[0]
            if (!nextBlock) {
                const lowestBlock = _.reverse(_.sortBy(result, block => block.y + block.height))[0]
                const lastBlock = inputBlocks[0]
                
                if (!lastBlock) {
                    done = true
                    continue
                }
                nextBlock = {
                    width: lastBlock.width,
                    height: lastBlock.height,
                    x: 0,
                    y: lowestBlock.y + lowestBlock.height,
                    id: lastBlock.id,
                    sourceId: "none"
                }
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
        
        this.output = result
        return result
    }
    
    // Generated by ChatGPT
    private bestFitAlgorithm() {
        const rows: { remainingWidth: number; y: number; maxHeight: number }[] = []

        for (const block of this.blocks) {
            // Find the best row that can fit this block
            let bestRow = null
            let minRemainingWidth = this.layoutWidth + 1

            for (const row of rows) {
                if (row.remainingWidth >= block.width && row.remainingWidth - block.width < minRemainingWidth) {
                    bestRow = row
                    minRemainingWidth = row.remainingWidth - block.width
                }
            }

            if (bestRow === null) {
                // No suitable row found, create a new one
                const newRowY = rows.length > 0 ? rows[rows.length - 1].y + rows[rows.length - 1].maxHeight : 0
                
                if (newRowY + block.height > this.layoutHeight) {
                    // If the block doesn't fit on the canvas, resize if autoResize is enabled
                    if (this.autoResize === "height") {
                        this.layoutHeight = newRowY + block.height
                    } else {
                        // No resizing allowed and no space left, stop placing more blocks
                        break
                    }
                }

                bestRow = {
                    remainingWidth: this.layoutWidth - block.width,
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
                x: this.layoutWidth - bestRow.remainingWidth - block.width,
                y: bestRow.y,
                width: block.width,
                height: block.height,
                id: block.id,
            })
        }
    }
    
    // Generated by ChatGPT
    private nextFitAlgorithm() {
        let currentX = 0
        let currentY = 0
        let maxHeightInRow = 0

        for (const block of this.blocks) {
            if (currentX + block.width > this.layoutWidth) {
                // Start a new row if the current block doesn't fit in the current row
                currentX = 0
                currentY += maxHeightInRow
                maxHeightInRow = 0
            }

            if (currentY + block.height > this.layoutHeight) {
                // If the block doesn't fit on the canvas, resize if autoResize is enabled
                if (this.autoResize === "height") {
                    this.layoutHeight = currentY + block.height
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

