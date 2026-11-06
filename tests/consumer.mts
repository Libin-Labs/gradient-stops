import { Gradient, type RGBA, type ColorStop, type GradientOptions } from '@lp-labs/gradient-stops';
const color: RGBA = { r: 1, g: 0, b: 0, a: 1 };
const stops: readonly ColorStop[] = [{ position: 0, color }];
const options: GradientOptions = { interpolation: 'premultiplied' };
const g: Gradient = new Gradient(stops, options);
const sampled: RGBA = g.sample(0.5);
void sampled;
void g.stops;
// @ts-expect-error Alpha required.
new Gradient([{ position: 0, color: { r: 0, g: 0, b: 0 } }]);
// @ts-expect-error Only supported interpolation spaces.
new Gradient(stops, { interpolation: 'oklab' });
