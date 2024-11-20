const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config({path: "../.env"});
require("./Service/FirebaseService");

let routes = require("./API/routes");
const util = require("./utils");
const {serverFunction} = require("./ServerService");

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

let PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// ----- MQTT -----
// const mqtt = require("mqtt");
// const brokerUrl = "mqtt://mqtt-broker:1883";
//
// const options = {
//     username: process.env.MQTT_Username,
//     password: process.env.MQTT_Password,
// };
//
// const clientSend = mqtt.connect(brokerUrl, options);
// const clientGet = mqtt.connect(brokerUrl, options)
//
// const topic = "qr/door";
//
// const mqttService = require("./ServerFunction").mqttService;
//
// clientGet.on("connect", () => {
//     console.log("Connecting to mqtt broker... from get");
//
//     clientGet.subscribe(topic, async (err) => {
//         if (err) {
//             console.error("Error subscribe topic:", err);
//         } else {
//             console.log("Subscribe topic:", topic);
//         }
//     });
// });
//
// clientGet.on("message", async (topic, message) => {
//     mqttService.getMessage(`Get ${message.toString()} from get`);
// });
//
// clientGet.on("error", (error) => {
//     console.error("Error when connect:", error);
// });
//
// clientSend.on("connect",async () => {
//     console.log("Connected to mqtt broker... from send");
//     clientSend.publish(topic, "Alo from send");
// })
//
// clientSend.on("error", (error) => {
//     console.error("Error when connect:", error);
// });