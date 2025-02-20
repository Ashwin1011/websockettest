var express = require("express");
var router = express.Router();
var cors = require("cors");
var dotenv = require("dotenv");
var multer = require("multer");
var { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
var { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
var axios = require("axios");

dotenv.config();

router.use(cors({ origin: "*" }));

const upload = multer({ storage: multer.memoryStorage() });

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadImageToS3(buffer, fileName) {
  // Upload the file
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `temp/${fileName}`,
    Body: buffer,
    ContentType: "image/jpeg"
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  // Generate presigned URL
  const getObjectParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `temp/${fileName}`
  };
  
  // Generate a presigned URL that expires in 5 minutes
  const presignedUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand(getObjectParams),
    { expiresIn: 120 }
  );

  return presignedUrl;
}

async function deleteImageFromS3(fileName) {
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `temp/${fileName}`,
  };

  await s3Client.send(new DeleteObjectCommand(deleteParams));
}

router.post("/imageAnalysisWithS3", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const fileName = `image_${Date.now()}.jpg`;

    const imageUrl = await uploadImageToS3(req.file.buffer, fileName);

    const openaiApiUrl = process.env.OPENAI_API_URL;
    const openaiApiKey = process.env.OPENAI_KEY;
    
    if (!openaiApiKey) {
      throw new Error("OpenAI API key missing");
    }

    const requestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyse the image, the emotion that image depicts, the items it has, the food it has, the setting etc, make a summary of the image" },
            { type: "image_url", image_url: { url: String(imageUrl) } }
          ]
        }
      ],
      max_tokens: 100,
    };

    const openaiResponse = await axios.post(openaiApiUrl, requestBody, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
    });

    if (!openaiResponse.data || !openaiResponse.data.choices) {
      throw new Error("Invalid response from OpenAI");
    }

    const summary = openaiResponse.data.choices[0].message.content;
    
    // Delete the temporary image
    await deleteImageFromS3(fileName);

    res.json({ success: true, summary });
  } catch (error) {
    console.error("Error in imageAnalysisText:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.error?.message || error.message 
    });
  }
});

module.exports = router;