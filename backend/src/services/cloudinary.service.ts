import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary設定
const isConfigured = 
  !!process.env.CLOUDINARY_CLOUD_NAME && 
  !!process.env.CLOUDINARY_API_KEY && 
  !!process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.log('========================================');
  console.log('Cloudinary not configured. Mock images will be used.');
  console.log('========================================');
}

export class CloudinaryService {
  static async uploadImage(fileBuffer: Buffer, folder = 'keionote'): Promise<string> {
    if (!isConfigured) {
      // 設定されていない場合はダミー画像を返す
      const dummyImages = [
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600'
      ];
      const randomIndex = Math.floor(Math.random() * dummyImages.length);
      return dummyImages[randomIndex];
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return reject(new Error('Failed to upload image to Cloudinary'));
          }
          resolve(result?.secure_url || '');
        }
      );
      uploadStream.end(fileBuffer);
    });
  }
}
