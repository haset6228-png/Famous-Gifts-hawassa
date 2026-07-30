import cloudinary from 'cloudinary';

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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;
    
    // Check if image was provided
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log('Uploading to Cloudinary...');

    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload(image, {
      folder: 'famous-gifts',
      resource_type: 'auto',
    });

    console.log('Upload successful:', result.secure_url);

    // Return the uploaded image URL
    return res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ 
      error: error.message || 'Upload failed',
    });
  }
}