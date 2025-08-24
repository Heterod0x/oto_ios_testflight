// Polyfill for ox/core/TypedData.js
// This is a minimal implementation to satisfy the import requirements

export const encodeTypedData = (typedData: any): string => {
  // Simple implementation for React Native
  // In a real implementation, you'd use a proper EIP-712 encoding library
  return JSON.stringify(typedData);
};

export const hashTypedData = (typedData: any): string => {
  // For now, return a placeholder hash
  // In a real implementation, you'd use a proper EIP-712 hashing library
  const encoded = encodeTypedData(typedData);
  let hash = 0;
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return '0x' + hash.toString(16);
};

export default {
  encodeTypedData,
  hashTypedData,
};
