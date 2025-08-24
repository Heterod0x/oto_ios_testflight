// Polyfill for ox/core/Signature.js
// This is a minimal implementation to satisfy the import requirements

export const splitSignature = (signature: string) => {
  // Split signature into r, s, v components
  const cleanSig = signature.startsWith('0x') ? signature.slice(2) : signature;
  
  if (cleanSig.length !== 130) {
    throw new Error('Invalid signature length');
  }
  
  const r = '0x' + cleanSig.slice(0, 64);
  const s = '0x' + cleanSig.slice(64, 128);
  const v = parseInt(cleanSig.slice(128, 130), 16);
  
  return { r, s, v };
};

export const joinSignature = (signature: { r: string; s: string; v: number }) => {
  const { r, s, v } = signature;
  const rClean = r.startsWith('0x') ? r.slice(2) : r;
  const sClean = s.startsWith('0x') ? s.slice(2) : s;
  const vHex = v.toString(16).padStart(2, '0');
  
  return '0x' + rClean + sClean + vHex;
};

export default {
  splitSignature,
  joinSignature,
};
