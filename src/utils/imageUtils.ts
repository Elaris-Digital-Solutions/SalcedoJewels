
export const getOptimizedImageUrl = (url: string, width: number = 500, brightness: number = 100, contrast: number = 100) => {
  if (!url) return '';

  // Check if it's a Cloudinary URL
  if (url.includes('cloudinary.com')) {
    // If it already has transformations, we might want to replace or append. 
    // For simplicity, let's assume standard upload URL structure.
    // Pattern: /upload/v... or /upload/folder/v...

    // We want to insert transformation after /upload/
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const prefix = url.substring(0, uploadIndex + 8); // include '/upload/'
      const suffix = url.substring(uploadIndex + 8);

      // Calculate Cloudinary values (offset from 100)
      const b = brightness - 100;
      const c = contrast - 100;

      // Build transformations string (separate components with slashes)
      let transforms = '';

      // Add effects first
      if (b !== 0) transforms += `e_brightness:${b}/`;
      if (c !== 0) transforms += `e_contrast:${c}/`;

      // Add standard optimizations
      transforms += `w_${width},q_auto,f_auto`;

      return `${prefix}${transforms}/${suffix}`;
    }
  }

  return url;
};
