import { formatMove, priceRange, riskStyle, samplePoints } from '@/utils/market';

describe('samplePoints', () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  it('keeps the first and the newest point', () => {
    const sampled = samplePoints(hours, 6);
    expect(sampled).toHaveLength(6);
    expect(sampled[0]).toBe(0);
    expect(sampled[5]).toBe(23);
  });

  it('returns short series unchanged', () => {
    expect(samplePoints([1, 2, 3], 6)).toEqual([1, 2, 3]);
  });

  it('keeps only the newest point when asked for one', () => {
    expect(samplePoints(hours, 1)).toEqual([23]);
  });
});

describe('riskStyle', () => {
  it('maps each level the AI service returns', () => {
    expect(riskStyle('LOW').label).toBe('Low risk');
    expect(riskStyle('MODERATE').bg).toBe('bg-amber-100');
    expect(riskStyle('HIGH').text).toBe('text-orange-700');
    expect(riskStyle('EXTREME').label).toBe('Extreme risk');
  });

  it('falls back to grey for anything else', () => {
    expect(riskStyle(undefined).bg).toBe('bg-gray-100');
    expect(riskStyle('SOMETHING').label).toBe('Risk unknown');
  });
});

describe('formatMove', () => {
  it('shows the horizon volatility as a percentage', () => {
    expect(formatMove(0.0857)).toBe('±8.6%');
  });
});

describe('priceRange', () => {
  it('matches the AI service band around the shown price', () => {
    const { lower, upper } = priceRange(171348.4, 0.0857);
    expect(lower).toBeCloseTo(171348.4 * Math.exp(-0.0857), 6);
    expect(upper).toBeCloseTo(171348.4 * Math.exp(0.0857), 6);
    expect(lower).toBeLessThan(171348.4);
    expect(upper).toBeGreaterThan(171348.4);
  });
});
