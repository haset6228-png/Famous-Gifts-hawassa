import multer from 'multer';
import cloudinary from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

// Configure Cloudinary with YOUR credentials
cloudinary.v2.config({
  cloud_name: 'k94lgst7',
  api_key: '559887484913466',
  api_secret: 'M784F1bhImTa8bfp13kTl1KpTC0',
});

// Use memory storage (no filesystem writing)
const storage = multer.memoryStorage();

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
      // Upload directly from memory buffer to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          {
            folder: 'famous-gifts',
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
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

        // Write the buffer to the upload stream
        uploadStream.end(req.file.buffer);
      });

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