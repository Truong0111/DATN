// const https = require("https");
// const fs = require("fs");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config({ path: "../.env" });
let PORT = process.env.PORT || 3000;

let routes = require("../BE/API/routes");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

function authMiddleware(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access token missing." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token." });
    req.user = user;
    next();
  });
}

routes(authMiddleware, app);

app.use(function (req, res) {
  res.status(404).send({ url: req.originalUrl + " not found" });
});

// const options = {
//     key: fs.readFileSync("./key/server.key"),
//     cert: fs.readFileSync("./key/server.cert"),
// };

// https.createServer(options, app).listen(3000, () => {
//     console.log("Secure server running on port 3000");
// });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
