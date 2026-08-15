import { describe, expect, it } from 'vitest';
import { buildPath, H, W } from '@/components/Home/sparkline';

const commands = (path: string) => path.match(/[ML][\d.]+ [\d.]+/g) ?? [];

describe('buildPath', () => {
  it('draws nothing until there are two points to join', () => {
    expect(buildPath([])).toBe('');
    expect(buildPath([5])).toBe('');
    expect(buildPath([null, null])).toBe('');
    expect(buildPath([null, 12109, null])).toBe('');
  });

  it('spans the full width and puts the larger value nearer the top', () => {
    const path = buildPath([100, 200]);
    const [start, end] = commands(path);

    expect(start).toBe(`M0.0 ${H.toFixed(1)}`);
    expect(end).toBe(`L${W.toFixed(1)} 0.0`);
  });

  it('breaks the line across missing days instead of drawing through them', () => {
    const path = buildPath([10, 20, null, null, 30, 40]);
    const drawn = commands(path);

    expect(drawn).toHaveLength(4);
    expect(drawn.filter((one) => one.startsWith('M'))).toHaveLength(2);
    expect(drawn[2].startsWith('M')).toBe(true);
  });

  it('keeps a gap the right width', () => {
    const path = buildPath([10, null, null, 40]);
    const drawn = commands(path);

    expect(drawn[0]).toBe(`M0.0 ${H.toFixed(1)}`);
    expect(drawn[1]).toBe(`M${W.toFixed(1)} 0.0`);
  });

  it('survives a series that never moved', () => {
    const path = buildPath([7, 7, 7]);

    expect(path).not.toContain('NaN');
    expect(commands(path)).toHaveLength(3);
  });

  it('scales to the range of the series, not to zero', () => {
    const path = buildPath([8_131_260, 8_500_000, 8_932_920]);
    const drawn = commands(path);

    const middleY = Number(drawn[1].split(' ')[1]);

    expect(middleY).toBeGreaterThan(2);
    expect(middleY).toBeLessThan(H - 2);
  });
});
