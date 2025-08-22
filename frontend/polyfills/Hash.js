// Polyfill for ox/core/Hash.js
// This is a minimal implementation to satisfy the import requirements

export const hash = (data: string): string => {
  // Simple hash implementation for React Native
  let hash = 0;
  if (data.length === 0) return hash.toString();
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
};

export const keccak256 = (data: string): string => {
  // For now, return a placeholder hash
  // In a real implementation, you'd use a proper keccak256 library
  return hash(data);
};

export default {
  hash,
  keccak256,
};
