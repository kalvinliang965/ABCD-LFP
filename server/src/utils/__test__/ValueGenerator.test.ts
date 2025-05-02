import { create_value_source, ValueGenerator, ValueSource } from '../ValueGenerator';
import { DistributionType, StatisticType } from '../../core/Enums';

describe('create_value_source', () => {
  let source: ValueSource;

  beforeAll(() => {
    source = create_value_source('test-seed');
  });

  describe('FIXED distribution', () => {
    const fixedValue = 5;
    let fixedGen: ValueGenerator;

    beforeAll(() => {
      fixedGen = source.create_value_generator(
        DistributionType.FIXED,
        new Map([[StatisticType.VALUE, fixedValue]])
      );
    });

    test('should always return fixed value', () => {
      expect(fixedGen.sample()).toBe(fixedValue);
      expect(fixedGen.sample()).toBe(fixedValue);
    });

    test('should have correct metadata', () => {
      expect(fixedGen._distribution_type).toBe(DistributionType.FIXED);
      expect(fixedGen._value).toBe(fixedValue);
    });

    test('equal() should work correctly', () => {
      const sameGen = source.create_value_generator(
        DistributionType.FIXED,
        new Map([[StatisticType.VALUE, fixedValue]])
      );
      const diffGen = source.create_value_generator(
        DistributionType.FIXED,
        new Map([[StatisticType.VALUE, 10]])
      );
      expect(fixedGen.equal(sameGen)).toBe(true);
      expect(fixedGen.equal(diffGen)).toBe(false);
    });

    test('should throw on missing parameters', () => {
      expect(() => source.create_value_generator(DistributionType.FIXED, new Map())).toThrow(/value/);
    });
  });

  describe('NORMAL distribution', () => {
    const mean = 10;
    const stdev = 2;
    let normalGen: any;
    const samples: number[] = [];

    beforeAll(() => {
      normalGen = source.create_value_generator(
        DistributionType.NORMAL,
        new Map([
          [StatisticType.MEAN, mean],
          [StatisticType.STDEV, stdev]
        ])
      );
      // Generate 1000 samples for statistical testing
      for (let i = 0; i < 1000; i++) samples.push(normalGen.sample());
    });

    test('should have correct metadata', () => {
      expect(normalGen._distribution_type).toBe(DistributionType.NORMAL);
      expect(normalGen._mean).toBe(mean);
      expect(normalGen._stdev).toBe(stdev);
    });

    test('should approximate normal distribution', () => {
      const sampleMean = samples.reduce((a, b) => a + b, 0) / samples.length;
      const sampleVar = samples.reduce((a, b) => a + Math.pow(b - sampleMean, 2), 0) / (samples.length - 1);
      
      expect(sampleMean).toBeCloseTo(mean, 0);
      expect(Math.sqrt(sampleVar)).toBeCloseTo(stdev, 0);
    });

    test('equal() should work correctly', () => {
      const sameGen = source.create_value_generator(
        DistributionType.NORMAL,
        new Map([
          [StatisticType.MEAN, mean],
          [StatisticType.STDEV, stdev]
        ])
      );
      const diffGen = source.create_value_generator(
        DistributionType.NORMAL,
        new Map([
          [StatisticType.MEAN, 15],
          [StatisticType.STDEV, stdev]
        ])
      );
      expect(normalGen.equal(sameGen)).toBe(true);
      expect(normalGen.equal(diffGen)).toBe(false);
    });

    test('should throw on missing parameters', () => {
      expect(() => source.create_value_generator(
        DistributionType.NORMAL,
        new Map([[StatisticType.MEAN, mean]])
      )).toThrow(/standard deviation/);
    });
  });

  describe('UNIFORM distribution', () => {
    const min = 5;
    const max = 10;
    let uniformGen: any;

    beforeAll(() => {
      uniformGen = source.create_value_generator(
        DistributionType.UNIFORM,
        new Map([
          [StatisticType.LOWER, min],
          [StatisticType.UPPER, max]
        ])
      );
    });

    it('should generate values within range', () => {
      for (let i = 0; i < 1000; i++) {
        const val = uniformGen.sample();
        expect(val).toBeGreaterThanOrEqual(min);
        expect(val).toBeLessThanOrEqual(max);
      }
    });

    it('should have correct metadata', () => {
      expect(uniformGen._distribution_type).toBe(DistributionType.UNIFORM);
      expect(uniformGen._min).toBe(min);
      expect(uniformGen._max).toBe(max);
    });

    it('equal() should work correctly', () => {
      const sameGen = source.create_value_generator(
        DistributionType.UNIFORM,
        new Map([
          [StatisticType.LOWER, min],
          [StatisticType.UPPER, max]
        ])
      );
      const diffGen = source.create_value_generator(
        DistributionType.UNIFORM,
        new Map([
          [StatisticType.LOWER, min],
          [StatisticType.UPPER, 15]
        ])
      );
      expect(uniformGen.equal(sameGen)).toBe(true);
      expect(uniformGen.equal(diffGen)).toBe(false);
    });

    it('should throw on missing parameters', () => {
      expect(() => source.create_value_generator(
        DistributionType.UNIFORM,
        new Map([[StatisticType.LOWER, min]])
      )).toThrow(/upperbound/);
    });
  });

  describe('PRNG behavior', () => {
    it('should produce consistent result with same seed for uniform', () => {
      const source1 = create_value_source('consistent-seed');
      const source2 = create_value_source('consistent-seed');
      
      const gen1 = source1.create_value_generator(
        DistributionType.UNIFORM,
        new Map([
          [StatisticType.LOWER, 2000],
          [StatisticType.UPPER, 2025]
        ])
      );
      
      const gen2 = source2.create_value_generator(
        DistributionType.UNIFORM,
        new Map([
          [StatisticType.LOWER, 2000],
          [StatisticType.UPPER, 2025]
        ])
      );

      for (let i = 0; i < 10; i++) {
        expect(gen1.sample()).toBe(gen2.sample());
      }
    }),
    it('should produce consistent results with same seed for normal', () => {
      const source1 = create_value_source('consistent-seed');
      const source2 = create_value_source('consistent-seed');
      
      const gen1 = source1.create_value_generator(
        DistributionType.NORMAL,
        new Map([
          [StatisticType.MEAN, 0],
          [StatisticType.STDEV, 1]
        ])
      );
      
      const gen2 = source2.create_value_generator(
        DistributionType.NORMAL,
        new Map([
          [StatisticType.MEAN, 0],
          [StatisticType.STDEV, 1]
        ])
      );

      for (let i = 0; i < 10; i++) {
        expect(gen1.sample()).toBe(gen2.sample());
      }
    });
  });

  describe('Error handling', () => {
    test('should throw on invalid distribution type', () => {
      expect(() => source.create_value_generator('INVALID' as DistributionType, new Map()))
        .toThrow('Invalid distribution type');
    });
  });
});