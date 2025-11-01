const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const socket = require("socket.io");
dotenv.config();

const { userRouter, groupRouter, messageRouter } = require("./routes");
const socketIO = require("./socket");

const app = express();
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL;

// middlewares
app.use(cors());
app.use(express.json());

// initialize socket
socketIO(io);

// routes
app.use("/api/users", userRouter);
app.use("/api/groups", groupRouter);
app.use("/api/messages", messageRouter);

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("Mongo DB connect successfully");
    server.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error connecting mongodb ", err);
  });
