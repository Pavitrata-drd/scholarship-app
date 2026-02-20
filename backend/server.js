const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend running with MongoDB");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log("Server running on port 5000");
});
