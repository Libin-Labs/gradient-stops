export interface RGBA {
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
}
export interface ColorStop {
    readonly position: number;
    readonly color: RGBA;
}
export interface GradientOptions {
    readonly interpolation?: 'premultiplied' | 'straight';
}
/** Numeric interpolation only: encoded sRGB channels, no CSS parser or browser rendering. */
export declare class Gradient {
    #private;
    constructor(stops: readonly ColorStop[], options?: GradientOptions);
    /** Fresh snapshot; stable order preserves duplicate-position hard stops. */
    get stops(): readonly ColorStop[];
    /** Endpoint extension; at an exact duplicate position the last stop wins. */
    sample(t: number): RGBA;
}
