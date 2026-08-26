const { supabase, isConfigured } = require('../config/supabase');
const { sendError } = require('../utils/response');

/**
 * Authentication Middleware
 * Validates Supabase JWT Bearer token and attaches verified user & role to req.user and req.role
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, {
        statusCode: 401,
        message: 'Authentication required: Missing or malformed Authorization header.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendError(res, {
        statusCode: 401,
        message: 'Authentication required: Token not provided.',
      });
    }

    // If Supabase is configured, verify token with Supabase Auth
    if (isConfigured) {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return sendError(res, {
          statusCode: 401,
          message: 'Invalid or expired authentication token.',
        });
      }

      // Query trusted profile record from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      req.user = {
        id: user.id,
        email: user.email,
        profileId: profile?.id || null,
        fullName: profile?.full_name || user.user_metadata?.full_name || 'Healthcare Citizen',
        role: profile?.role || user.user_metadata?.role || 'patient',
        assignedPhcId: profile?.assigned_phc_id || null,
        district: profile?.district || null,
      };
      req.role = req.user.role;

      return next();
    }

    // In local development mode without live Supabase connection:
    // Reject unverified / dummy tokens safely to preserve security guarantees
    return sendError(res, {
      statusCode: 401,
      message: 'Invalid or expired authentication token (Supabase auth required).',
    });

  } catch (err) {
    return sendError(res, {
      statusCode: 401,
      message: `Authentication error: ${err.message}`,
    });
  }
};

/**
 * Role-Based Authorization Middleware
 * Enforces allowed roles for protected routes
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.role) {
      return sendError(res, {
        statusCode: 401,
        message: 'Access forbidden: User not authenticated.',
      });
    }

    if (!allowedRoles.includes(req.role)) {
      return sendError(res, {
        statusCode: 403,
        message: `Access forbidden: Role '${req.role}' is not authorized for this operation. Required: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * If valid Bearer token provided, attaches verified user; otherwise attaches safe guest citizen context
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      if (token && isConfigured) {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (!error && user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          req.user = {
            id: user.id,
            email: user.email,
            profileId: profile?.id || null,
            fullName: profile?.full_name || user.user_metadata?.full_name || 'Healthcare Citizen',
            role: profile?.role || user.user_metadata?.role || 'patient',
            assignedPhcId: profile?.assigned_phc_id || null,
            district: profile?.district || null,
          };
          req.role = req.user.role;
          return next();
        }
      }
    }

    // Default safe guest citizen context
    req.user = {
      id: null,
      email: null,
      profileId: null,
      fullName: 'Healthcare Citizen',
      role: 'patient',
      assignedPhcId: null,
      district: 'Gadchiroli',
    };
    req.role = 'patient';
    return next();
  } catch (err) {
    req.user = {
      id: null,
      email: null,
      profileId: null,
      fullName: 'Healthcare Citizen',
      role: 'patient',
      assignedPhcId: null,
      district: 'Gadchiroli',
    };
    req.role = 'patient';
    return next();
  }
};

module.exports = {
  requireAuth,
  requireRole,
  optionalAuth,
};
