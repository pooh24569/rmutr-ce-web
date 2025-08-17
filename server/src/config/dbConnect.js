const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    const uri = process.env.CONNECTION_STRING;
    if (!uri) throw new Error("Missing CONNECTION_STRING in .env");
    const conn = await mongoose.connect(uri);
    console.log(
      `Database connected: ${conn.connection.host}, ${conn.connection.name}`
    );
  } catch (err) {
    console.error("Mongo connect error:", err.message);
    process.exit(1);
  }
};

module.exports = dbConnect;
