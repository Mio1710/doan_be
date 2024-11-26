import {
  GetObjectAclCommandOutput,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import * as stream from 'stream';

// Load environment variables from .env file
dotenv.config();

const bucketName = process.env.S3_BUCKET_NAME;
const region = process.env.S3_REGION;
const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadFile(body, prefix) {
  const fileName = `${prefix}/${body.file_key}`;
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: body.file.buffer,
    ContentType: body.file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);
}

export async function downloadFile(key: string) {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  const command = new GetObjectCommand(params);
  return await s3.send(command);
}
