const fs = require('fs');
const path = require('path');
const { Attachment } = require('../models');

const uploadDir = path.resolve(__dirname, '..', 'public', 'uploads');

const ensureUploadDir = () => {
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
};

const resolveUploadFilePath = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return null;
    const resolved = path.resolve(__dirname, '..', 'public', `.${filePath}`);
    return resolved.startsWith(uploadDir + path.sep) ? resolved : null;
};

const safeDeleteUpload = async (filePath) => {
    const resolved = resolveUploadFilePath(filePath);
    if (!resolved) return;

    try {
        await fs.promises.unlink(resolved);
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
    }
};

const cleanupProjectUploads = async (projectId) => {
    const attachments = await Attachment.findAll({
        where: { project_id: projectId },
        attributes: ['file_path']
    });

    for (const attachment of attachments) {
        await safeDeleteUpload(attachment.file_path);
    }
};

module.exports = {
    uploadDir,
    ensureUploadDir,
    safeDeleteUpload,
    cleanupProjectUploads
};
