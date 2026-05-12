const express = require('express');
const projectController = require('../controllers/projectController');
const memberController = require('../controllers/memberController');
const discussionController = require('../controllers/discussionController');
const taskController = require('../controllers/taskController');
const attachmentController = require('../controllers/attachmentController');
const { requireLogin } = require('../middleware/auth');
const { requireProjectAccess } = require('../middleware/projectAccess');
const { handleAttachmentUpload } = require('../middleware/upload');

const router = express.Router();

router.get('/', requireLogin, projectController.listProjects);
router.post('/', requireLogin, projectController.createProject);
router.get('/:id', requireLogin, requireProjectAccess, projectController.showProject);
router.get('/:id/details', requireLogin, requireProjectAccess, projectController.showProjectDetails);
router.put('/:id', requireLogin, requireProjectAccess, projectController.updateProject);
router.delete('/:id', requireLogin, projectController.deleteProject);

router.get('/:id/members', requireLogin, requireProjectAccess, memberController.listMembers);
router.post('/:id/members', requireLogin, requireProjectAccess, memberController.addMember);
router.delete('/:id/members/:username', requireLogin, requireProjectAccess, memberController.removeMember);
router.patch('/:id/members/:username/role', requireLogin, requireProjectAccess, memberController.updateMemberRole);

router.get('/:id/discussions', requireLogin, requireProjectAccess, discussionController.listDiscussions);
router.post('/:id/discussions', requireLogin, requireProjectAccess, discussionController.createDiscussion);

router.get('/:id/tasks', requireLogin, requireProjectAccess, taskController.listTasks);
router.post('/:id/tasks', requireLogin, requireProjectAccess, taskController.createTask);

router.get('/:id/attachments', requireLogin, requireProjectAccess, attachmentController.listAttachments);
router.post('/:id/attachments', requireLogin, requireProjectAccess, handleAttachmentUpload, attachmentController.createAttachment);
router.delete('/:id/attachments/:attachmentId', requireLogin, requireProjectAccess, attachmentController.deleteAttachment);

module.exports = router;
