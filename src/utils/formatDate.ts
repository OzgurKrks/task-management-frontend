/**
 * Format a date string or timestamp to a human-readable format
 * @param dateString - The date string or timestamp to format
 * @returns Formatted date string (e.g., "Jan 15, 2023, 14:30")
 */
export const formatDate = (dateString: string | number | Date): string => {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  
  // Check if date is invalid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  // Format date with Intl.DateTimeFormat
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}; 