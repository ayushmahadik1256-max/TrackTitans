import crypto from 'crypto';

/**
 * Calculates SHA-256 hex checksum of a buffer or string
 * @param {Buffer|string} data 
 * @returns {string} Hexadecimal SHA-256 digest
 */
export function calculateSha256(data) {
  if (!data) {
    throw new Error('Data is required to calculate SHA-256 checksum');
  }
  return crypto.createHash('sha256').update(data).digest('hex');
}

export default calculateSha256;
