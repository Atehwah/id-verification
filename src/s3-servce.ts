import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class S3Uploader {
  private s3: S3Client;
  private bucket: string;

  constructor(
    accessKeyId: string,
    secretAccessKey: string,
    region: string,
    bucketName: string
  ) {
    this.bucket = bucketName;
    this.s3 = new S3Client({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
      }
    });
  }

  async uploadFile(folderName: string, file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();

    const params = {
      Bucket: this.bucket,
      Key: `${folderName}/${file.name}`,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type,
      ContentLength: file.size,
    };
    try {
      const command = new PutObjectCommand(params);
      const response = await this.s3.send(command);
      console.log('File uploaded', response);
      return `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
    } catch (error) {
      console.error('Error Uploading file', error);
      throw error;
    }
  }
}
