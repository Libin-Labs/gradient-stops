"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gradient = void 0;
function color(c) {
    if (![c.r, c.g, c.b, c.a].every((v) => Number.isFinite(v) && v >= 0 && v <= 1))
        throw new RangeError('RGBA channels must be in [0,1]');
}
function position(x) {
    if (!Number.isFinite(x) || x < 0 || x > 1)
        throw new RangeError('Position outside [0,1]');
}
/** Numeric interpolation only: encoded sRGB channels, no CSS parser or browser rendering. */
class Gradient {
    #stops;
    #mode;
    constructor(stops, options = {}) {
        if (stops.length < 1 || stops.length > 4096)
            throw new RangeError('Expected 1..4096 stops');
        this.#mode = options.interpolation ?? 'premultiplied';
        if (this.#mode !== 'premultiplied' && this.#mode !== 'straight')
            throw new RangeError('Invalid interpolation');
        this.#stops = stops
            .map((s) => {
            position(s.position);
            color(s.color);
            return { position: s.position, color: { ...s.color } };
        })
            .sort((a, b) => a.position - b.position);
    }
    /** Fresh snapshot; stable order preserves duplicate-position hard stops. */
    get stops() {
        return this.#stops.map((s) => ({ position: s.position, color: { ...s.color } }));
    }
    /** Endpoint extension; at an exact duplicate position the last stop wins. */
    sample(t) {
        position(t);
        let low = 0, high = this.#stops.length;
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (this.#stops[mid].position <= t)
                low = mid + 1;
            else
                high = mid;
        }
        if (low === 0)
            return { ...this.#stops[0].color };
        const left = this.#stops[low - 1];
        if (low === this.#stops.length || left.position === t)
            return { ...left.color };
        const right = this.#stops[low], u = (t - left.position) / (right.position - left.position), a = left.color.a * (1 - u) + right.color.a * u;
        const blend = (key) => {
            if (this.#mode === 'straight')
                return left.color[key] * (1 - u) + right.color[key] * u;
            return a === 0
                ? 0
                : (left.color[key] * left.color.a * (1 - u) + right.color[key] * right.color.a * u) / a;
        };
        return { r: blend('r'), g: blend('g'), b: blend('b'), a };
    }
}
exports.Gradient = Gradient;
