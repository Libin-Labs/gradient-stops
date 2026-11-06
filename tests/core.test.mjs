import test from 'node:test';
import assert from 'node:assert/strict';
import { Gradient } from '../dist/esm/index.js';
const red = { r: 1, g: 0, b: 0, a: 1 },
  blue = { r: 0, g: 0, b: 1, a: 1 },
  stop = (position, color) => ({ position, color });
test('straight interpolation and endpoint extension', () => {
  const g = new Gradient([stop(0.2, red), stop(0.8, blue)], { interpolation: 'straight' });
  assert.deepEqual(g.sample(0), red);
  assert.deepEqual(g.sample(1), blue);
  const c = g.sample(0.5);
  assert.ok(Math.abs(c.r - 0.5) < 1e-12);
  assert.ok(Math.abs(c.b - 0.5) < 1e-12);
});
test('stable sorting and right-continuous hard stops', () => {
  const g = new Gradient([stop(1, blue), stop(0.5, red), stop(0.5, blue), stop(0, red)]);
  assert.deepEqual(g.sample(0.5), blue);
  assert.deepEqual(g.sample(0.5 - 1e-10), red);
  assert.deepEqual(
    g.stops.map((s) => s.position),
    [0, 0.5, 0.5, 1],
  );
});
test('premultiplied transparent color avoids color bleed', () => {
  const transparent = { ...red, a: 0 },
    g = new Gradient([stop(0, transparent), stop(1, blue)]);
  assert.deepEqual(g.sample(0.5), { r: 0, g: 0, b: 1, a: 0.5 });
  const straight = new Gradient([stop(0, transparent), stop(1, blue)], {
    interpolation: 'straight',
  });
  assert.equal(straight.sample(0.5).r, 0.5);
});
test('zero alpha and single-stop exact semantics', () => {
  const c = { r: 1, g: 1, b: 1, a: 0 },
    g = new Gradient([stop(0, c), stop(1, c)]);
  assert.deepEqual(g.sample(0.5), { r: 0, g: 0, b: 0, a: 0 });
  assert.deepEqual(g.sample(0), c);
  assert.deepEqual(new Gradient([stop(0.5, red)]).sample(0), red);
});
test('finite bounds and maximum count validation', () => {
  for (const p of [NaN, -0.1, 1.1]) assert.throws(() => new Gradient([stop(p, red)]), RangeError);
  assert.throws(() => new Gradient([]), RangeError);
  assert.throws(() => new Gradient([stop(0, { ...red, a: Infinity })]), RangeError);
  assert.throws(() => new Gradient([stop(0, red)], { interpolation: 'linear-light' }), RangeError);
  assert.throws(() => new Gradient(Array(4097).fill(stop(0, red))), RangeError);
  assert.ok(new Gradient(Array(4096).fill(stop(0, red))));
  assert.throws(() => new Gradient([stop(0, red)]).sample(Infinity), RangeError);
});
test('deep ownership of inputs snapshots and samples', () => {
  const input = [stop(0, { ...red }), stop(1, { ...blue })],
    g = new Gradient(input);
  input[0].color.r = 0;
  const snapshot = g.stops;
  snapshot[0].color.r = 0;
  const c = g.sample(0);
  c.r = 0;
  assert.deepEqual(g.sample(0), red);
});
test('seeded independent premultiplied mixing reference', () => {
  let seed = 419;
  const random = () => (seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32;
  for (let i = 0; i < 100; i++) {
    const a = { r: random(), g: random(), b: random(), a: random() },
      b = { r: random(), g: random(), b: random(), a: random() },
      t = random();
    const value = new Gradient([stop(0, a), stop(1, b)]).sample(t),
      alpha = a.a + (b.a - a.a) * t;
    for (const key of ['r', 'g', 'b']) {
      const premul = a[key] * a.a + (b[key] * b.a - a[key] * a.a) * t;
      assert.ok(Math.abs(value[key] - premul / alpha) < 1e-12);
    }
    assert.ok(Math.abs(value.a - alpha) < 1e-12);
  }
});
