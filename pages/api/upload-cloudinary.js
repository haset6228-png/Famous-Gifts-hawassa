import cloudinary from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: 'k94lgst7',
  api_key: '559887484913466',
  api_secret: 'M784F1bhImTa8bfp13kTl1KpTC0',
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, type } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploading to Cloudinary...');

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(
        file,
        {
          folder: 'famous-gifts',
          resource_type: 'auto',
          public_id: uuidv4(),
        },
        (error, uploadResult) => {
          if (error) {
            console.error('Cloudinary error:', error);
            reject(error);
          } else {
            resolve(uploadResult);
          }
        }
      );
    });

    console.log('Upload successful:', result.secure_url);

    return res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: error.message || 'Upload failed',
    });
  }
}