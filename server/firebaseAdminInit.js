// server/firebaseAdminInit.js
var admin = require("firebase-admin");

var serviceAccount = require("../../service-account-file.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ecommerce-website-project-demo-default-rtdb.asia-southeast1.firebasedatabase.app"
});
