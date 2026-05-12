const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.TEXT,
    email: { type: DataTypes.TEXT, unique: true },
    password: DataTypes.TEXT,
    role: { type: DataTypes.TEXT, defaultValue: 'user' },
    profile_pic: DataTypes.TEXT,
    username: { type: DataTypes.TEXT, unique: true }
}, {
    tableName: 'users',
    timestamps: false
});

module.exports = User;
