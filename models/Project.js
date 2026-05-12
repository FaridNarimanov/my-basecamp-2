const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.TEXT,
    description: DataTypes.TEXT,
    user_id: DataTypes.INTEGER
}, {
    tableName: 'projects',
    timestamps: false
});

module.exports = Project;
