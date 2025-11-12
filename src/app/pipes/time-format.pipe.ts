import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pure pipe that transforms seconds into "MM:SS" format.
 *
 * @example
 * {{ 125 | timeFormat }} // Output: "2:05"
 * {{ 300 | timeFormat }} // Output: "5:00"
 * {{ 0 | timeFormat }}   // Output: "0:00"
 */
@Pipe({
  name: 'timeFormat',
  standalone: true,
  pure: true
})
export class TimeFormatPipe implements PipeTransform {
  /**
   * Transforms seconds into "MM:SS" format.
   *
   * @param seconds - The number of seconds to format
   * @returns Formatted time string in "MM:SS" format
   *
   * Edge cases:
   * - Negative numbers return "0:00"
   * - Decimals are floored to nearest integer
   * - Large numbers work correctly (e.g., 3661 => "61:01")
   */
  transform(seconds: number): string {
    // Handle negative numbers
    if (seconds < 0) {
      return '0:00';
    }

    // Floor decimal numbers
    const totalSeconds = Math.floor(seconds);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    // Format with padded seconds
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
