const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    is_completed: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    tableName: 'tasks',
    timestamps: false
});

module.exports = Task;
