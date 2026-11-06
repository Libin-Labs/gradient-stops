# @lp-labs/gradient-stops

Stable numeric RGBA gradient stops and duplicate hard-stop sampling, not CSS parsing, browser rendering or color-space conversion.

Catalog ID 419. Version 0.1.0. Standalone, zero runtime, peer or sibling dependencies.
Node.js >=18; strict TypeScript; NodeNext ESM and CommonJS with separate declaration trees.

## Install

```sh
npm install @lp-labs/gradient-stops
```

## Quickstart (JavaScript ESM)

```js
import { Gradient } from '@lp-labs/gradient-stops';
const gradient = new Gradient([
  { position: 0, color: { r: 1, g: 0, b: 0, a: 0 } },
  { position: 1, color: { r: 0, g: 0, b: 1, a: 1 } },
]);
console.log(gradient.sample(0.5)); // { r: 0, g: 0, b: 1, a: 0.5 }
```

CommonJS exposes the same named exports with `require('@lp-labs/gradient-stops')`.
Use the bare package name in NodeNext TypeScript `.mts` and `.cts` consumers.
The package has no default export, global side effects, browser globals, network access or file access.

## Contracts, options, errors and customization

- `new Gradient(stops,options)` requires `1..4096` stops, finite positions `[0,1]`, and finite RGBA channels `[0,1]`. Stops are deep-copied and stably sorted; duplicate positions keep input order.
- `sample(t)` requires finite progress `[0,1]`, extends endpoint colors, and at an exact duplicate position returns the last duplicate (right-continuous hard stop). Just before duplicates it approaches the first duplicate from the left. One-stop gradients extend that single color everywhere.
- `interpolation='premultiplied'` by default: interpolate encoded sRGB channels times alpha, interpolate alpha, then unpremultiply. Zero interpolated alpha produces zero RGB. `'straight'` mixes channels directly. Exact stop/extended endpoint colors are preserved, including hidden RGB at alpha zero; this differs intentionally from zero-alpha interior samples.
- `stops` getter returns a fresh deep snapshot; samples are copies. `RangeError` rejects invalid counts, channels, modes or positions. No implicit defaults for missing alpha, no linear-light interpolation, no CSS repeat/spread, no browser color-management claims.
- Constructor O(n log n), storage O(n); sampling O(log n), snapshot O(n). Customize interpolation mode and explicit stop positions/colors. Floating-point interpolation rounds normally; the class owns all data.

## Complete public declarations

All runtime exports, public types, options and return values follow. Readonly declarations
describe caller-facing ownership; results are not recursively frozen at runtime.

```ts
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
```

## Development and verification

```sh
npm ci --offline --ignore-scripts --no-audit --no-fund
npm run build
npm run typecheck
npm test
npm run format:check
```

An offline install requires the pinned lockfile's development packages in the local npm cache.
Development-only dependencies: TypeScript ^5.9.3 and Prettier ^3.6.2.
Build emits `dist/esm` and `dist/cjs`, each with declarations; CommonJS has its own package boundary.
Tests cover finite bounds, degeneracy, ownership, work limits, deterministic results and independent reference checks.
Consumer fixtures exercise bare-package ESM/CJS declaration resolution with negative compile-time checks.
Only dist, README, LICENSE and package metadata are published. No automatic publishing is performed.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
