require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`
TaskFlow API  v1.0.0             
Running on port ${PORT}         
ENV: ${process.env.NODE_ENV || 'development'}
    `);
  });
}

start();
