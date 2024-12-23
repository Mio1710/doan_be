import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const region = process.env.REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_KEY 

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadFile(body, fileKey) {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
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

export async function deleteFile(key: string) {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  const command = new DeleteObjectCommand(params);
  await s3.send(command);
}
