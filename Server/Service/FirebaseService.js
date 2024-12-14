const admin = require("firebase-admin");
const logger = require("../winston");

const serviceAccount = require("../../key/serviceAccountKey.json");
const googleService = require("../../key/google-services.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: googleService.project_info.firebase_url,
    });
    logger.info('Initializing firebase service');
}
else{
    logger.debug("It's only 1 firebase service can be initialized");
}
