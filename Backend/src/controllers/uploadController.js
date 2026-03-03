const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Upload file to Cloudinary
// @route   POST /api/upload
// @access  Public
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check if Cloudinary credentials are present
    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
       try {
          // Attempt Upload to Cloudinary
          const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'auto', 
            folder: 'vssut_esports/rules',
          });

          // Cleanup local file
          if (fs.existsSync(req.file.path)) {
              fs.unlinkSync(req.file.path);
          }

          return res.status(200).json({
            url: result.secure_url,
            public_id: result.public_id,
            original_filename: req.file.originalname
          });
       } catch (cloudError) {
          console.warn('Cloudinary upload failed, falling back to local.', cloudError.message);
          // Fallthrough to local handling
       }
    }

    // Local file handling (fallback)
    // Construct local URL. using req.protocol and req.get('host') to build full URL
    const localUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.status(200).json({
      url: localUrl,
      original_filename: req.file.originalname,
      note: 'Stored locally'
    });

  } catch (error) {
    console.error('Upload Error:', error);
    // Try to cleanup local file if error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

module.exports = {
  uploadFile,
};
