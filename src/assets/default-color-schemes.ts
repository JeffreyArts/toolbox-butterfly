
export interface ColorScheme {
    id: number;
    colors: Array<string>;
    disabled?: boolean;
}

export default [{id: 1, colors: ["#9f0","#f09"], disabled: false}] as Array<ColorScheme>