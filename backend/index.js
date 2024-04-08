const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db/connection");
const colors = require("colors");

const app = express();
app.use(express.json());
app.use(cors());

// PORT
const port = 5500;
app.listen(port, () => {
  console.log(colors.cyan(`Server is running on localhost:${port}`));
});
