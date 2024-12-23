import moment from 'moment';

/**
 * Formats an ISO date string into the specified format.
 *
 * @param isoDate - The ISO date string (e.g., "2024-12-09T20:14:51.180Z").
 * @param format - The desired date format (default is "DD/MM/YYYY").
 * @returns The formatted date string (e.g., "09/12/2024").
 */
export function formatDate(
  isoDate: string,
  format: string = 'DD/MM/YYYY',
): string {
  if (!isoDate) {
    throw new Error('Invalid ISO date string');
  }
  return moment(isoDate).format(format);
}
