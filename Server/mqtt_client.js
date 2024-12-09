// ----- MQTT -----
const mqtt = require("mqtt");
const brokerUrl = "mqtt://mqtt-broker:1883";
const {mqttFunction, mqttEmitter} = require("./Service/MqttService");

const optionsMqtt = {
    username: process.env.MQTT_Username,
    password: process.env.MQTT_Password,
};

const client = mqtt.connect(brokerUrl, optionsMqtt);

const topic = "door/qr";

client.on("connect", () => {
    console.log("Connecting to mqtt broker...");

    client.subscribe(topic, async (err) => {
        if (err) {
            console.error("Error subscribe topic:", err);
        } else {
            console.log("Subscribe topic:", topic);
        }
    });
});

client.on("message", async (topic, message) => {
    await mqttFunction.listenMessages(message.toString());
})

client.on("error", (error) => {
    console.error("Error when connect:", error);
});

mqttEmitter.on("publish", function (message) {
    client.publish(topic, message, (err) => {
        if (err) {
            console.error("Publish error:", err);
        }
    });
});
