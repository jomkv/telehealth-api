import { v2 as cloudinary } from 'cloudinary';
import { ENV_VARS } from './env-variables';

cloudinary.config({
  cloud_name: ENV_VARS.cloudinaryCloudName(),
  api_key: ENV_VARS.cloudinaryApiKey(),
  api_secret: ENV_VARS.cloudinaryApiSecret(),
  secure: true,
});

export async function uploadProfilePic(
  source: string | Buffer,
): Promise<string> {
  // If buffer provided, use upload_stream
  if (Buffer.isBuffer(source)) {
    return await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'profile_pics',
          overwrite: true,
          resource_type: 'image',
        },
        (err, result) => {
          if (err) return reject(err);
          if (!result || !result.secure_url)
            return reject(new Error('Upload failed'));
          resolve(result.secure_url);
        },
      );

      stream.end(source);
    });
  }

  // source can be a base64 data URL or a publicly accessible URL
  const res = await cloudinary.uploader.upload(source as string, {
    folder: 'profile_pics',
    overwrite: true,
    resource_type: 'image',
  });

  return res.secure_url;
}
