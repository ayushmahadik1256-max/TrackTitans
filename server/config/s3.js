import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const region = process.env.AWS_REGION || 'ap-south-1';
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
export const bucketName = process.env.AWS_S3_BUCKET || 'tracktitans-fdr-documents';
export const presignedUrlExpiry = parseInt(process.env.S3_PRESIGNED_URL_EXPIRY_SECONDS || '300', 10);

let s3ClientInstance = null;
export let isS3Configured = false;

if (accessKeyId && secretAccessKey) {
  s3ClientInstance = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
  isS3Configured = true;
  logger.info('AWS S3 Client initialized successfully', { region, bucket: bucketName });
} else {
  logger.warn('AWS credentials not provided. S3 operations will use simulated local storage fallback.');
  s3ClientInstance = new S3Client({
    region,
    credentials: {
      accessKeyId: 'MOCK_KEY',
      secretAccessKey: 'MOCK_SECRET',
    },
  });
}

export const s3Client = s3ClientInstance;
export default s3Client;
