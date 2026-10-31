const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Photos are stored on Cloudinary, not on this server
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware for routes with photos. fields = which form fields to upload, like ["image", "images"]
const uploadMulti = (fields) => {
    const upload = multer({
        // Keep the files in memory just long enough to send them on. Images only, max 10MB each
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 1024 * 1024 * 10,
        },
        // An iPhone labels each photo with the type iOS works out from the file, and when it can't tell
        // it says "application/octet-stream". Let those through too, Cloudinary checks it's really a photo
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith("image/") || file.mimetype === "application/octet-stream") {
                cb(null, true);
            } else {
                cb(new Error(`Invalid file type (${file.mimetype}). Only images are allowed.`));
            }
        },
    }).fields([
        { name: "idCard", maxCount: 1 },
        { name: "profilePicture", maxCount: 1 },
        { name: "image", maxCount: 1 },
        { name: "images", maxCount: 10 },
    ]);

    return (req, res, next) => {
        upload(req, res, async (err) => {
            if (err) {
                console.error("Error uploading images:", err);
                return res.status(400).json({ message: "Failed to upload images" });
            }

            try {
                for (const field of fields) {
                    const files = req.files && req.files[field];
                    if (!files) continue;

                    // Upload all the files at once and wait for every link
                    const results = await Promise.all(files.map((file) => uploadToCloudinary(file.buffer)));

                    // "images" can have many files, every other field has one
                    req[field] = field === "images" ? results.map((result) => result.secure_url) : results[0].secure_url;
                }
                next();
            } catch (error) {
                console.error("Error uploading to Cloudinary:", error);
                // Cloudinary answers 400 when the file isn't a photo after all
                if (error.http_code === 400) {
                    return res.status(400).json({ message: "Failed to upload images" });
                }
                return res.status(500).json({ message: "Failed to upload images to Cloudinary" });
            }
        });
    };
};

// Sends one file to Cloudinary and gives back its details (we use secure_url)
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            // Only real photos, and every photo is saved as a JPG, so an iPhone's HEIC photos show on Android too
            .upload_stream({ resource_type: "image", format: "jpg" }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            })
            .end(buffer);
    });
};

module.exports = uploadMulti;