const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/connectionDB");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/", require("./routes/user"));
app.use("/", require("./routes/login"));
app.use("/", require("./routes/product"));
app.use("/", require("./routes/sale"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});