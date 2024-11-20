const admin = require("firebase-admin");

const serviceAccount = require("../../key/serviceAccountKey.json");
const googleService = require("../../key/google-services.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: googleService.project_info.firebase_url,
    });
}
