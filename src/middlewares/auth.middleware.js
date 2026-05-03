import { cookies } from '#utils/cookies.js';
import { jwttoken } from '#utils/jwt.js';
import { ROLE_ADMIN, ROLE_SUPER_ADMIN } from '#constants/roles.js';

export const requireAuth = (req, res, next) => {
  const token = cookies.get(req, 'token');
  const payload = jwttoken.tryVerify(token);

  if (!payload || typeof payload.id === 'undefined') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  };
  next();
};

export const requireAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role !== ROLE_ADMIN && role !== ROLE_SUPER_ADMIN) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role !== ROLE_SUPER_ADMIN) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
