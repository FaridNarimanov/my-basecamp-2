const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    thread_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    content: DataTypes.TEXT
}, {
    tableName: 'messages',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Message;
