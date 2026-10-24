import crypto from 'crypto';
import path from 'path';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, bucketName, presignedUrlExpiry, isS3Configured } from '../config/s3.js';
import logger from '../utils/logger.js';

// In-memory document storage fallback when AWS credentials are not configured in dev
const localBufferStore = new Map();

/**
 * Uploads an FDR PDF document to private AWS S3 bucket.
 * Generates an immutable, collision-free object key.
 * 
 * @param {Object} params
 * @param {Buffer} params.buffer File buffer
 * @param {string} params.originalFileName
 * @param {string} params.institutionId
 * @param {string} params.mimeType
 * @returns {Promise<{ s3BucketName: string, s3ObjectKey: string }>}
 */
export async function uploadFdrFile({ buffer, originalFileName, institutionId, mimeType = 'application/pdf' }) {
  if (!buffer || buffer.length === 0) {
    throw new Error('File buffer is empty or missing');
  }

  const fileExt = path.extname(originalFileName) || '.pdf';
  const sanitizedName = path.basename(originalFileName, fileExt).replace(/[^a-zA-Z0-9_-]/g, '_');
  const uniqueId = crypto.randomUUID();
  const s3ObjectKey = `institutions/${institutionId}/${uniqueId}-${sanitizedName}${fileExt}`;

  if (isS3Configured) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3ObjectKey,
      Body: buffer,
      ContentType: mimeType,
      ServerSideEncryption: 'AES256', // Encryption at rest in S3
      Metadata: {
        'institution-id': institutionId,
        'original-filename': encodeURIComponent(originalFileName),
        'uploaded-at': new Date().toISOString(),
      },
    });

    await s3Client.send(command);
    logger.info('FDR document uploaded to private S3', { s3ObjectKey, bucket: bucketName });
  } else {
    // Store in local memory store for preview/dev mode
    localBufferStore.set(s3ObjectKey, {
      buffer,
      mimeType,
      originalFileName,
      uploadedAt: new Date(),
    });
    logger.info('FDR document saved to local in-memory store (Dev mode)', { s3ObjectKey });
  }

  return {
    s3BucketName: bucketName,
    s3ObjectKey,
  };
}

/**
 * Generates a secure, time-limited pre-signed download URL for an S3 object.
 * 
 * @param {string} objectKey 
 * @param {number} [expiresIn] 
 * @returns {Promise<string>}
 */
export async function getPresignedDownloadUrl(objectKey, expiresIn = presignedUrlExpiry) {
  if (!objectKey) {
    throw new Error('S3 Object key is required to generate download URL');
  }

  if (isS3Configured) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn, // Default 300 seconds (5 minutes)
    });

    logger.debug('Generated pre-signed S3 download URL', { objectKey, expiresIn });
    return presignedUrl;
  }

  // Dev simulation: return data URL or placeholder link
  if (localBufferStore.has(objectKey)) {
    const item = localBufferStore.get(objectKey);
    const base64 = item.buffer.toString('base64');
    return `data:application/pdf;base64,${base64}`;
  }

  // Sample placeholder PDF data URL for seeded records
  return `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#${encodeURIComponent(objectKey)}`;
}

export default {
  uploadFdrFile,
  getPresignedDownloadUrl,
};
