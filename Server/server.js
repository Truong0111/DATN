const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("./winston");

require("dotenv").config({path: "../.env"});
require("./Service/FirebaseService");
require("./mqtt_client");

let routes = require("./API/routes");
const util = require("./utils");
const {serverFunction} = require("./Service/ServerService");

const HTTP_PORT = process.env.HTTP_PORT || 3000;

const app = express();
app.set('trust proxy', true);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

function authMiddleware(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        logger.warn(`Access token missing from ${req.ip}`);
        return res.status(401).json({message: "Access token missing."});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            logger.error(`Invalid token from ${user.ip}`);
            return res.status(403).json({message: "Invalid token."});
        }
        req.user = user;
        next();
    });
}

routes(authMiddleware, app);

setInterval(async () => {
    try {
        await serverFunction.scanTicket();
        await serverFunction.scanDoor();
    } catch (error) {
        logger.error("Error when do task:", error);
    }
}, util.getTimeInterval());

app.use(function (req, res) {
    logger.warn(`url: ${req.originalUrl} not found`)
    res.status(404).send({url: req.originalUrl + " not found"});
});

app.listen(HTTP_PORT, () =>{
    logger.info(`Server is running on port ${HTTP_PORT}`);
});