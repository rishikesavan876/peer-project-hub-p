const admin = require('firebase-admin');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require('../firebase-service-account.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

admin.firebaseAdminConfigured = true;

module.exports = admin;