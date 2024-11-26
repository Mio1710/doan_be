import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
  } from '@aws-sdk/client-s3';
  import * as uuid from 'uuid';
  import * as stream from 'stream';
  
  // S3 client for production
  const s3Client = new S3Client({
    region: process.env.S3_REGION,
  });
  
 
  // need install
  // npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid
  // npm install -D @types/multer

  export async function uploadJsonToS3(
    data: Express.Multer.File,
    prefix: string,
    messageId: string,
  ): Promise<string> {
    const bucketName = process.env.KCCS_INPUT_BUCKET;
  
    // Generate a unique file name using UUID
    const fileName = `${prefix}/${messageId}_${uuid.v4()}.json`;
  
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: data.buffer,
      ContentType: data.mimetype,
    });
  
    await s3Client.send(command);
  
    return fileName;
  }
  
  export async function downloadFileFromS3(
    bucket: string,
    key: string,
  ): Promise<stream.Readable> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
  
    const response = await s3Client.send(command);
  
    return response.Body as stream.Readable;
  }
  