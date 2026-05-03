import logger from '#config/logger.js';
import { formatValidationError } from '#utils/format.js';
import { createUserBodySchema, updateUserBodySchema } from '#validations/user.validation.js';
import {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/user.service.js';
import { createUser } from '#services/auth.service.js';
import { ROLE_SUPER_ADMIN } from '#constants/roles.js';

const assertCanAssignSuperAdmin = (req, role) => {
  if (role === ROLE_SUPER_ADMIN && req.user?.role !== ROLE_SUPER_ADMIN) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }
};

export const index = async (req, res) => {
  try {
    const rows = await listUsers();
    return res.status(200).json({ users: rows });
  } catch (e) {
    logger.error('Error listing users', e);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const show = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ user });
  } catch (e) {
    logger.error('Error fetching user', e);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const store = async (req, res) => {
  try {
    const parsed = createUserBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(parsed.error),
      });
    }
    const data = parsed.data;
    assertCanAssignSuperAdmin(req, data.role);

    const user = await createUser(data);
    return res.status(201).json({ message: 'User created', user });
  } catch (e) {
    if (e.statusCode === 403) {
      return res.status(403).json({ error: e.message });
    }
    if (e.message === 'User with this email already exists') {
      return res.status(409).json({ error: e.message });
    }
    logger.error('Error creating user', e);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const parsed = updateUserBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: formatValidationError(parsed.error),
      });
    }
    const data = parsed.data;
    if (data.role !== undefined) assertCanAssignSuperAdmin(req, data.role);

    const existing = await getUserById(id);
    if (!existing) return res.status(404).json({ error: 'User not found' });

    try {
      const user = await updateUser(id, data);
      return res.status(200).json({ message: 'User updated', user });
    } catch (e) {
      if (e.message === 'User with this email already exists') {
        return res.status(409).json({ error: e.message });
      }
      throw e;
    }
  } catch (e) {
    if (e.statusCode === 403) {
      return res.status(403).json({ error: e.message });
    }
    logger.error('Error updating user', e);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const destroy = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    if (req.user?.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const removed = await deleteUser(id);
    if (!removed) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ message: 'User deleted' });
  } catch (e) {
    logger.error('Error deleting user', e);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
