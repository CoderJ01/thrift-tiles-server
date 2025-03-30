// Express.js 
const express = require('express');

// dotenv
require('dotenv').config();

// Sequelize connection
const sequelize = require('./config/connection');

// other imports
const routes = require('./routes/index');

const app = express();
const PORT = 3001;

app.use(express.json());

let allowed_frontend_url = '';

if(process.env.NODE_ENV === 'development') {
  allowed_frontend_url = process.env.LOCALHOST;
}
else if(process.env.NODE_ENV === 'production') {
  allowed_frontend_url = process.env.DEPLOYED_FRONTEND_URL;
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', allowed_frontend_url); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); 
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
  next();
});

app.use('/api', routes);

// integrate object-relational mapper (i.e. Sequelize) with Express
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, console.log(`Listening on PORT ${PORT}...`));
});

module.exports = app;