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

//LOGIN Endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  //Check if username and password are present
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and Password are required" });
  }

  //Query
  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], async (err, result) => {
    if (err || result.length === 0) {
      console.log("Error Searching for username: " + err);
    } else {
      //compare hashed password
      const match = await bcrypt.compare(password, result[0].password);
      if (match) {
        //create a jwt token
        const token = jwt.sign({ userId: result[0].id }, "my_secret_key", {
          expiresIn: "1h",
        });
        res.json({ message: "Login Successful", token });
      } else {
        res.status(401).json({ message: "Invalid Password" });
      }
    }
  });
});

// PORT
const port = 5500;
app.listen(port, () => {
  console.log(colors.cyan(`Server is running on localhost:${port}`));
});
