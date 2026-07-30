import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import cloudinary from 'cloudinary';

// Configure Cloudinary with YOUR credentials
cloudinary.v2.config({
  cloud_name: 'k94lgst7',
  api_key: '559887484913466',
  api_secret: 'M784F1bhImTa8bfp13kTl1KpTC0',
});

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  upload.single('file')(req, res, async function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const filePath = req.file.path;

      console.log('Uploading to Cloudinary:', filePath);

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(
          filePath,
          {
            folder: 'famous-gifts',
            resource_type: 'auto',
          },
          (error, uploadResult) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(uploadResult);
            }
          }
        );
      });

      // Clean up local file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupErr) {
        console.warn('Cleanup warning:', cleanupErr.message);
      }

      return res.status(200).json({
        url: result.secure_url,
        public_id: result.public_id,
      });

    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ 
        error: uploadError.message || 'Upload failed',
      });
    }
  });
}