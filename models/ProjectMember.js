const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProjectMember = sequelize.define('ProjectMember', {
    project_id: { type: DataTypes.INTEGER, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    role: DataTypes.TEXT
}, {
    tableName: 'project_members',
    timestamps: false
});

module.exports = ProjectMember;
