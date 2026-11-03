const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("\n====================================================================");
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("Target URI:", process.env.MONGO_URI);
    console.error("\nTroubleshooting guide:");
    console.error("1. Local MongoDB: Make sure your MongoDB service or MongoDB Compass is active.");
    console.error("2. Free Cloud MongoDB Atlas:");
    console.error("   - Create a free cluster at https://www.mongodb.com/cloud/atlas");
    console.error("   - Add your connection string as MONGO_URI in server/.env");
    console.error("====================================================================\n");
    process.exit(1);
  }
};

module.exports = connectDB;