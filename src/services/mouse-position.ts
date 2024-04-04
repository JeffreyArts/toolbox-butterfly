
export default {
    xy(e:MouseEvent) {
        let x = 0
        let y = 0
            
        if (!e.currentTarget) {
            throw new Error("Missing currentTarget property")
        }
        const target = e.currentTarget as HTMLElement

        x = e.clientX - target.offsetLeft
        y = e.clientY - target.offsetTop

        return {x,y}
    },
    x(e:MouseEvent) {
        let x = 0
        
        if (!e.currentTarget) {
            throw new Error("Missing currentTarget property")
        }
        const target = e.currentTarget as HTMLElement

        x = e.clientX - target.offsetLeft

        return x
    },
    y(e:MouseEvent) {
        let y = 0
            
        if (!e.currentTarget) {
            throw new Error("Missing currentTarget property")
        }
        const target = e.currentTarget as HTMLElement

        y = e.clientY - target.offsetTop

        return y
    },
}