import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Lazy configuration - only configure when actually used
let isConfigured = false;

const configureCloudinary = () => {
  if (isConfigured) return;

  let cloudName, apiKey, apiSecret;

  if (process.env.CLOUDINARY_URL) {
    // Parse CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
    const url = process.env.CLOUDINARY_URL;
    const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (match) {
      apiKey = match[1];
      apiSecret = match[2];
      cloudName = match[3];
    }
  } else {
    // Use individual variables
    cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    apiKey = process.env.CLOUDINARY_API_KEY;
    apiSecret = process.env.CLOUDINARY_API_SECRET;
  }

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });
    isConfigured = true;
    console.log('✅ Cloudinary credentials configured successfully');
  } else {
    console.warn('⚠️  Cloudinary credentials not set. Image uploads will fail.');
    console.warn('   Please set either:');
    console.warn('   - CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name');
    console.warn('   - OR CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
  }
};

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload image to Cloudinary
export const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    // Configure Cloudinary if not already configured
    configureCloudinary();
    
    if (!isConfigured) {
      reject(new Error('Cloudinary credentials not configured. Please set either CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file'));
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'shopease',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Configure Cloudinary if not already configured
    configureCloudinary();
    
    if (!isConfigured) {
      console.error('Cloudinary not configured, cannot delete image');
      return;
    }
    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{filename}
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
      // Get everything after 'upload' and before file extension
      const pathParts = urlParts.slice(uploadIndex + 2); // Skip 'upload' and version
      const publicId = pathParts.join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

