const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept images and PDFs only
    if (
        file.mimetype.startsWith('image/') ||
        file.mimetype === 'application/pdf'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Only images and PDF files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

/**
 * Upload file to Cloudinary
 */
const uploadToCloudinary = (fileBuffer, folder = 'organ-donor') => {
    // Development Bypass: If credentials are placeholders, return a mock response
    const isPlaceholder =
        process.env.CLOUDINARY_CLOUD_NAME === 'your-cloud-name' ||
        !process.env.CLOUDINARY_CLOUD_NAME;

    if (isPlaceholder) {
        console.warn('⚠️ Cloudinary not configured. Using development bypass/mock upload.');
        return Promise.resolve({
            url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
            publicId: 'placeholder_id_' + Date.now(),
        });
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                    });
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

/**
 * Delete file from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        throw error;
    }
};

module.exports = {
    cloudinary,
    upload,
    uploadToCloudinary,
    deleteFromCloudinary,
};
