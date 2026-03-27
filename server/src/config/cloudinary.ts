import { v2 as cloudinary } from 'cloudinary';
import { ENV_VARS } from './env';

if (ENV_VARS.cloudinaryUrl) {
  cloudinary.config({
    url: ENV_VARS.cloudinaryUrl,
  });
}

export { cloudinary };
