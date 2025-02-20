var express = require("express");
var router = express.Router();
var cors = require('cors');
var crypto = require('crypto');
var dotenv = require('dotenv');
var multer = require('multer');
var { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const MenuModel = require('../models/Menu');
var Jimp = require("jimp");

dotenv.config();

router.use(cors({ origin: '*' }));

// Configure Multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function processImage(buffer) {
    try {
        const image = await jimp.read(buffer);

        image
            .resize(400, 400)
            .quality(100);

        const processedBuffer = await image.getBufferAsync(jimp.MIME_JPEG);
        console.log('Image processed successfully');
        return processedBuffer;
    } catch (error) {
        console.error('Image processing error:', error);
        return buffer;
    }
}

router.post('/uploadImage', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { restaurantId, itemId } = req.body;

        if (!restaurantId || !itemId) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Resize image using Jimp
        const image = await Jimp.read(req.file.buffer);
        await image.cover(400, 400); // Resize and crop to cover 600x600
        const resizedImageBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

        const uniqueFileName = `${restaurantId}/${restaurantId}-${itemId}.jpg`;

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: uniqueFileName,
            Body: resizedImageBuffer, // Use the resized image buffer
            ContentType: 'image/jpeg',
        };

        const uploadCommand = new PutObjectCommand(uploadParams);
        await s3Client.send(uploadCommand);

        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;

        try {
            await MenuModel.findOneAndUpdate(
                { restaurantId: Number(restaurantId) },
                { $set: { "items.$[elem].image": fileUrl } },
                { arrayFilters: [{ "elem.id": Number(itemId) }] }
            );
        } catch (error) {
            console.error('Error updating menu:', error);
        }
        res.json({ success: true, fileUrl });
    } catch (error) {
        console.error('S3 Upload Error:', error);
        res.status(500).json({ success: false, error: 'Failed to upload image' });
    }
});

module.exports = router;