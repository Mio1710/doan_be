import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

@Injectable()
export class S3ClientUtil {
  constructor() {}

  async uploadFile(body) {
    const params = {
      Bucket: bucketName,
      Key: body.file_path,
      Body: body.file.buffer,
      ContentType: body.file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);
  }
}
