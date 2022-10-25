import 'dotenv/config';
import admin from 'firebase-admin';
import { Bucket, File } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { unlink } from 'fs';
import { Injectable } from '@nestjs/common';
import { MethodNotAllowedResponse } from '../../errors/MethodNotAllowedResponse';

@Injectable()
export class FirebaseService {
  private storage: Bucket;

  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    this.storage = admin.storage().bucket();
  }

  async uploadImage(image: Express.Multer.File, prefix = 'uploadedImage') {
    const fileId = uuidv4();
    const metadata = {
      // used to create a download token
      metadata: { firebaseStorageDownloadTokens: fileId },
      contentType: 'image/jpeg',
      cacheControl: 'public, max-age=31536000',
    };
    const filePath = `${prefix}-${fileId}`;

    let data: any;
    try {
      data = await this.storage.upload(`uploads/${image.filename}`, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: true,
        metadata: metadata,
        destination: filePath,
      });
    } catch {
      throw new MethodNotAllowedResponse({
        ar: 'خطأ داخلى فى رفع الصور، برجاء إعادة المحاولة',
        en: 'Error uploading images to the cloud, please try again.',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unlink(`${process.cwd()}/uploads/${image.filename}`, () => {});

    return {
      fileName: image.originalname,
      fileLink: this.getDownloadLink(data[0], fileId),
      size: data[0].metadata.size,
      fileId: fileId,
      filePath: filePath,
    };
  }

  async deleteFileFromStorage(filePath: string) {
    try {
      await this.storage.file(filePath).delete();
    } catch (error) {
      console.error(error);
    }
  }

  getDownloadLink(file: File, downloadToken: string) {
    return (
      'https://firebasestorage.googleapis.com/v0/b/' +
      this.storage.name +
      '/o/' +
      encodeURIComponent(file.name) +
      '?alt=media&token=' +
      downloadToken
    );
  }

  async deleteUser(uid: string) {
    await admin.auth().deleteUser(uid);
  }
}
