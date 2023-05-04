import mongoose from "mongoose";
import { config } from "./config.js";

import app from "./app.js";

const PORT = 3000;

const connectDB = async () => {
  await mongoose
    .connect(config.MONGODB_URI)
    .then(() => console.log("Connecting to MongoDB..."));
};

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Database connection successful");
    });
  })
  .catch((error) => {
    console.log("Server not working. Error: " + error);
    process.exit(1);
  });
