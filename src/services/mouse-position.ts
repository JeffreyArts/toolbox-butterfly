
export default {
    xy(e:MouseEvent) {
        let x = 0
        let y = 0
            
        if (!e.currentTarget) {
            throw new Error("Missing currentTarget property")
        }
        const target = e.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()
        x = e.clientX - rect.x
        y = e.clientY - rect.y

        return {x,y}
    },
    x(e:MouseEvent) {
        let x = 0
        
        if (!e.currentTarget) {
            throw new Error("Missing currentTarget property")
        }
        const target = e.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()
        x = e.clientX - rect.x

        return x
    },
    y(e:MouseEvent) {
        let y = 0
            
        if (!e.currentTarget) {
            throw new Error("Missing currentTarget property")
        }
        const target = e.currentTarget as HTMLElement
        const rect = target.getBoundingClientRect()
        y = e.clientY - rect.y

        return y
    },
}