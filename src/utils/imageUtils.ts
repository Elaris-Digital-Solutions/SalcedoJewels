
export const getOptimizedImageUrl = (url: string, width: number = 500) => {
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
      
      // Add width, quality auto, format auto
      return `${prefix}w_${width},q_auto,f_auto/${suffix}`;
    }
  }
  
  return url;
};
