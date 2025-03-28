const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class User extends Model {}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        street: {
            type: DataTypes.STRING,
        },
        state: {
            type: DataTypes.STRING,
        },
        zipcode: {
            type: DataTypes.STRING,
        },
        hashed_cookie: {
            type: DataTypes.STRING,
        },
        // e.g. employee
        admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        // e.g. manager
        master_admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        sequelize,
        timestamps: true,
        freezeTableName: true,
        underscored: true,
        modelName: 'user'
    }
);

module.exports = User;