const ErrorResponse = require('../utils/errorResponse');
const admin = require('../config/firebaseAdmin');

const requireOwner = async (req, res, next) => {
  try {
    if (!req.firebaseUser?.uid) {
      return next(new ErrorResponse('Not authorized', 401));
    }

    if (!admin.firebaseAdminConfigured) {
      return next(new ErrorResponse('Firebase Admin is not configured on the server', 500));
    }

    const snapshot = await admin.firestore().collection('users').doc(req.firebaseUser.uid).get();
    const role = snapshot.exists ? snapshot.data()?.role : 'user';

    if (role !== 'owner') {
      return next(new ErrorResponse('Owner access required', 403));
    }

    req.userRole = role;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireOwner };
