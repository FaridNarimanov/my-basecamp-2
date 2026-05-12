const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { uploadDir, ensureUploadDir } = require('../utils/projectCleanup');

ensureUploadDir();

const allowedAttachmentTypes = new Set(['image/png', 'image/jpeg', 'application/pdf', 'text/plain']);
const allowedAvatarTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
const allowedExtensionsByType = new Map([
    ['image/png', new Set(['.png'])],
    ['image/jpeg', new Set(['.jpg', '.jpeg'])],
    ['image/webp', new Set(['.webp'])],
    ['application/pdf', new Set(['.pdf'])],
    ['text/plain', new Set(['.txt'])]
]);
const maxUploadSize = 5 * 1024 * 1024;

const makeUpload = (allowedTypes, allowedLabel) => multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname || '').toLowerCase();
            cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`);
        }
    }),
    limits: { fileSize: maxUploadSize },
    fileFilter: (req, file, cb) => {
        if (!allowedTypes.has(file.mimetype)) {
            return cb(new Error(`Unsupported file type. Allowed types are ${allowedLabel}.`));
        }

        const ext = path.extname(file.originalname || '').toLowerCase();
        const allowedExtensions = allowedExtensionsByType.get(file.mimetype);
        if (!allowedExtensions || !allowedExtensions.has(ext)) {
            return cb(new Error('File extension does not match the uploaded file type.'));
        }

        cb(null, true);
    }
});

const attachmentUpload = makeUpload(allowedAttachmentTypes, 'PNG, JPG/JPEG, PDF, and TXT');
const avatarUpload = makeUpload(allowedAvatarTypes, 'PNG, JPEG/JPG, and WebP');
const handleAttachmentUpload = (req, res, next) => attachmentUpload.single('file')(req, res, next);
const handleAvatarUpload = (req, res, next) => avatarUpload.single('avatar')(req, res, next);

const uploadErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File is too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: 'File upload error.' });
    }

    if (err && err.message && (
        err.message.startsWith('Unsupported file type') ||
        err.message === 'File extension does not match the uploaded file type.'
    )) {
        return res.status(400).json({ message: err.message });
    }

    next(err);
};

module.exports = {
    handleAttachmentUpload,
    handleAvatarUpload,
    uploadErrorHandler
};
