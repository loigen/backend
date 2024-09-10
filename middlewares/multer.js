const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "";
    if (file.fieldname === "profile_picture") {
      folder = "uploads/profile_pictures";
    } else if (file.fieldname === "receipt") {
      folder = "uploads/receipts";
    } else if (file.fieldname === "blog_photo") {
      folder = "uploads/blog_photos";
    } else if (file.fieldname === "qrCode") {
      folder = "uploads/qr_codes";
    } else if (file.fieldname === "refundReceipt") {
      folder = "uploads/refund_receipts";
    } else {
      return cb(new Error("Invalid file field name"));
    }
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const uploadProfilePicture = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Images Only!"));
    }
  },
});

const uploadReceipt = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|jpg|jpeg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: PDFs, JPGs, JPEGs, and PNGs Only!"));
    }
  },
});

const uploadRefundReceipt = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: PDFs, JPGs, JPEGs, and PNGs Only!"));
    }
  },
});

const uploadQRCode = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /png|jpg|jpeg/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: PNG, JPG, and JPEG QR Codes Only!"));
    }
  },
});

module.exports = {
  uploadProfilePicture,
  uploadReceipt,
  uploadRefundReceipt,
  uploadQRCode,
};
