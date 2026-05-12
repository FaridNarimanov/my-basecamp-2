const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Thread = sequelize.define('Thread', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: DataTypes.INTEGER,
    title: DataTypes.TEXT,
    created_by: DataTypes.INTEGER
}, {
    tableName: 'threads',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Thread;
