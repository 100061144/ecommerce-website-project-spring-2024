// server/middleware/isAdminMiddleware.js
const admin = require('firebase-admin');

async function isAdmin(req, res, next) {
  const idToken = req.headers.authorization;
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userRef = admin.database().ref(`users/${uid}`);
    userRef.once('value', (snapshot) => {
      const userData = snapshot.val();
      if (userData && userData.role === 'admin') {
        next();
      } else {
        res.status(403).send('Access denied');
      }
    });
  } catch (error) {
    res.status(403).send('Invalid token');
  }
}

module.exports = isAdmin;