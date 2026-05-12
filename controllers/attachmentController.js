const { Attachment, User } = require('../models');
const { getProjectAccess, isProjectAdmin } = require('../middleware/projectAccess');
const { cleanOriginalFileName } = require('../utils/validation');
const { safeDeleteUpload } = require('../utils/projectCleanup');

const listAttachments = async (req, res) => {
    try {
        const access = await getProjectAccess(req.params.id, req.session.userId);
        if (!access) return res.status(404).json({ message: 'Project not found' });

        const attachments = await Attachment.findAll({
            where: { project_id: req.params.id },
            include: [{ model: User, as: 'uploader', attributes: ['username', 'name'] }],
            order: [['created_at', 'DESC'], ['id', 'DESC']]
        });

        const rows = attachments.map((attachment) => {
            const data = attachment.toJSON();
            data.uploader_username = data.uploader ? data.uploader.username : '';
            data.uploader_name = data.uploader ? data.uploader.name : '';
            delete data.uploader;
            return data;
        });

        res.json({ attachments: rows, role: access.user_role, can_delete: access.can_manage });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

const createAttachment = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filePath = '/uploads/' + req.file.filename;

    try {
        await Attachment.create({
            project_id: req.params.id,
            file_name: cleanOriginalFileName(req.file.originalname),
            file_path: filePath,
            uploaded_by: req.session.userId,
            file_type: req.file.mimetype
        });
        res.status(201).json({ message: 'File uploaded successfully' });
    } catch (err) {
        await safeDeleteUpload(filePath);
        res.status(500).json({ message: 'Database error' });
    }
};

const deleteAttachment = async (req, res) => {
    try {
        const access = await getProjectAccess(req.params.id, req.session.userId);
        if (!access) return res.status(404).json({ message: 'Not found' });
        if (!isProjectAdmin(access, req.session.userId)) {
            return res.status(403).json({ message: 'Only project owner or admins can delete files.' });
        }

        const attachment = await Attachment.findOne({
            where: { id: req.params.attachmentId, project_id: req.params.id }
        });
        if (!attachment) return res.status(404).json({ message: 'File not found' });

        await safeDeleteUpload(attachment.file_path);
        await attachment.destroy();
        res.json({ message: 'File deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
};

module.exports = { listAttachments, createAttachment, deleteAttachment };
