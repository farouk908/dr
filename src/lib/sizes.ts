export const standardScale = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL', '6XL', '7XL'];

export function getExtendedSizes(sizes: string[] | undefined | null): string[] {
  if (!sizes || sizes.length === 0) return [];
  
  // If the admin did not put a size, or put "One Size Fits All" or "Free Size", don't change it.
  const firstSizeLower = sizes[0]?.toLowerCase().trim();
  if (sizes.length === 1 && (!firstSizeLower || firstSizeLower.includes('one size') || firstSizeLower.includes('free size') || firstSizeLower === 'all')) {
    return sizes;
  }

  // Check if there are standard sizes in the list
  const standardScaleUpper = standardScale.map(s => s.toUpperCase());
  
  // Find the smallest standard size index present in `sizes`
  let minIndex = -1;
  for (let i = 0; i < standardScaleUpper.length; i++) {
    if (sizes.some(sz => sz.trim().toUpperCase() === standardScaleUpper[i])) {
      minIndex = i;
      break;
    }
  }

  if (minIndex !== -1) {
    // We found a standard size!
    // Construct standard sequence from minIndex to the end (7XL)
    const extended = standardScale.slice(minIndex);
    
    // Find any custom sizes in the admin's original list that are not in standardScale
    const customSizes = sizes.filter(sz => {
      const upper = sz.trim().toUpperCase();
      return !standardScaleUpper.includes(upper);
    });
    
    return [...customSizes, ...extended];
  }

  // If no standard sizes found (all custom or unknown), return as-is
  return sizes;
}
