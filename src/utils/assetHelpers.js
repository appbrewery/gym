// Helper function to get the correct asset path based on environment
export function getAssetPath(path) {
  const isProd = process.env.NODE_ENV === 'production';
  const basePath = isProd ? '/gym' : '';
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${basePath}${normalizedPath}`;
}