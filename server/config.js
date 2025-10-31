module.exports = {
  PORT: process.env.PORT || 3002,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  OUTPUT_DIR: process.env.OUTPUT_DIR || 'compressed',
  ALLOWED_FORMATS: (process.env.ALLOWED_FORMATS || 'jpg,jpeg,png,webp,bmp,tiff').split(','),
  TARGET_SIZE: 470 * 1024, // 470KB em bytes
  QUALITY_STEPS: [95, 85, 75, 65, 55, 45, 35, 25, 15],
  WEBP_QUALITY_STEPS: [90, 80, 70, 60, 50, 40, 30, 20, 10]
};
