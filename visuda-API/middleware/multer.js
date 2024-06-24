const multer = require("multer");
const { fileDir } = require("../file_handler.cjs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, fileDir());
  },
  filename: function (req, file, cb) {
    const validMimeTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"), false);
    }
    const uniqueSuffix = Date.now().toString();
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage }).fields([
  { name: "foto_wajah", maxCount: 1 },
  { name: "scan_KTP", maxCount: 1 },
  { name: "scan_kartu_keluarga", maxCount: 1 },
]);

module.exports = upload;
