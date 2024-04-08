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
      res.status(404).json({ message: "No username found" });
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

//Authentication Middlware using JWT
const authenticate = (req, res, next) => {
  const token = req.header("Authorization");
  console.log("Unextracted Token" + token);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const extractedToken = token.split(" ")[1];
  console.log("Actual Token: " + extractedToken);

  try {
    // Verify and Validate our token
    const decoded = jwt.verify(extractedToken, "my_secret_key");
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

app.get("/profile", authenticate, (req, res) => {
  const userId = req.userId;
  const sql = "SELECT * FROM users WHERE id = ?";
  db.query(sql, [userId], (err, result) => {
    if (err || result.length === 0) {
      res.status(500).json({ message: "Error fetching Details" });
    } else {
      res.json({ username: result[0].username });
    }
  });
});

//Product List Endpoint
app.get("/products", (req, res) => {
  const sql = "SELECT * FROM  products";
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error fetching Products" });
    } else {
      res.json(result);
    }
  });
});
// PORT
const port = 5500;
app.listen(port, () => {
  console.log(colors.cyan(`Server is running on localhost:${port}`));
});
