const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Discussion = require('./Discussion');
const Task = require('./Task');
const Attachment = require('./Attachment');
const Thread = require('./Thread');
const Message = require('./Message');

User.hasMany(Project, { as: 'ownedProjects', foreignKey: 'user_id' });
Project.belongsTo(User, { as: 'owner', foreignKey: 'user_id' });

Project.belongsToMany(User, {
    as: 'members',
    through: ProjectMember,
    foreignKey: 'project_id',
    otherKey: 'user_id'
});
User.belongsToMany(Project, {
    as: 'memberProjects',
    through: ProjectMember,
    foreignKey: 'user_id',
    otherKey: 'project_id'
});

Project.hasMany(ProjectMember, { as: 'memberLinks', foreignKey: 'project_id' });
ProjectMember.belongsTo(Project, { as: 'project', foreignKey: 'project_id' });
ProjectMember.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

Project.hasMany(Discussion, { as: 'discussions', foreignKey: 'project_id' });
Discussion.belongsTo(Project, { as: 'project', foreignKey: 'project_id' });
Discussion.belongsTo(User, { as: 'author', foreignKey: 'user_id' });

Project.hasMany(Task, { as: 'tasks', foreignKey: 'project_id' });
Task.belongsTo(Project, { as: 'project', foreignKey: 'project_id' });

Project.hasMany(Attachment, { as: 'attachments', foreignKey: 'project_id' });
Attachment.belongsTo(Project, { as: 'project', foreignKey: 'project_id' });
Attachment.belongsTo(User, { as: 'uploader', foreignKey: 'uploaded_by' });

Project.hasMany(Thread, { as: 'threads', foreignKey: 'project_id' });
Thread.belongsTo(Project, { as: 'project', foreignKey: 'project_id' });
Thread.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

Thread.hasMany(Message, { as: 'messages', foreignKey: 'thread_id' });
Message.belongsTo(Thread, { as: 'thread', foreignKey: 'thread_id' });
Message.belongsTo(User, { as: 'author', foreignKey: 'user_id' });

module.exports = {
    sequelize,
    User,
    Project,
    ProjectMember,
    Discussion,
    Task,
    Attachment,
    Thread,
    Message
};
