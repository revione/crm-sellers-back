const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const conectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_MONGO);
    console.log('DB Connected');
  } catch (err) {
    console.log('There was a bug while connecting to DB: ');
    console.log(err);
    process.exit(1);
  }
};

module.exports = conectDB;
