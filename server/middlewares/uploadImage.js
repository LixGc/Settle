const multer = require("multer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMulti = (fields) => {
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 1024 * 1024 * 10,
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith("image/")) {
                cb(null, true);
            } else {
                cb(new Error("Invalid file type. Only images are allowed."));
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

                    const results = await Promise.all(files.map((file) => uploadToCloudinary(file.buffer)));

                    // "images" can have many files, every other field has one
                    req[field] = field === "images" ? results.map((result) => result.secure_url) : results[0].secure_url;
                }
                next();
            } catch (error) {
                console.error("Error uploading to Cloudinary:", error);
                return res.status(500).json({ message: "Failed to upload images to Cloudinary" });
            }
        });
    };
};

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ resource_type: "auto" }, (error, result) => {
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