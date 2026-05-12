const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attachment = sequelize.define('Attachment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: DataTypes.INTEGER,
    file_name: DataTypes.TEXT,
    file_path: DataTypes.TEXT,
    uploaded_by: DataTypes.INTEGER,
    file_type: DataTypes.TEXT,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'attachments',
    timestamps: false
});

module.exports = Attachment;
