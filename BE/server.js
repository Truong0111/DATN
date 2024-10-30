// const https = require("https");
// const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser')

const dotenv = require("dotenv");
dotenv.config();
let PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

let routes  = require("./API/routes");
routes(app);

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
