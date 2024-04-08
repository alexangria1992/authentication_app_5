const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db/connection");
const colors = require("colors");

const app = express();
app.use(express.json());
app.use(cors());

//Registration Endpoint
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  //Match the password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);

  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(sql, [username, hashedPassword], (err, result) => {
    if (err) {
      console.log("Error in Registration:" + err);
    } else {
      res.json({ message: "Registration Successful" });
    }
  });
});

// PORT
const port = 5500;
app.listen(port, () => {
  console.log(colors.cyan(`Server is running on localhost:${port}`));
});
