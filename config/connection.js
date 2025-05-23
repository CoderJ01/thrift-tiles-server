const Sequelize = require('sequelize');

// connect to SQL
const sequelize = new Sequelize(
    process.env.DATABASE, 
    process.env.USER, 
    process.env.PASSWORD, 
    {
        host: process.env.HOST,
        dialect: 'mysql'
    }
);

module.exports = sequelize;