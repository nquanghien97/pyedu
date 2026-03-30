import { cloudinary } from '../../config/cloudinary';
import { Readable } from 'stream';

export const fileProcessorService = {
  uploadBufferToCloudinary: async (buffer: Buffer, mimetype: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'pyedu_chat_attachments', resource_type: 'auto' },
        (error, result) => {
          if (result) {
            resolve(result.secure_url);
          } else {
            console.error("Cloudinary upload error:", error);
            reject(error);
          }
        }
      );
      
      const stream = Readable.from(buffer);
      stream.pipe(uploadStream);
    });
  }
};
