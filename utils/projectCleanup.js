const fs = require('fs');
const path = require('path');
const { sequelize, Project, ProjectMember, Discussion, Task, Attachment, Thread, Message } = require('../models');

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

const destroyProjectWithRelatedData = async (projectId, ownerId = null) => {
    const projectWhere = ownerId ? { id: projectId, user_id: ownerId } : { id: projectId };
    const project = await Project.findOne({ where: projectWhere });
    if (!project) return false;

    const attachments = await Attachment.findAll({
        where: { project_id: projectId },
        attributes: ['file_path']
    });

    await sequelize.transaction(async (transaction) => {
        const threads = await Thread.findAll({
            where: { project_id: projectId },
            attributes: ['id'],
            transaction
        });
        const threadIds = threads.map((thread) => thread.id);

        if (threadIds.length > 0) {
            await Message.destroy({ where: { thread_id: threadIds }, transaction });
        }

        await Thread.destroy({ where: { project_id: projectId }, transaction });
        await Attachment.destroy({ where: { project_id: projectId }, transaction });
        await Task.destroy({ where: { project_id: projectId }, transaction });
        await Discussion.destroy({ where: { project_id: projectId }, transaction });
        await ProjectMember.destroy({ where: { project_id: projectId }, transaction });
        await Project.destroy({ where: projectWhere, transaction });
    });

    for (const attachment of attachments) {
        await safeDeleteUpload(attachment.file_path);
    }

    return true;
};

module.exports = {
    uploadDir,
    ensureUploadDir,
    safeDeleteUpload,
    cleanupProjectUploads,
    destroyProjectWithRelatedData
};
