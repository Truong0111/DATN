const https = require("https");
const fs = require("fs");
const path = require('path');
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config({path: "../.env"});
require("./Service/FirebaseService");

let routes = require("./API/routes");
const util = require("./utils");
const {serverFunction, mqttFunction} = require("./ServerService");

const HTTP_PORT = process.env.HTTP_PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3001;
const HOST = '0.0.0.0'

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

function authMiddleware(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({message: "Access token missing."});

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({message: "Invalid token."});
        req.user = user;
        next();
    });
}

routes(authMiddleware, app);

async function scanTicketAndToken() {
    await serverFunction.scanTicket();
    await serverFunction.scanToken();
}

setInterval(async () => {
    try {
        await scanTicketAndToken();
    } catch (error) {
        console.error("Error when do task:", error);
    }
}, util.getTimeInterval());

app.use(function (req, res) {
    res.status(404).send({url: req.originalUrl + " not found"});
});


const keyPath = path.join(__dirname, '../key/server.key')
const certPath = path.join(__dirname, '../key/server.cert')
const serverKey = fs.readFileSync(keyPath);
const serverCert = fs.readFileSync(certPath);
const options = {
    key: serverKey,
    cert: serverCert,
};

https.createServer(options, app).listen(HTTPS_PORT, HOST);

app.listen(HTTP_PORT);

// ----- MQTT -----
// const mqtt = require("mqtt");
// const brokerUrl = "mqtt://mqtt-broker:1883";
//
// const optionsMqtt = {
//     username: process.env.MQTT_Username,
//     password: process.env.MQTT_Password,
// };
//
// const client = mqtt.connect(brokerUrl, optionsMqtt);
//
// const topic = "door/qr";
//
// client.on("connect", () => {
//     console.log("Connecting to mqtt broker...");
//
//     client.subscribe(topic, async (err) => {
//         if (err) {
//             console.error("Error subscribe topic:", err);
//         } else {
//             console.log("Subscribe topic:", topic);
//         }
//     });
// });
//
// client.on("message", (topic, message) => {
//     console.log(`${message.toString()}`);
//     // mqttService.getMessage(message.toString());
// })
//
// client.on("error", (error) => {
//     console.error("Error when connect:", error);
// });