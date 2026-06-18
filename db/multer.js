const multer = require('@koa/multer');
const path = require('path');
const fs = require('fs/promises');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '..','public/','req_file')
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 限制
});

module.exports = upload;