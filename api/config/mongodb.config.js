const mongoose = require("mongoose");

// Mongo DB Connection
const mongodbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL + "/event-management-app");
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = mongodbConnection;
