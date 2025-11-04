const path = require('path');

module.exports = {
  PORT: process.env.PORT || 3002,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  UPLOAD_DIR: process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(__dirname, 'uploads'),
  OUTPUT_DIR: process.env.OUTPUT_DIR ? path.resolve(process.env.OUTPUT_DIR) : path.join(__dirname, 'compressed'),
  ALLOWED_FORMATS: (process.env.ALLOWED_FORMATS || 'jpg,jpeg,png,webp,bmp,tiff').split(','),
  TARGET_SIZE: 470 * 1024, // 470KB em bytes
  QUALITY_STEPS: [100, 95, 90, 85, 75, 65, 55, 45, 35],
  WEBP_QUALITY_STEPS: [100, 95, 90, 80, 70, 60, 50, 40, 30]
};
