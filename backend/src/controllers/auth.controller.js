const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { sendSuccess } = require('../utils/response');

const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(googleClientId);

/**
 * Controller: Get authenticated user profile (/api/auth/me)
 */
const getMe = async (req, res) => {
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Authenticated profile retrieved successfully',
    data: {
      user: req.user,
      role: req.role,
      authenticatedAt: new Date().toISOString(),
    },
  });
};

/**
 * Controller: Verify Google ID token and issue application JWT (/api/auth/google)
 */
const googleAuth = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Google ID token is required',
    });
  }

  try {
    let payload;

    // 1. If client ID is configured, verify with Google servers
    if (googleClientId) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } else {
      // Decode payload for dev/testing when GOOGLE_CLIENT_ID is not configured yet
      payload = jwt.decode(token) || {
        sub: 'demo-google-id',
        email: 'google.user@example.com',
        name: 'Google User',
        picture: '',
      };
    }

    const { sub: googleId, email, name, picture } = payload;

    // 2. Generate application-specific JWT
    const jwtSecret = process.env.JWT_SECRET || 'jeevansetu-secure-jwt-secret-key-2026';
    const appToken = jwt.sign(
      {
        userId: googleId,
        email,
        name,
        role: 'patient',
        authProvider: 'google',
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: appToken,
      user: {
        id: googleId,
        name: name || 'Google User',
        email,
        picture: picture || '',
        role: 'patient',
      },
    });
  } catch (error) {
    console.error('Google token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid Google Token',
      error: error.message,
    });
  }
};

module.exports = {
  getMe,
  googleAuth,
};
