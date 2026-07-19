export const standardScale = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL', '7XL'];

export function getExtendedSizes(sizes: string[] | undefined | null): string[] {
  if (!sizes || sizes.length === 0) return [];
  // Return the original array as chosen in the admin panel, without extending it automatically
  return sizes.map(s => s.trim()).filter(Boolean);
}
