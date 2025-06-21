const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');
const fs = require('fs');
const unlinkAsync = promisify(fs.unlink);

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Tải lên file lên Cloudinary
 * @param {string} filePath - Đường dẫn đến file cần tải lên
 * @param {string} folder - Thư mục lưu trữ trên Cloudinary
 * @returns {Promise<Object>} - Kết quả trả về từ Cloudinary
 */
const uploadToCloudinary = async (filePath, folder = 'misc') => {
  try {
    if (!filePath) return null;
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `${process.env.CLOUDINARY_FOLDER || 'customer_management'}/${folder}`,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      overwrite: true,
    });
    
    // Xóa file tạm sau khi tải lên thành công
    await unlinkAsync(filePath);
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    // Xóa file tạm nếu có lỗi
    if (fs.existsSync(filePath)) {
      await unlinkAsync(filePath).catch(console.error);
    }
    throw new Error('Lỗi khi tải lên hình ảnh');
  }
};

/**
 * Xóa file từ Cloudinary
 * @param {string} publicId - Public ID của file trên Cloudinary
 * @returns {Promise<Object>} - Kết quả trả về từ Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });
    
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Lỗi khi xóa hình ảnh');
  }
};

/**
 * Trích xuất public_id từ URL Cloudinary
 * @param {string} url - URL của ảnh trên Cloudinary
 * @returns {string} - Public ID của ảnh
 */
const extractPublicId = (url) => {
  if (!url) return null;
  
  // Lấy phần path của URL
  const urlParts = url.split('/');
  const folderAndFile = urlParts.slice(-2).join('/'); // Lấy 2 phần cuối (folder và file)
  const publicId = folderAndFile.split('.')[0]; // Bỏ đuôi file
  
  return publicId;
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
};
