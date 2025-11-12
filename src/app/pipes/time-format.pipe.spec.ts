import { TimeFormatPipe } from './time-format.pipe';

describe('TimeFormatPipe', () => {
  let pipe: TimeFormatPipe;

  beforeEach(() => {
    pipe = new TimeFormatPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('Valid time formatting', () => {
    it('should format 0 seconds as "0:00"', () => {
      expect(pipe.transform(0)).toBe('0:00');
    });

    it('should format 59 seconds as "0:59"', () => {
      expect(pipe.transform(59)).toBe('0:59');
    });

    it('should format 60 seconds as "1:00"', () => {
      expect(pipe.transform(60)).toBe('1:00');
    });

    it('should format 65 seconds as "1:05"', () => {
      expect(pipe.transform(65)).toBe('1:05');
    });

    it('should format 300 seconds (5 minutes) as "5:00"', () => {
      expect(pipe.transform(300)).toBe('5:00');
    });

    it('should format 125 seconds as "2:05"', () => {
      expect(pipe.transform(125)).toBe('2:05');
    });

    it('should format 3661 seconds (1 hour 1 minute 1 second) as "61:01"', () => {
      expect(pipe.transform(3661)).toBe('61:01');
    });

    it('should pad single digit seconds with zero', () => {
      expect(pipe.transform(5)).toBe('0:05');
      expect(pipe.transform(10)).toBe('0:10');
    });

    it('should format large numbers correctly', () => {
      expect(pipe.transform(9999)).toBe('166:39');
    });
  });

  describe('Edge cases', () => {
    it('should handle negative numbers by returning "0:00"', () => {
      expect(pipe.transform(-1)).toBe('0:00');
      expect(pipe.transform(-60)).toBe('0:00');
    });

    it('should handle decimal numbers by flooring to integer', () => {
      expect(pipe.transform(65.7)).toBe('1:05');
      expect(pipe.transform(59.9)).toBe('0:59');
    });

    it('should handle very large numbers', () => {
      expect(pipe.transform(99999)).toBe('1666:39');
    });
  });

  describe('Type handling', () => {
    it('should handle zero as edge case', () => {
      expect(pipe.transform(0)).toBe('0:00');
    });

    it('should handle single digit minutes', () => {
      expect(pipe.transform(540)).toBe('9:00');
    });

    it('should handle double digit minutes', () => {
      expect(pipe.transform(600)).toBe('10:00');
      expect(pipe.transform(660)).toBe('11:00');
    });
  });
});
