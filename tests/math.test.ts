import { describe, it, expect } from 'vitest';
import { clamp, lerp, sign } from '../src/core/math';

describe('clamp', () => {
  it('returns value when within range', () => expect(clamp(5, 0, 10)).toBe(5));
  it('clamps below min', () => expect(clamp(-3, 0, 10)).toBe(0));
  it('clamps above max', () => expect(clamp(99, 0, 10)).toBe(10));
});

describe('lerp', () => {
  it('returns a at t=0', () => expect(lerp(10, 20, 0)).toBe(10));
  it('returns b at t=1', () => expect(lerp(10, 20, 1)).toBe(20));
  it('returns midpoint at t=0.5', () => expect(lerp(10, 20, 0.5)).toBe(15));
});

describe('sign', () => {
  it('handles negative', () => expect(sign(-4)).toBe(-1));
  it('handles positive', () => expect(sign(4)).toBe(1));
  it('handles zero', () => expect(sign(0)).toBe(0));
});
