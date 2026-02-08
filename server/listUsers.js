import mongoose from "mongoose";

async function listUsers() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Rmutr");
  const users = await mongoose.connection.db
    .collection("users")
    .find(
      {},
      {
        projection: {
          username: 1,
          email: 1,
          role: 1,
          firstName: 1,
          lastName: 1,
        },
      },
    )
    .toArray();
  console.log(JSON.stringify(users, null, 2));
  await mongoose.disconnect();
}

listUsers();
