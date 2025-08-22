// Polyfill for ox/core/Hex.js
// This is a minimal implementation to satisfy the import requirements

export const fromHex = (hex: string): Uint8Array => {
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  
  // Convert hex string to Uint8Array
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes;
};

export const toHex = (bytes: Uint8Array): string => {
  return '0x' + Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const isHex = (value: string): boolean => {
  const cleanHex = value.startsWith('0x') ? value.slice(2) : value;
  return /^[0-9a-fA-F]+$/.test(cleanHex);
};

export default {
  fromHex,
  toHex,
  isHex,
};
