const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Discussion = sequelize.define('Discussion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'discussions',
    timestamps: false
});

module.exports = Discussion;
