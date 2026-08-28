const admin = require('../config/firebaseAdmin');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

const protect = async (req, res, next) => {
  try {
    if (!admin.firebaseAdminConfigured) {
      return next(
        new ErrorResponse('Firebase Admin credentials are not configured on the server', 503)
      );
    }

    const header = req.headers.authorization || '';

    if (!header.startsWith('Bearer ')) {
      return next(new ErrorResponse('Not authorized, no token provided', 401));
    }

    const idToken = header.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    let user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        $setOnInsert: {
          firebaseUid: uid,
          email: email || `${uid}@firebase.local`,
          displayName:
            name || (email ? email.split('@')[0] : 'Anonymous Dev'),
        },
        $set: picture ? { photoURL: picture } : {},
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    req.firebaseUser = decodedToken;
    req.user = user;
    next();
  } catch (error) {
  console.error('🔥 FIREBASE AUTH ERROR:', error);
  console.error('🔥 ERROR CODE:', error.code);
  console.error('🔥 ERROR MESSAGE:', error.message);

  next(new ErrorResponse('Not authorized, invalid or expired token', 401));
}
};

module.exports = { protect };
